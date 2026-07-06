<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Allows the React SPA (dev server on :5173 or any port) to reach the
    | Laravel API while in local development. In production the frontend is
    | served by Laravel itself so CORS headers are irrelevant for same-origin
    | requests, but the wildcard '*' is safe because all sensitive routes are
    | protected by Sanctum / bearer-token authentication.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
