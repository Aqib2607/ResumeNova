<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobMatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'job_posting_id',
        'match_score',
        'match_reasoning',
        'matched_skills',
        'missing_skills',
        'is_dismissed',
    ];

    protected $casts = [
        'match_score' => 'integer',
        'matched_skills' => 'array',
        'missing_skills' => 'array',
        'is_dismissed' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function posting()
    {
        return $this->belongsTo(JobPosting::class, 'job_posting_id');
    }

    public function job()
    {
        return $this->belongsTo(JobPosting::class, 'job_posting_id');
    }

    public function jobPosting()
    {
        return $this->belongsTo(JobPosting::class, 'job_posting_id');
    }
}
