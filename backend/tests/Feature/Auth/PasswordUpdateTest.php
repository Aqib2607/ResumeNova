<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('password can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->putJson('/api/password', [
            'current_password' => 'password',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

    $response->assertStatus(200)
             ->assertJsonStructure(['status']);

    $this->assertTrue(Hash::check('Password1!', $user->refresh()->password));
});

test('correct password must be provided to update password', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->putJson('/api/password', [
            'current_password' => 'wrong-password',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

    $response->assertStatus(422)
             ->assertJsonValidationErrors(['current_password']);
});
