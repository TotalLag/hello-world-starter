<?php

/**
 * @file apps/laravel-api/app/Http/Resources/UserResource.php
 * @description API Resource for transforming a User model into a JSON representation.
 *
 * This resource defines how a User model should be presented in API responses.
 * It selects specific attributes to include and formats them appropriately (e.g., dates).
 * Sensitive information like password hashes are automatically excluded due to the
 * `$hidden` property in the User model and are not explicitly included here.
 *
 * Laravel Scramble will infer the API response structure for User objects based on
 * the array returned by the `toArray` method.
 *
 * For a learner:
 * - API Resources control the "shape" of your API data, decoupling it from your database schema.
 * - This ensures only necessary and safe data is exposed publicly.
 * - Formatting data (like dates) consistently is a key responsibility of resources.
 * - Relationships could be conditionally loaded here using `whenLoaded` if needed (e.g., `$this->whenLoaded('notes', NoteResource::collection($this->notes))`).
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource; // Base class for individual resource transformation.

/**
 * Represents a User object formatted for API responses.
 * The structure defined in `toArray` is used by Laravel to generate JSON
 * and by Scramble to generate API documentation.
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource (a single User model) into an array.
     * This array defines the structure of the JSON representation of the User.
     *
     * @param \Illuminate\Http\Request $request The incoming request instance.
     * @return array<string, mixed> The array representation of the resource.
     */
    public function toArray(Request $request): array
    {
        // `$this` refers to the User model instance being transformed.
        return [
            'id' => $this->id, // User's unique ID.
            'name' => $this->name, // User's name.
            'email' => $this->email, // User's email address.

            // Format timestamps into a standard ISO 8601 compatible string.
            // Assumes `created_at` and `updated_at` are Carbon instances (default Eloquent behavior).
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),

            // Note: Sensitive fields like 'password' are automatically excluded
            // because they are listed in the `$hidden` array in the User model.
            // Relationships (like notes) could be added here using `whenLoaded` if required by the API consumer.
        ];
    }
}