<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CandidateSkill extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'proficiency_level', // 'beginner', 'intermediate', 'advanced', 'expert'
        'years_experience',
        'is_verified',
    ];

    protected $casts = [
        'years_experience' => 'decimal:1',
        'is_verified' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
