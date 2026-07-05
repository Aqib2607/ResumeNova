<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsDaily extends Model
{
    protected $fillable = [
        'date',
        'active_users',
        'new_users',
        'page_views',
    ];

    protected $casts = [
        'date' => 'date',
    ];
}
