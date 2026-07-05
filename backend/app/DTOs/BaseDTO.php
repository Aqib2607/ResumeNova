<?php

declare(strict_types=1);

namespace App\DTOs;

/**
 * Base DTO.
 * Extend this class for all feature-specific Data Transfer Objects.
 *
 * Convention:
 *   - DTOs are immutable (use readonly properties in PHP 8.2+)
 *   - Use static factory methods (::fromArray(), ::fromRequest()) instead of constructors
 *   - Never inject Eloquent models directly into a DTO
 *
 * Example:
 *   class CreateResumeDTO extends BaseDTO
 *   {
 *       public function __construct(
 *           public readonly string $title,
 *           public readonly string $templateId,
 *       ) {}
 *
 *       public static function fromRequest(Request $request): static
 *       {
 *           return new static(
 *               title: $request->validated('title'),
 *               templateId: $request->validated('template_id'),
 *           );
 *       }
 *   }
 */
abstract class BaseDTO
{
    /**
     * Create a DTO from a plain array.
     * Override in concrete DTOs to add mapping logic.
     */
    abstract public static function fromArray(array $data): static;

    /**
     * Serialize the DTO to a plain array.
     */
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
