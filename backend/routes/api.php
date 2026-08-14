<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ── Auth Routes (Guest) ──────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::post('register', [RegisteredUserController::class, 'store'])
        ->middleware('throttle:10,1');

    Route::post('login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:10,1');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->middleware('throttle:3,1')
        ->name('password.email');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('password.store');

    Route::get('auth/google', [GoogleController::class, 'redirect'])
        ->name('auth.google');

    Route::get('auth/google/callback', [GoogleController::class, 'callback'])
        ->name('auth.google.callback');
});

// ── Auth Routes (Authenticated) ──────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store'])
        ->middleware('throttle:5,1');

    Route::put('password', [PasswordController::class, 'update'])
        ->name('password.update');
    Route::patch('password', [PasswordController::class, 'update']);
    Route::patch('user/password', [PasswordController::class, 'update']);

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});

// ── App Routes ────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'user.active'])->group(function () {
    // Standard Sanctum /user endpoint
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Legacy /auth/me alias
    Route::get('/auth/me', function (Request $request) {
        return $request->user();
    });

    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index']);
    Route::get('/dashboard/statistics', [\App\Http\Controllers\DashboardController::class, 'statistics']);
    Route::get('/dashboard/chart', [\App\Http\Controllers\DashboardController::class, 'chart']);
    Route::get('/dashboard/recent-resumes', [\App\Http\Controllers\DashboardController::class, 'recentResumes']);
    Route::get('/dashboard/recent-exports', [\App\Http\Controllers\DashboardController::class, 'recentExports']);
    Route::get('/dashboard/api-keys', [\App\Http\Controllers\DashboardController::class, 'apiKeys']);

    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'index']);
    Route::patch('/profile', [\App\Http\Controllers\ProfileController::class, 'update']);

    Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'index']);
    Route::patch('/settings/account', [\App\Http\Controllers\SettingsController::class, 'updateAccount']);
    Route::delete('/settings/account', [\App\Http\Controllers\SettingsController::class, 'destroy']);

    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);

    // ── Resumes ───────────────────────────────────────────────────────────
    Route::get('/resumes', [\App\Http\Controllers\ResumeController::class, 'index']);
    Route::post('/resumes', [\App\Http\Controllers\ResumeController::class, 'store']);
    Route::get('/resumes/{resume}', [\App\Http\Controllers\ResumeController::class, 'show']);
    Route::put('/resumes/{resume}', [\App\Http\Controllers\ResumeController::class, 'update']);
    Route::patch('/resumes/{resume}', [\App\Http\Controllers\ResumeController::class, 'update']);
    Route::delete('/resumes/{resume}', [\App\Http\Controllers\ResumeController::class, 'destroy']);
    Route::post('/resumes/{resume}/duplicate', [\App\Http\Controllers\ResumeController::class, 'duplicate']);
    Route::get('/resumes/{resume}/versions', [\App\Http\Controllers\ResumeController::class, 'versions']);
    Route::post('/resumes/{resume}/versions/{version}/restore', [\App\Http\Controllers\ResumeController::class, 'restoreVersion']);

    // ── AI Resume Generation ───────────────────────────────────────────────
    Route::post('/resumes/{resume}/ai/summary', [\App\Http\Controllers\AIResumeController::class, 'summary'])->middleware('throttle:ai');
    Route::post('/resumes/{resume}/ai/experience', [\App\Http\Controllers\AIResumeController::class, 'experience'])->middleware('throttle:ai');
    Route::post('/resumes/{resume}/ai/project', [\App\Http\Controllers\AIResumeController::class, 'project'])->middleware('throttle:ai');
    Route::post('/resumes/{resume}/ai/skills', [\App\Http\Controllers\AIResumeController::class, 'skills'])->middleware('throttle:ai');

    // ── API Keys ──────────────────────────────────────────────────────────
    Route::get('/api-keys', [\App\Http\Controllers\ApiKeyController::class, 'index']);
    Route::post('/api-keys', [\App\Http\Controllers\ApiKeyController::class, 'store']);
    Route::post('/api-keys/reorder', [\App\Http\Controllers\ApiKeyController::class, 'reorder']);
    Route::get('/api-keys/{apiKey}', [\App\Http\Controllers\ApiKeyController::class, 'show']);
    Route::put('/api-keys/{apiKey}', [\App\Http\Controllers\ApiKeyController::class, 'update']);
    Route::patch('/api-keys/{apiKey}', [\App\Http\Controllers\ApiKeyController::class, 'update']);
    Route::delete('/api-keys/{apiKey}', [\App\Http\Controllers\ApiKeyController::class, 'destroy']);
    Route::post('/api-keys/{apiKey}/test', [\App\Http\Controllers\ApiKeyController::class, 'test']);

    // ── ATS Analyzer ──────────────────────────────────────────────────────
    Route::get('/ats', [\App\Http\Controllers\AtsController::class, 'history']);
    Route::post('/ats/analyze', [\App\Http\Controllers\AtsController::class, 'analyze'])->middleware('throttle:ai');
    Route::get('/ats/history', [\App\Http\Controllers\AtsController::class, 'history']);
    Route::get('/ats/{analysis}', [\App\Http\Controllers\AtsController::class, 'show']);
    Route::delete('/ats/{analysis}', [\App\Http\Controllers\AtsController::class, 'destroy']);

    // ── Cover Letters ─────────────────────────────────────────────────────
    Route::get('/cover-letters', [\App\Http\Controllers\CoverLetterController::class, 'index']);
    Route::post('/cover-letters/generate', [\App\Http\Controllers\CoverLetterController::class, 'generate'])->middleware('throttle:ai');
    Route::get('/cover-letters/{coverLetter}', [\App\Http\Controllers\CoverLetterController::class, 'show']);
    Route::put('/cover-letters/{coverLetter}', [\App\Http\Controllers\CoverLetterController::class, 'update']);
    Route::patch('/cover-letters/{coverLetter}', [\App\Http\Controllers\CoverLetterController::class, 'update']);
    Route::delete('/cover-letters/{coverLetter}', [\App\Http\Controllers\CoverLetterController::class, 'destroy']);

    // ── Interview Preparation ─────────────────────────────────────────────
    Route::get('/interviews', [\App\Http\Controllers\InterviewController::class, 'index']);
    Route::post('/interviews', [\App\Http\Controllers\InterviewController::class, 'store'])->middleware('throttle:ai');
    Route::get('/interviews/{interview}', [\App\Http\Controllers\InterviewController::class, 'show']);
    Route::delete('/interviews/{interview}', [\App\Http\Controllers\InterviewController::class, 'destroy']);
    Route::post('/interviews/{interview}/questions/generate', [\App\Http\Controllers\InterviewController::class, 'generateQuestions'])->middleware('throttle:ai');
    Route::post('/interviews/{interview}/questions/{question}/answer', [\App\Http\Controllers\InterviewController::class, 'answer'])->middleware('throttle:ai');

    // ── Document Exports ──────────────────────────────────────────────────
    Route::get('/exports', [\App\Http\Controllers\ExportController::class, 'index']);
    Route::post('/exports/resumes/{resume}', [\App\Http\Controllers\ExportController::class, 'exportResume']);
    Route::post('/exports/cover-letters/{coverLetter}', [\App\Http\Controllers\ExportController::class, 'exportCoverLetter']);
    Route::get('/exports/{export}', [\App\Http\Controllers\ExportController::class, 'show']);
    Route::get('/exports/{export}/download', [\App\Http\Controllers\ExportController::class, 'download']);
    Route::delete('/exports/{export}', [\App\Http\Controllers\ExportController::class, 'destroy']);
});

