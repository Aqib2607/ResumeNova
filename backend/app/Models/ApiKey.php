<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiKey extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'masked_key',
        'key',
        'status',
    ];

    /**
     * Never expose the raw key in API responses.
     */
    protected $hidden = ['key', 'user_id'];
}
