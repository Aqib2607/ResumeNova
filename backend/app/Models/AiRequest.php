<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiRequest extends Model
{
    protected $fillable = [
        'user_id',
        'endpoint',
        'date',
        'calls',
    ];

    protected $casts = [
        'date' => 'date',
    ];
}
