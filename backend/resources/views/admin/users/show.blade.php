<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('User Details') }}: {{ $user->name }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
            
            @if(session('status'))
                <div class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
                    {{ session('status') }}
                </div>
            @endif

            <!-- User Info Card -->
            <div class="bg-white p-6 shadow sm:rounded-lg">
                <div class="flex items-center space-x-6">
                    <img class="h-20 w-20 rounded-full" src="{{ $user->avatarUrl() }}" alt="">
                    <div>
                        <h3 class="text-2xl font-bold text-gray-900">{{ $user->name }}</h3>
                        <p class="text-sm text-gray-500">{{ $user->email }}</p>
                        <p class="mt-2">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {{ $user->role->badgeClass() }}">
                                {{ $user->role->label() }}
                            </span>
                            @if($user->isSuspended())
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 ml-2">Suspended</span>
                            @endif
                        </p>
                    </div>
                </div>
                
                <div class="mt-8 border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm font-medium text-gray-500">Joined</p>
                        <p class="mt-1 text-sm text-gray-900">{{ $user->created_at->format('M j, Y H:i') }}</p>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">Last Login</p>
                        <p class="mt-1 text-sm text-gray-900">{{ $user->last_login_at ? $user->last_login_at->format('M j, Y H:i') : 'Never' }}</p>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">OAuth User</p>
                        <p class="mt-1 text-sm text-gray-900">{{ $user->isOAuthUser() ? 'Yes (Google)' : 'No' }}</p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Role Management -->
                <div class="bg-white p-6 shadow sm:rounded-lg">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Change Role</h3>
                    
                    @can('assignRole', $user)
                        <form method="POST" action="{{ route('admin.users.role', $user) }}">
                            @csrf
                            @method('PATCH')
                            
                            <div>
                                <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
                                <select id="role" name="role" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                    @foreach($assignableRoles as $role)
                                        @if(auth()->user()->isSuperAdmin() || in_array($role->value, \App\Enums\UserRole::adminAssignableValues()))
                                            <option value="{{ $role->value }}" {{ $user->role === $role ? 'selected' : '' }}>
                                                {{ $role->label() }}
                                            </option>
                                        @endif
                                    @endforeach
                                </select>
                                <x-input-error class="mt-2" :messages="$errors->get('role')" />
                            </div>
                            
                            <div class="mt-4">
                                <x-primary-button>Update Role</x-primary-button>
                            </div>
                        </form>
                    @else
                        <p class="text-sm text-gray-500">You do not have permission to change this user's role.</p>
                    @endcan
                </div>

                <!-- Status Management -->
                <div class="bg-white p-6 shadow sm:rounded-lg">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
                    
                    @if($user->isSuspended())
                        <p class="text-sm text-red-600 mb-4">This account is currently suspended. The user cannot log in or access the application.</p>
                        
                        @can('reactivate', $user)
                            <form method="POST" action="{{ route('admin.users.reactivate', $user) }}">
                                @csrf
                                <button type="submit" class="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 active:bg-green-900 focus:outline-none focus:border-green-900 focus:ring ring-green-300 disabled:opacity-25 transition ease-in-out duration-150">
                                    Reactivate Account
                                </button>
                            </form>
                        @endcan
                    @else
                        <p class="text-sm text-gray-500 mb-4">This account is active. Suspending it will immediately prevent the user from accessing the application.</p>
                        
                        @can('suspend', $user)
                            <form method="POST" action="{{ route('admin.users.suspend', $user) }}">
                                @csrf
                                <button type="submit" onclick="return confirm('Are you sure you want to suspend this user?')" class="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-900 focus:outline-none focus:border-red-900 focus:ring ring-red-300 disabled:opacity-25 transition ease-in-out duration-150">
                                    Suspend Account
                                </button>
                            </form>
                        @endcan
                    @endif
                </div>
            </div>

            <!-- Audit Logs -->
            <div class="bg-white p-6 shadow sm:rounded-lg">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Security Audit Log ({{ $user->role_audit_logs_count }})</h3>
                
                @if($user->roleAuditLogs->isEmpty())
                    <p class="text-sm text-gray-500">No role or status changes recorded yet.</p>
                @else
                    <div class="flow-root">
                        <ul role="list" class="-mb-8">
                            @foreach($user->roleAuditLogs as $log)
                                <li>
                                    <div class="relative pb-8">
                                        @if(!$loop->last)
                                            <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                        @endif
                                        <div class="relative flex space-x-3">
                                            <div>
                                                <span class="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                                                    <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </span>
                                            </div>
                                            <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p class="text-sm text-gray-500">
                                                        {{ $log->reason }}
                                                        @if($log->old_role !== $log->new_role)
                                                            (<span class="font-medium text-gray-900">{{ $log->old_role }}</span> &rarr; <span class="font-medium text-gray-900">{{ $log->new_role }}</span>)
                                                        @endif
                                                        by <span class="font-medium text-gray-900">{{ $log->changedBy ? $log->changedBy->name : 'System' }}</span>
                                                    </p>
                                                </div>
                                                <div class="text-right text-sm whitespace-nowrap text-gray-500">
                                                    <time datetime="{{ $log->created_at }}">{{ $log->created_at->diffForHumans() }}</time>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            @endforeach
                        </ul>
                    </div>
                @endif
            </div>

        </div>
    </div>
</x-app-layout>