// ── Admin Panel ───────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role.admin', 'user.active'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'overview']);
    Route::get('/analytics', [\App\Http\Controllers\Admin\AdminAnalyticsController::class, 'index']);

    // User Management
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index']);
    Route::get('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'show']);
    Route::patch('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'update']);
    Route::patch('/users/{user}/role', [\App\Http\Controllers\Admin\UserController::class, 'assignRole']);
    Route::post('/users/{user}/suspend', [\App\Http\Controllers\Admin\UserController::class, 'suspend']);
    Route::post('/users/{user}/reactivate', [\App\Http\Controllers\Admin\UserController::class, 'reactivate']);

    // Template Management
    Route::get('/templates', [\App\Http\Controllers\Admin\AdminTemplateController::class, 'index']);
    Route::post('/templates', [\App\Http\Controllers\Admin\AdminTemplateController::class, 'store']);
    Route::get('/templates/{template}', [\App\Http\Controllers\Admin\AdminTemplateController::class, 'show']);
    Route::patch('/templates/{template}', [\App\Http\Controllers\Admin\AdminTemplateController::class, 'update']);
    Route::delete('/templates/{template}', [\App\Http\Controllers\Admin\AdminTemplateController::class, 'destroy']);

    // Logs
    Route::get('/audit-logs', [\App\Http\Controllers\Admin\AdminLogController::class, 'auditLogs']);
    Route::get('/system-logs', [\App\Http\Controllers\Admin\AdminLogController::class, 'systemLogs']);
});
