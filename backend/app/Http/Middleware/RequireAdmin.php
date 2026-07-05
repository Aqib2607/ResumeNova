<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RequireAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            Log::warning('Unauthorized access attempt to admin route.', [
                'user_id' => $request->user()?->id,
                'ip'      => $request->ip(),
                'url'     => $request->fullUrl(),
            ]);

            abort(403, 'Unauthorized. Administrator access required.');
        }

        return $next($request);
    }
}
