<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Contracts\AIProviderInterface;
use App\Http\Requests\ApiKey\StoreApiKeyRequest;
use App\Http\Requests\ApiKey\UpdateApiKeyRequest;
use App\Http\Resources\ApiKeyResource;
use App\Models\ApiKey;
use App\Services\ApiKeyManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class ApiKeyController extends Controller
{
    public function __construct(
        protected ApiKeyManager $keyManager,
        protected AIProviderInterface $provider
    ) {}

    /**
     * Display a listing of the user's API keys.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $keys = $this->keyManager->listForUser($request->user());

        return ApiKeyResource::collection($keys);
    }

    /**
     * Store a newly created API key.
     */
    public function store(StoreApiKeyRequest $request): JsonResponse
    {
        $key = $this->keyManager->storeKey($request->user(), $request->validated());

        return (new ApiKeyResource($key))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified API key.
     */
    public function show(ApiKey $apiKey): ApiKeyResource
    {
        Gate::authorize('view', $apiKey);

        return new ApiKeyResource($apiKey);
    }

    /**
     * Update the specified API key.
     */
    public function update(UpdateApiKeyRequest $request, ApiKey $apiKey): ApiKeyResource
    {
        Gate::authorize('update', $apiKey);

        $updated = $this->keyManager->updateKey($apiKey, $request->validated());

        return new ApiKeyResource($updated);
    }

    /**
     * Remove the specified API key.
     */
    public function destroy(ApiKey $apiKey): JsonResponse
    {
        Gate::authorize('delete', $apiKey);

        $this->keyManager->deleteKey($apiKey);

        return response()->json([
            'message' => 'API key deleted successfully.',
        ]);
    }

    /**
     * Reorder priorities of user API keys.
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'key_ids' => ['required', 'array'],
            'key_ids.*' => ['required', 'integer'],
        ]);

        $this->keyManager->reorderPriorities($request->user(), $validated['key_ids']);

        $keys = $this->keyManager->listForUser($request->user());

        return response()->json([
            'message' => 'API key priorities updated.',
            'data' => ApiKeyResource::collection($keys),
        ]);
    }

    /**
     * Test an API key against the provider.
     */
    public function test(ApiKey $apiKey): JsonResponse
    {
        Gate::authorize('view', $apiKey);

        $isValid = $this->provider->validateKey($apiKey->key);

        if ($isValid) {
            $apiKey->resetCooldown();
            return response()->json([
                'valid' => true,
                'message' => 'API key is valid and connected to Groq.',
            ]);
        }

        $apiKey->markFailed('Key validation failed during test', 0, true);

        return response()->json([
            'valid' => false,
            'message' => 'API key failed validation with Groq.',
        ], 422);
    }
}
