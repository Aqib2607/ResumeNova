<?php

return [
    'base_url' => env('GROQ_BASE_URL', 'https://api.groq.com/openai/v1'),
    'default_model' => env('GROQ_DEFAULT_MODEL', 'llama-3.3-70b-versatile'),
    'timeout' => (int) env('GROQ_TIMEOUT', 30),
    'max_retries' => (int) env('GROQ_MAX_RETRIES', 3),
    'verify_ssl' => env('GROQ_VERIFY_SSL', false),
    'supported_models' => [
        'llama-3.3-70b-versatile' => 'Llama 3.3 70B Versatile (Recommended)',
        'llama-3.1-8b-instant' => 'Llama 3.1 8B Instant (Fast)',
        'mixtral-8x7b-32768' => 'Mixtral 8x7B (High Context)',
    ],
];
