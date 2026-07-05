<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'role',
        'last_login_at',
        'email_verified_at',
        'suspended_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at'     => 'datetime',
            'suspended_at'      => 'datetime',
            'password'          => 'hashed',
            'role'              => UserRole::class,
        ];
    }

    // ──────────────────────────────────────────────────────────────
    // Helper Methods
    // ──────────────────────────────────────────────────────────────

    /**
     * Determine whether this user registered via Google OAuth
     * (i.e. has no local password).
     */
    public function isOAuthUser(): bool
    {
        return ! is_null($this->google_id);
    }

    /**
     * Determine whether this user has the super admin role.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === UserRole::SuperAdmin;
    }

    /**
     * Determine whether this user has the admin role (or higher).
     */
    public function isAdmin(): bool
    {
        return in_array($this->role, [UserRole::Admin, UserRole::SuperAdmin], true);
    }

    /**
     * Check if the user has a specific role.
     */
    public function hasRole(UserRole $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if the user is suspended.
     */
    public function isSuspended(): bool
    {
        return ! is_null($this->suspended_at);
    }

    /**
     * Touch the last_login_at timestamp.
     * Call this on every successful login.
     */
    public function recordLogin(): void
    {
        $this->timestamps = false;
        $this->update(['last_login_at' => now()]);
        $this->timestamps = true;
    }

    /**
     * Return the user's avatar URL, falling back to a Gravatar-style placeholder.
     */
    public function avatarUrl(): string
    {
        if ($this->avatar) {
            return $this->avatar;
        }

        $hash = md5(strtolower(trim($this->email)));

        return "https://www.gravatar.com/avatar/{$hash}?d=mp&s=80";
    }

    /**
     * Get the role audit logs for this user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<\App\Models\RoleAuditLog, $this>
     */
    public function roleAuditLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RoleAuditLog::class);
    }

    /**
     * Get the general audit logs for this user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<\App\Models\AuditLog, $this>
     */
    public function auditLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * Get the user's profile.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne<\App\Models\Profile, $this>
     */
    public function profile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Profile::class);
    }
}
