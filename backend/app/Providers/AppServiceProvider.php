<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\User;
use App\Observers\UserObserver;
use App\Policies\UserPolicy;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * Bind interfaces to concrete implementations here.
     * Example (Part 2+):
     *   $this->app->bind(
     *       \App\Contracts\Repository\UserRepositoryInterface::class,
     *       \App\Repositories\UserRepository::class,
     *   );
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Contracts\AIProviderInterface::class,
            \App\Services\AI\GroqProvider::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Enforce a strong password policy across the application.
        Password::defaults(function () {
            return $this->app->environment('production')
                ? Password::min(12)->mixedCase()->numbers()->symbols()->uncompromised()
                : Password::min(8);
        });

        // Register Policies
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(\App\Models\ApiKey::class, \App\Policies\ApiKeyPolicy::class);
        Gate::policy(\App\Models\CoverLetter::class, \App\Policies\CoverLetterPolicy::class);
        Gate::policy(\App\Models\InterviewSession::class, \App\Policies\InterviewSessionPolicy::class);
        Gate::policy(\App\Models\Export::class, \App\Policies\ExportPolicy::class);

        // Register Observers
        User::observe(UserObserver::class);

        // Register Auth Event Listeners
        Event::listen(Login::class, \App\Listeners\LoginListener::class);
        Event::listen(Logout::class, \App\Listeners\LogoutListener::class);

        // Define Gates for UI element visibility
        Gate::define('access-admin-panel', function (User $user) {
            return $user->isAdmin() && ! $user->isSuspended();
        });

        Gate::define('manage-users', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-roles', function (User $user) {
            return $user->isAdmin();
        });

        // Configure Rate Limiting
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('ai', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('web', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });
    }
}
