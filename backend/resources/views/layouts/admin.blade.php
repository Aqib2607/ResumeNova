<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="robots" content="noindex, nofollow">

    <title>Admin – {{ isset($title) ? $title . ' | ' : '' }}{{ config('app.name', 'ResumeNova') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Scripts & Styles -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    @stack('head')
</head>

<body class="h-full bg-gray-900 font-sans text-gray-100 antialiased">

    <div class="flex h-full">

        <!-- Sidebar -->
        <aside class="flex w-64 flex-col bg-gray-800 px-4 py-6">
            <div class="mb-8">
                <span class="text-xl font-bold text-white">ResumeNova</span>
                <span class="ml-2 rounded bg-indigo-600 px-1.5 py-0.5 text-xs font-semibold text-white">Admin</span>
            </div>

            <nav class="flex-1 space-y-1">
                <a href="{{ route('admin.dashboard') }}"
                   class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white {{ request()->routeIs('admin.dashboard') ? 'bg-gray-700 text-white' : '' }}">
                    Dashboard
                </a>
                {{-- Additional admin nav items will be added in future parts --}}
            </nav>

            <div class="border-t border-gray-700 pt-4">
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit"
                            class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white">
                        Sign out
                    </button>
                </form>
            </div>
        </aside>

        <!-- Main Content -->
        <div class="flex flex-1 flex-col overflow-hidden">

            <!-- Top Bar -->
            <header class="flex h-16 items-center justify-between border-b border-gray-700 bg-gray-800 px-6">
                @isset($title)
                    <h1 class="text-lg font-semibold text-white">{{ $title }}</h1>
                @endisset
                <div class="ml-auto flex items-center gap-4">
                    <span class="text-sm text-gray-400">{{ auth()->user()?->name }}</span>
                </div>
            </header>

            <!-- Flash Messages -->
            @if (session('success'))
                <div class="mx-6 mt-4 rounded-md bg-green-900/40 border border-green-700 p-4" role="alert">
                    <p class="text-green-300 text-sm">{{ session('success') }}</p>
                </div>
            @endif

            @if (session('error'))
                <div class="mx-6 mt-4 rounded-md bg-red-900/40 border border-red-700 p-4" role="alert">
                    <p class="text-red-300 text-sm">{{ session('error') }}</p>
                </div>
            @endif

            <!-- Page Content -->
            <main class="flex-1 overflow-y-auto p-6">
                {{ $slot }}
            </main>

        </div>
    </div>

    @stack('modals')
    @stack('scripts')

</body>
</html>
