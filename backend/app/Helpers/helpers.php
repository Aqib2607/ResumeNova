<?php

declare(strict_types=1);

/**
 * ResumeNova global helper functions.
 *
 * This file is auto-loaded by Composer (see composer.json → autoload.files).
 * Keep helpers lean – complex logic belongs in Service classes.
 */

if (! function_exists('rn_currency')) {
    /**
     * Format a number as currency string.
     *
     * @param  float  $amount
     * @param  string $currency  ISO 4217 symbol (default USD)
     * @param  int    $decimals
     */
    function rn_currency(float $amount, string $currency = 'USD', int $decimals = 2): string
    {
        return $currency . ' ' . number_format($amount, $decimals);
    }
}

if (! function_exists('rn_initials')) {
    /**
     * Return up to 2 initials from a full name.
     *
     * @param  string $name
     */
    function rn_initials(string $name): string
    {
        $words = array_filter(explode(' ', trim($name)));
        $initials = array_map(fn ($w) => strtoupper($w[0]), $words);

        return implode('', array_slice($initials, 0, 2));
    }
}

if (! function_exists('rn_excerpt')) {
    /**
     * Truncate a string to a maximum length and append ellipsis.
     *
     * @param  string $text
     * @param  int    $length
     * @param  string $end
     */
    function rn_excerpt(string $text, int $length = 160, string $end = '…'): string
    {
        if (mb_strlen($text) <= $length) {
            return $text;
        }

        return rtrim(mb_substr($text, 0, $length)) . $end;
    }
}

if (! function_exists('rn_is_admin')) {
    /**
     * Check whether the currently authenticated user has the admin role.
     */
    function rn_is_admin(): bool
    {
        /** @var \App\Models\User|null $user */
        $user = auth()->user();

        return $user?->role === 'admin' ?? false;
    }
}
