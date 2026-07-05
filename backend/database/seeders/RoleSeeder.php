<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Super Admin
        User::factory()->create([
            'name'  => 'Super Admin',
            'email' => 'superadmin@resumenova.com',
            'role'  => UserRole::SuperAdmin,
        ]);

        // 2. Admin
        User::factory()->create([
            'name'  => 'Admin User',
            'email' => 'admin@resumenova.com',
            'role'  => UserRole::Admin,
        ]);

        // 3. Regular User
        User::factory()->create([
            'name'  => 'Regular User',
            'email' => 'user@resumenova.com',
            'role'  => UserRole::User,
        ]);
    }
}
