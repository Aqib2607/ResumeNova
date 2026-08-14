<?php

declare(strict_types=1);

namespace App\Services\Export;

use Barryvdh\DomPDF\Facade\Pdf;

class PdfExportService
{
    /**
     * Generate binary PDF content from HTML string.
     */
    public function generatePdfFromHtml(string $html): string
    {
        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('a4', 'portrait');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
            'defaultFont' => 'sans-serif',
            'dpi' => 150,
        ]);

        return $pdf->output();
    }
}
