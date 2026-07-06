<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resume extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'version',
        'content',
    ];

    protected $casts = [
        'content' => 'array',
    ];
}
