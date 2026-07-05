<?php

use Illuminate\Support\Facades\Route;

test('404 error page is rendered for undefined routes', function () {
    $response = $this->get('/this-route-should-never-exist');

    $response->assertStatus(404);
    $response->assertSeeText('Page Not Found');
});

test('403 error page is rendered for unauthorized access', function () {
    Route::get('/test-403', function () {
        abort(403);
    });

    $response = $this->get('/test-403');
    
    $response->assertStatus(403);
    $response->assertSeeText('Forbidden');
});

test('500 error page is rendered for server errors', function () {
    Route::get('/test-500', function () {
        abort(500);
    });

    $response = $this->get('/test-500');
    
    $response->assertStatus(500);
    $response->assertSeeText('Server Error');
});
