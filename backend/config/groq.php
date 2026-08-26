<?php

return [
    'base_url' => env('GROQ_BASE_URL', 'https://api.groq.com/openai/v1'),
    'default_model' => env('GROQ_DEFAULT_MODEL', 'llama-3.3-70b-versatile'),
    'timeout' => (int) env('GROQ_TIMEOUT', 30),
    'max_retries' => (int) env('GROQ_MAX_RETRIES', 3),
    'verify_ssl' => env('GROQ_VERIFY_SSL', false),
    'fallback_models' => [
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'qwen/qwen3.8-27b',
        'groq/compound',
        'groq/compound-mini',
        'qwen/qwen3.6-27b',
        'gemma2-9b-it',
        'mixtral-8x7b-32768',
        'allam-2-7b',
    ],
    'supported_models' => [
        'llama-3.3-70b-versatile' => 'Llama 3.3 70B Versatile (Recommended)',
        'llama-3.1-8b-instant' => 'Llama 3.1 8B Instant (Fast)',
        'qwen/qwen3.8-27b' => 'Qwen 3.8 27B',
        'groq/compound' => 'Groq Compound',
        'groq/compound-mini' => 'Groq Compound Mini',
        'qwen/qwen3.6-27b' => 'Qwen 3.6 27B',
        'gemma2-9b-it' => 'Gemma 2 9B',
        'mixtral-8x7b-32768' => 'Mixtral 8x7B (High Context)',
        'allam-2-7b' => 'ALLaM 2 7B',
    ],
];
