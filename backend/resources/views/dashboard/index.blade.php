<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <!-- Profile Completion Widget -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Profile Completion</h3>
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-3xl font-bold text-indigo-600">{{ $dashboardData['profile_completion'] }}%</span>
                            @if($dashboardData['profile_completion'] < 100)
                                <a href="{{ route('profile.edit') }}" class="text-sm text-indigo-600 hover:text-indigo-900">Complete Profile</a>
                            @endif
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div class="bg-indigo-600 h-2.5 rounded-full" {!! 'style="width: ' . $dashboardData['profile_completion'] . '%;"' !!}></div>
                        </div>
                    </div>
                </div>

                <!-- Notifications Widget -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Notifications</h3>
                        <div class="flex items-center space-x-4 mb-4">
                            <div class="p-3 rounded-full {{ $dashboardData['notifications']['unread_count'] > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600' }}">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                            </div>
                            <div>
                                <p class="text-2xl font-bold text-gray-900">{{ $dashboardData['notifications']['unread_count'] }}</p>
                                <p class="text-sm text-gray-500">Unread</p>
                            </div>
                        </div>
                        <a href="{{ route('notifications.index') }}" class="text-sm text-indigo-600 hover:text-indigo-900">View all notifications &rarr;</a>
                    </div>
                </div>

                <!-- Quick Actions Widget -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                        <div class="space-y-2">
                            <a href="{{ route('profile.index') }}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-md transition-colors">
                                View Public Profile
                            </a>
                            <a href="{{ route('settings.index') }}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-md transition-colors">
                                Account Settings
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                    
                    @if($dashboardData['recent_activity']->isEmpty())
                        <p class="text-sm text-gray-500">No recent activity.</p>
                    @else
                        <div class="flow-root">
                            <ul role="list" class="-mb-8">
                                @foreach($dashboardData['recent_activity'] as $activity)
                                    <li>
                                        <div class="relative pb-8">
                                            @if(!$loop->last)
                                                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                            @endif
                                            <div class="relative flex space-x-3">
                                                <div>
                                                    <span class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center ring-8 ring-white">
                                                        <svg class="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </span>
                                                </div>
                                                <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                    <div>
                                                        <p class="text-sm text-gray-500">
                                                            {{ str_replace('_', ' ', ucfirst($activity->action)) }}
                                                        </p>
                                                    </div>
                                                    <div class="text-right text-sm whitespace-nowrap text-gray-500">
                                                        <time datetime="{{ $activity->created_at }}">{{ $activity->created_at->diffForHumans() }}</time>
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
    </div>
</x-app-layout>
