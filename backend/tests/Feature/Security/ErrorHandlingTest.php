<?php

use Illuminate\Support\Facades\Route;

test('404 error response is returned for undefined routes', function () {
    $response = $this->getJson('/api/this-route-should-never-exist');

    $response->assertStatus(404);
    $response->assertJsonStructure(['message']);
});

test('403 error response is returned for unauthorized access', function () {
    Route::get('/api/test-403', function () {
        abort(403, 'Forbidden action.');
    });

    $response = $this->getJson('/api/test-403');
    
    $response->assertStatus(403);
    $response->assertJson(['message' => 'Forbidden action.']);
});

test('500 error response is returned for server errors', function () {
    Route::get('/api/test-500', function () {
        abort(500, 'Server Error.');
    });

    $response = $this->getJson('/api/test-500');
    
    $response->assertStatus(500);
    $response->assertJson(['message' => 'Server Error.']);
});
