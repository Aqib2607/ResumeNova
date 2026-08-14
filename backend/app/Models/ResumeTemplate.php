<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResumeTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'category',
        'thumbnail',
        'description',
        'is_active',
        'is_premium',
        'usage_count',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_premium' => 'boolean',
        'usage_count' => 'integer',
    ];
}
