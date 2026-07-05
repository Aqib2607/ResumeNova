<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/suspended', function () {
    if (! request()->user() || ! request()->user()->isSuspended()) {
        return redirect()->route('dashboard');
    }
    return view('suspended');
})->middleware('auth')->name('suspended');

Route::middleware(['auth', 'verified', 'user.active'])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'index'])->name('profile.index');
    Route::get('/profile/edit', [\App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');

    Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'index'])->name('settings.index');
    Route::patch('/settings/account', [\App\Http\Controllers\SettingsController::class, 'updateAccount'])->name('settings.account.update');
    Route::delete('/settings/account', [\App\Http\Controllers\SettingsController::class, 'destroy'])->name('settings.account.destroy');

    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read.all');
});

// ── Admin Panel ───────────────────────────────────────────────────────────
Route::middleware(['auth', 'role.admin', 'user.active'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'show'])->name('users.show');
    Route::patch('/users/{user}/role', [\App\Http\Controllers\Admin\UserController::class, 'assignRole'])->name('users.role');
    Route::post('/users/{user}/suspend', [\App\Http\Controllers\Admin\UserController::class, 'suspend'])->name('users.suspend');
    Route::post('/users/{user}/reactivate', [\App\Http\Controllers\Admin\UserController::class, 'reactivate'])->name('users.reactivate');
});

require __DIR__.'/auth.php';

Route::fallback(function () {
    abort(404);
});
