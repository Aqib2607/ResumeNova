<nav class="bg-white border-b border-gray-100 shadow-sm">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between items-center">

            <!-- Brand -->
            <div class="flex items-center gap-2">
                <a href="{{ url('/') }}" class="text-xl font-bold text-indigo-600">
                    ResumeNova
                </a>
            </div>

            <!-- Auth Nav -->
            <div class="flex items-center gap-4">
                @auth
                    <a href="{{ route('dashboard') }}"
                       class="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                        Dashboard
                    </a>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit"
                                class="text-sm font-medium text-gray-500 hover:text-gray-900 transition">
                            Sign out
                        </button>
                    </form>
                @else
                    <a href="{{ route('login') }}"
                       class="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                        Sign in
                    </a>
                    @if (Route::has('register'))
                        <a href="{{ route('register') }}"
                           class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition">
                            Get started
                        </a>
                    @endif
                @endauth
            </div>

        </div>
    </div>
</nav>
