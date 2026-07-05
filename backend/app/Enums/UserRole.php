<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * User roles for ResumeNova.
 *
 * Hierarchy (highest → lowest):
 *   SUPER_ADMIN > ADMIN > USER
 */
enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Admin      = 'admin';
    case User       = 'user';

    // ──────────────────────────────────────────────────────────────
    // Labels
    // ──────────────────────────────────────────────────────────────

    /** Human-readable label. */
    public function label(): string
    {
        return match ($this) {
            UserRole::SuperAdmin => 'Super Administrator',
            UserRole::Admin      => 'Administrator',
            UserRole::User       => 'User',
        };
    }

    /** Badge colour for UI display. */
    public function badgeClass(): string
    {
        return match ($this) {
            UserRole::SuperAdmin => 'bg-purple-100 text-purple-800',
            UserRole::Admin      => 'bg-blue-100 text-blue-800',
            UserRole::User       => 'bg-gray-100 text-gray-700',
        };
    }

    // ──────────────────────────────────────────────────────────────
    // Hierarchy
    // ──────────────────────────────────────────────────────────────

    /** Numeric weight — higher = more privileged. */
    public function weight(): int
    {
        return match ($this) {
            UserRole::SuperAdmin => 100,
            UserRole::Admin      => 50,
            UserRole::User       => 10,
        };
    }

    /**
     * True if this role is strictly more privileged than $other.
     */
    public function isHigherThan(UserRole $other): bool
    {
        return $this->weight() > $other->weight();
    }

    /**
     * True if this role can manage (assign, suspend, modify) $other.
     *
     * Business rules:
     *   - SUPER_ADMIN can manage any role.
     *   - ADMIN can manage USER only.
     *   - USER cannot manage anyone.
     */
    public function canManage(UserRole $other): bool
    {
        return $this->isHigherThan($other);
    }

    // ──────────────────────────────────────────────────────────────
    // Utilities
    // ──────────────────────────────────────────────────────────────

    /**
     * All role values as a plain array (for validation rules).
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Roles that an ADMIN is permitted to assign to others.
     *
     * @return list<string>
     */
    public static function adminAssignableValues(): array
    {
        return [self::User->value, self::Admin->value];
    }
}
