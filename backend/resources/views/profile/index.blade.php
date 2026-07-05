<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Public Profile') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    <div class="flex items-center space-x-6 mb-6">
                        @if($user->avatar)
                            <img src="{{ Storage::url($user->avatar) }}" alt="{{ $user->name }}" class="h-24 w-24 rounded-full object-cover">
                        @else
                            <img src="{{ current(explode('?', $user->avatarUrl())) }}?d=mp&s=200" alt="{{ $user->name }}" class="h-24 w-24 rounded-full object-cover">
                        @endif
                        
                        <div>
                            <h3 class="text-3xl font-bold">{{ $user->name }}</h3>
                            <p class="text-xl text-gray-600">{{ $user->profile?->headline ?? 'No headline set' }}</p>
                            <p class="text-sm text-gray-500 mt-1 flex items-center">
                                <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {{ $user->profile?->location ?? 'Unknown location' }}
                            </p>
                        </div>
                    </div>

                    <div class="border-t border-gray-200 pt-6 mt-6">
                        <h4 class="text-lg font-semibold mb-2">About</h4>
                        <p class="text-gray-700 whitespace-pre-line">{{ $user->profile?->bio ?? 'No bio provided.' }}</p>
                    </div>

                    <div class="border-t border-gray-200 pt-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        @if($user->profile?->website)
                            <div>
                                <h4 class="text-sm font-semibold text-gray-500 uppercase">Website</h4>
                                <a href="{{ $user->profile->website }}" target="_blank" class="text-indigo-600 hover:underline">{{ $user->profile->website }}</a>
                            </div>
                        @endif

                        @if($user->profile?->social_links)
                            <div>
                                <h4 class="text-sm font-semibold text-gray-500 uppercase mb-2">Social Links</h4>
                                <div class="flex space-x-4">
                                    @foreach($user->profile->social_links as $network => $url)
                                        @if($url)
                                            <a href="{{ $url }}" target="_blank" class="text-gray-600 hover:text-indigo-600 capitalize">
                                                {{ $network }}
                                            </a>
                                        @endif
                                    @endforeach
                                </div>
                            </div>
                        @endif
                    </div>

                </div>
            </div>
        </div>
    </div>
</x-app-layout>
