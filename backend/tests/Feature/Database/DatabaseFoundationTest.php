<?php

declare(strict_types=1);

use App\Models\AnalyticsDaily;
use App\Models\AuditLog;
use App\Models\Profile;
use App\Models\Setting;
use App\Models\SystemLog;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

test('profiles table has correct columns', function () {
    expect(Schema::hasColumns('profiles', [
        'id', 'user_id', 'headline', 'bio', 'website', 'location', 'social_links', 'created_at', 'updated_at', 'deleted_at'
    ]))->toBeTrue();
});

test('audit_logs table has correct columns and uses uuid', function () {
    expect(Schema::hasColumns('audit_logs', [
        'id', 'user_id', 'action', 'entity_type', 'entity_id', 'old_values', 'new_values', 'ip_address'
    ]))->toBeTrue();
});

test('system_logs table has correct columns and uses uuid', function () {
    expect(Schema::hasColumns('system_logs', [
        'id', 'level', 'message', 'context'
    ]))->toBeTrue();
});

test('analytics_dailies table has correct columns', function () {
    expect(Schema::hasColumns('analytics_dailies', [
        'id', 'date', 'active_users', 'new_users', 'page_views'
    ]))->toBeTrue();
});

test('settings table has correct columns', function () {
    expect(Schema::hasColumns('settings', [
        'id', 'key', 'value', 'group', 'is_public'
    ]))->toBeTrue();
});

test('notifications table exists', function () {
    expect(Schema::hasTable('notifications'))->toBeTrue();
});

test('user has profile relationship', function () {
    $user = User::factory()->hasProfile()->create();

    expect($user->profile)->toBeInstanceOf(Profile::class)
        ->and($user->profile->user_id)->toBe($user->id);
});

test('profile social links cast to array', function () {
    $profile = Profile::factory()->create([
        'social_links' => ['twitter' => '@resumenova']
    ]);

    expect(is_array($profile->social_links))->toBeTrue()
        ->and($profile->social_links['twitter'])->toBe('@resumenova');
});

test('setting value casts to array and is_public casts to bool', function () {
    $setting = Setting::create([
        'key' => 'test_key',
        'value' => ['foo' => 'bar'],
        'is_public' => true
    ]);

    $freshSetting = Setting::where('key', 'test_key')->first();

    expect(is_array($freshSetting->value))->toBeTrue()
        ->and($freshSetting->value['foo'])->toBe('bar')
        ->and($freshSetting->is_public)->toBeTrue();
});

test('audit log uses uuid and casts correctly', function () {
    $log = AuditLog::create([
        'action' => 'test_action',
        'old_values' => ['name' => 'old'],
        'new_values' => ['name' => 'new']
    ]);

    expect(is_string($log->id))->toBeTrue()
        ->and(strlen($log->id))->toBe(36)
        ->and(is_array($log->old_values))->toBeTrue()
        ->and($log->old_values['name'])->toBe('old');
});
