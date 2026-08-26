<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_posting_id',
        'url',
        'provider_type',
        'clicks',
    ];

    protected $casts = [
        'clicks' => 'integer',
    ];

    public function posting()
    {
        return $this->belongsTo(JobPosting::class, 'job_posting_id');
    }
}
