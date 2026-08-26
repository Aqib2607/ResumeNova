<?php

declare(strict_types=1);

namespace App\Services\AI;

class PrivacyStripper
{
    /**
     * Strips Personally Identifiable Information (PII) from text.
     * Replaces emails, phone numbers, and URLs.
     * 
     * @param string|null $text
     * @return string
     */
    public static function strip(?string $text): string
    {
        if (empty($text)) {
            return '';
        }

        // 1. Remove emails
        $text = preg_replace('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i', '[EMAIL REMOVED]', $text);

        // 2. Remove Phone numbers (generic formats)
        $text = preg_replace('/(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/', '[PHONE REMOVED]', $text);

        // 3. Remove URLs/Links (like LinkedIn profiles, personal sites)
        $text = preg_replace('/https?:\/\/[^\s]+/i', '[LINK REMOVED]', $text);
        
        // 4. Remove standard domain names like www.example.com or example.com (basic)
        $text = preg_replace('/(?:www\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i', '[LINK REMOVED]', $text);

        return trim($text);
    }
}
