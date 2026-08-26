<?php

declare(strict_types=1);

namespace App\Services;

use PhpOffice\PhpWord\Element\AbstractContainer;
use PhpOffice\PhpWord\Element\AbstractElement;
use PhpOffice\PhpWord\Element\ListItemRun;
use PhpOffice\PhpWord\Element\Row;
use PhpOffice\PhpWord\Element\Table;
use PhpOffice\PhpWord\Element\Text;
use PhpOffice\PhpWord\Element\TextRun;
use PhpOffice\PhpWord\IOFactory;
use RuntimeException;
use Smalot\PdfParser\Parser as PdfParser;
use Throwable;

class ResumeFileExtractorService
{
    /**
     * Minimum valid characters required to consider text extraction successful.
     * Documents with less text are typically scanned images or corrupted files.
     */
    public const MIN_EXTRACTED_LENGTH = 50;

    /**
     * Extract plain text from an uploaded resume file path.
     *
     * @param string $absoluteFilePath Full absolute path to file on disk
     * @param string|null $extension File extension (pdf, docx, doc)
     * @return string Extracted UTF-8 plain text
     * @throws RuntimeException
     */
    public function extractText(string $absoluteFilePath, ?string $extension = null): string
    {
        if (!file_exists($absoluteFilePath)) {
            throw new RuntimeException("Resume file not found at [{$absoluteFilePath}].");
        }

        $ext = strtolower($extension ?: pathinfo($absoluteFilePath, PATHINFO_EXTENSION));

        $text = match ($ext) {
            'pdf' => $this->extractFromPdf($absoluteFilePath),
            'docx' => $this->extractFromDocx($absoluteFilePath),
            'doc' => $this->extractFromDocx($absoluteFilePath),
            default => throw new RuntimeException("Unsupported resume file format [{$ext}]. Please upload a PDF or DOCX file."),
        };

        // Clean up whitespace and control characters
        $cleaned = $this->sanitizeText($text);

        if (mb_strlen(trim($cleaned)) < self::MIN_EXTRACTED_LENGTH) {
            throw new RuntimeException(
                "Could not extract sufficient text from this document. The file might be an image-only/scanned PDF, empty, or password protected. Please use a text-based PDF or DOCX, or build your resume manually."
            );
        }

        return $cleaned;
    }

    /**
     * Extract text from PDF file using Smalot\PdfParser with fallback stream reader.
     */
    protected function extractFromPdf(string $filePath): string
    {
        // Defensive autoloader fallback in case Composer runtime map is not refreshed
        if (!class_exists(PdfParser::class)) {
            $fallbackFile = base_path('vendor/smalot/pdfparser/src/Smalot/PdfParser/Parser.php');
            if (file_exists($fallbackFile)) {
                spl_autoload_register(function ($class) {
                    $prefix = 'Smalot\\PdfParser\\';
                    if (str_starts_with($class, $prefix)) {
                        $relativeClass = substr($class, strlen($prefix));
                        $file = base_path('vendor/smalot/pdfparser/src/Smalot/PdfParser/' . str_replace('\\', '/', $relativeClass) . '.php');
                        if (file_exists($file)) {
                            require_once $file;
                        }
                    }
                });
            }
        }

        try {
            if (class_exists(PdfParser::class)) {
                $parser = new PdfParser();
                $pdf = $parser->parseFile($filePath);
                $text = $pdf->getText();

                if (empty($text)) {
                    // Try page-by-page extraction if document-level text is empty
                    $pages = $pdf->getPages();
                    $pageTexts = [];
                    foreach ($pages as $page) {
                        $pageTexts[] = $page->getText();
                    }
                    $text = implode("\n\n", $pageTexts);
                }

                if (!empty(trim($text))) {
                    return $text;
                }
            }

            // Secondary fallback: stream inspection
            $fallback = $this->extractFromPdfStreamFallback($filePath);
            if (!empty($fallback)) {
                return $fallback;
            }

            throw new RuntimeException("No readable text found in PDF file.");
        } catch (Throwable $e) {
            // Check fallback before failing
            $fallback = $this->extractFromPdfStreamFallback($filePath);
            if (!empty(trim($fallback)) && mb_strlen(trim($fallback)) >= self::MIN_EXTRACTED_LENGTH) {
                return $fallback;
            }

            throw new RuntimeException(
                "Failed to parse PDF document: " . $e->getMessage(),
                0,
                $e
            );
        }
    }

