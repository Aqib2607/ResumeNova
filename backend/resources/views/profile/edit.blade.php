<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Edit Profile') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
            <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <section>
                    <header>
                        <h2 class="text-lg font-medium text-gray-900">
                            {{ __('Profile Information') }}
                        </h2>
                        <p class="mt-1 text-sm text-gray-600">
                            {{ __("Update your account's profile information and avatar.") }}
                        </p>
                    </header>

                    <form id="send-verification" method="post" action="{{ route('verification.send') }}">
                        @csrf
                    </form>

                    <form method="post" action="{{ route('profile.update') }}" enctype="multipart/form-data" class="mt-6 space-y-6">
                        @csrf
                        @method('patch')

                        <!-- Avatar -->
                        <div>
                            <x-input-label for="avatar" :value="__('Avatar')" />
                            @if($user->avatar)
                                <img src="{{ Storage::url($user->avatar) }}" alt="Current Avatar" class="h-16 w-16 rounded-full object-cover mb-2">
                            @endif
                            <input id="avatar" name="avatar" type="file" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" accept="image/*" />
                            <x-input-error class="mt-2" :messages="$errors->get('avatar')" />
                        </div>

                        <!-- Name -->
                        <div>
                            <x-input-label for="name" :value="__('Name')" />
                            <x-text-input id="name" name="name" type="text" class="mt-1 block w-full" :value="old('name', $user->name)" required autofocus autocomplete="name" />
                            <x-input-error class="mt-2" :messages="$errors->get('name')" />
                        </div>

                        <!-- Headline -->
                        <div>
                            <x-input-label for="headline" :value="__('Professional Headline')" />
                            <x-text-input id="headline" name="headline" type="text" class="mt-1 block w-full" :value="old('headline', $user->profile?->headline)" placeholder="e.g. Senior Software Engineer" />
                            <x-input-error class="mt-2" :messages="$errors->get('headline')" />
                        </div>

                        <!-- Bio -->
                        <div>
                            <x-input-label for="bio" :value="__('Bio')" />
                            <textarea id="bio" name="bio" rows="4" class="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">{{ old('bio', $user->profile?->bio) }}</textarea>
                            <x-input-error class="mt-2" :messages="$errors->get('bio')" />
                        </div>

                        <!-- Location -->
                        <div>
                            <x-input-label for="location" :value="__('Location')" />
                            <x-text-input id="location" name="location" type="text" class="mt-1 block w-full" :value="old('location', $user->profile?->location)" placeholder="e.g. New York, USA" />
                            <x-input-error class="mt-2" :messages="$errors->get('location')" />
                        </div>

                        <!-- Website -->
                        <div>
                            <x-input-label for="website" :value="__('Website')" />
                            <x-text-input id="website" name="website" type="url" class="mt-1 block w-full" :value="old('website', $user->profile?->website)" placeholder="https://example.com" />
                            <x-input-error class="mt-2" :messages="$errors->get('website')" />
                        </div>

                        <!-- Social Links -->
                        <div class="space-y-4">
                            <h3 class="text-md font-medium text-gray-900">Social Links</h3>
                            
                            <div>
                                <x-input-label for="social_links_linkedin" :value="__('LinkedIn URL')" />
                                <x-text-input id="social_links_linkedin" name="social_links[linkedin]" type="url" class="mt-1 block w-full" :value="old('social_links.linkedin', $user->profile?->social_links['linkedin'] ?? '')" />
                                <x-input-error class="mt-2" :messages="$errors->get('social_links.linkedin')" />
                            </div>

                            <div>
                                <x-input-label for="social_links_github" :value="__('GitHub URL')" />
                                <x-text-input id="social_links_github" name="social_links[github]" type="url" class="mt-1 block w-full" :value="old('social_links.github', $user->profile?->social_links['github'] ?? '')" />
                                <x-input-error class="mt-2" :messages="$errors->get('social_links.github')" />
                            </div>

                            <div>
                                <x-input-label for="social_links_twitter" :value="__('Twitter URL')" />
                                <x-text-input id="social_links_twitter" name="social_links[twitter]" type="url" class="mt-1 block w-full" :value="old('social_links.twitter', $user->profile?->social_links['twitter'] ?? '')" />
                                <x-input-error class="mt-2" :messages="$errors->get('social_links.twitter')" />
                            </div>
                        </div>

                        <div class="flex items-center gap-4">
                            <x-primary-button>{{ __('Save') }}</x-primary-button>

                            @if (session('status') === 'Profile successfully updated.')
                                <p
                                    x-data="{ show: true }"
                                    x-show="show"
                                    x-transition
                                    x-init="setTimeout(() => show = false, 2000)"
                                    class="text-sm text-gray-600"
                                >{{ __('Saved.') }}</p>
                            @endif
                        </div>
                    </form>
                </section>
            </div>
        </div>
    </div>
</x-app-layout>
