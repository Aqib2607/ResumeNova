<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'job_posting_id',
        'resume_id',
        'status', // 'draft', 'submitted', 'reviewing', 'interviewing', 'offered', 'rejected', 'withdrawn'
        'applied_at',
        'notes',
        'metadata', // json
    ];

    protected $casts = [
        'applied_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function posting()
    {
        return $this->belongsTo(JobPosting::class, 'job_posting_id');
    }

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }
}
