<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavedJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'job_posting_id',
        'notes',
        'status', // 'saved', 'applied', 'interviewing', 'offered', 'rejected', 'archived'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function posting()
    {
        return $this->belongsTo(JobPosting::class, 'job_posting_id');
    }
}
