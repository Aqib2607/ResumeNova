<?php

use Illuminate\Support\Facades\Route;

Route::get('/api/health', function () {
    return response()->json(['status' => 'ResumeNova API is running.']);
});

Route::get('/{any}', function () {
    $path = public_path('index.html');
    if (file_exists($path)) {
        return file_get_contents($path);
    }
    return response()->json(['error' => 'Frontend not built yet. Run npm run build and copy dist to public.'], 404);
})->where('any', '.*');
