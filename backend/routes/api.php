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
});

// ── Admin Panel ───────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role.admin', 'user.active'])->prefix('admin')->group(function () {
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index']);
    Route::get('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'show']);
    Route::patch('/users/{user}/role', [\App\Http\Controllers\Admin\UserController::class, 'assignRole']);
    Route::post('/users/{user}/suspend', [\App\Http\Controllers\Admin\UserController::class, 'suspend']);
    Route::post('/users/{user}/reactivate', [\App\Http\Controllers\Admin\UserController::class, 'reactivate']);
});
