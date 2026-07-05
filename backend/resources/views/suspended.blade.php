<x-guest-layout>
    <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>

        <h2 class="mt-4 text-2xl font-bold text-gray-900">Account Suspended</h2>
        
        <p class="mt-2 text-sm text-gray-600">
            Your account has been suspended by an administrator. If you believe this is an error, please contact support.
        </p>

        <div class="mt-6">
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Sign out
                </button>
            </form>
        </div>
    </div>
</x-guest-layout>