    /**
     * Fallback stream text extraction for simple or raw PDFs.
     */
    protected function extractFromPdfStreamFallback(string $filePath): string
    {
        $content = @file_get_contents($filePath);
        if ($content === false || empty($content)) {
            return '';
        }

        $text = '';
        if (preg_match_all('/\((.*?)\)\s*T[jJ]/s', $content, $matches)) {
            $text = implode(' ', $matches[1]);
        }

        return trim($text);
    }

    /**
     * Extract text from DOCX file using PhpOffice\PhpWord.
     */
    protected function extractFromDocx(string $filePath): string
    {
        try {
            $phpWord = IOFactory::load($filePath, 'Word2007');
            $textParts = [];

            foreach ($phpWord->getSections() as $section) {
                $this->extractElementsText($section, $textParts);
            }

            return implode("\n", $textParts);
        } catch (Throwable $e) {
            // Fallback: try raw zip XML extraction if phpword standard load fails
            $fallback = $this->extractFromDocxZipFallback($filePath);
            if (!empty($fallback)) {
                return $fallback;
            }

            throw new RuntimeException(
                "Failed to parse DOCX document: " . $e->getMessage(),
                0,
                $e
            );
        }
    }

    /**
     * Recursively walk PhpWord elements to extract text.
     */
    protected function extractElementsText(AbstractContainer|AbstractElement $element, array &$textParts): void
    {
        if ($element instanceof Text) {
            $textParts[] = $element->getText();
        } elseif ($element instanceof TextRun || $element instanceof ListItemRun) {
            $runText = '';
            foreach ($element->getElements() as $child) {
                if ($child instanceof Text) {
                    $runText .= $child->getText();
                }
            }
            if (!empty(trim($runText))) {
                $textParts[] = $runText;
            }
        } elseif ($element instanceof Table) {
            foreach ($element->getRows() as $row) {
                if ($row instanceof Row) {
                    $rowTexts = [];
                    foreach ($row->getCells() as $cell) {
                        $cellParts = [];
                        $this->extractElementsText($cell, $cellParts);
                        $rowTexts[] = implode(' ', $cellParts);
                    }
                    $textParts[] = implode(' | ', array_filter($rowTexts));
                }
            }
        } elseif (method_exists($element, 'getElements')) {
            foreach ($element->getElements() as $child) {
                $this->extractElementsText($child, $textParts);
            }
        }
    }

    /**
     * Direct XML fallback for DOCX files using standard ZipArchive.
     */
    protected function extractFromDocxZipFallback(string $filePath): ?string
    {
        if (!class_exists('ZipArchive')) {
            return null;
        }

        $zip = new \ZipArchive();
        if ($zip->open($filePath) !== true) {
            return null;
        }

        $xmlIndex = $zip->locateName('word/document.xml');
        if ($xmlIndex === false) {
            $zip->close();
            return null;
        }

        $xmlContent = $zip->getFromIndex($xmlIndex);
        $zip->close();

        if (!$xmlContent) {
            return null;
        }

        // Strip XML tags preserving whitespace
        $cleanXml = preg_replace('/<w:p[^>]*>/i', "\n", $xmlContent);
        $cleanXml = preg_replace('/<w:br[^>]*>/i', "\n", $cleanXml);
        $cleanXml = strip_tags($cleanXml);

        return html_entity_decode($cleanXml, ENT_QUOTES | ENT_XML1, 'UTF-8');
    }

    /**
     * Sanitize extracted text to clean UTF-8 string with standardized linebreaks.
     */
    protected function sanitizeText(string $text): string
    {
        // Normalize linebreaks
        $text = str_replace(["\r\n", "\r"], "\n", $text);

        // Remove illegal non-printable control characters, but keep newlines and tabs
        $text = preg_replace('/[^\P{C}\n\t]+/u', '', $text) ?? $text;

        // Collapse excessive newlines (max 2 consecutive)
        $text = preg_replace('/\n{3,}/', "\n\n", $text) ?? $text;

        return trim($text);
    }
}
