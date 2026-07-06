<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AtsAnalysis extends Model
{
    protected $fillable = [
        'user_id',
        'resume_id',
        'score',
        'feedback',
    ];

    protected $casts = [
        'feedback' => 'array',
    ];
}
