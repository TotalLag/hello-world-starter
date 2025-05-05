<?php

/**
 * @file apps/laravel-api/app/Http/Resources/NoteResource.php
 * @description API Resource for transforming a Note model into a JSON representation.
 *
 * Laravel API Resources provide a flexible transformation layer between your Eloquent models
 * and the JSON responses returned by your API. They allow you to control exactly which
 * attributes are included, how they are named, format data (like dates), and conditionally
 * include related data. This helps keep your API responses consistent and decoupled from
 * your database schema or internal model structure.
 *
 * This resource defines the standard JSON structure for a single Note, which will be
 * automatically inferred by Laravel Scramble for API documentation generation based on
 * the structure returned by the `toArray` method.
 *
 * For a learner:
 * - API Resources are essential for building well-structured Laravel APIs.
 * - The `toArray` method defines the JSON output structure. Scramble reads this structure.
 * - `$this` inside the resource refers to the underlying Note model instance.
 * - `whenLoaded` is a key technique for conditionally including relationship data
 *   efficiently, preventing N+1 query problems.
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource; // Base class for individual resource transformation.

/**
 * Represents a Note object formatted for API responses.
 * The structure defined in `toArray` is used by Laravel to generate JSON
 * and by Scramble to generate API documentation.
 */
class NoteResource extends JsonResource
{
    /**
     * Transform the resource (a single Note model) into an array.
     * This array defines the structure of the JSON representation of the Note.
     *
     * @param \Illuminate\Http\Request $request The incoming request instance (can be used for conditional logic).
     * @return array<string, mixed> The array representation of the resource.
     */
    public function toArray(Request $request): array
    {
        // `$this` refers to the Note model instance being transformed.
        return [
            'id' => $this->id, // Unique ID of the note.
            'title' => $this->title, // Title of the note.
            'content' => $this->content, // Content of the note.
            'userId' => $this->user_id, // ID of the author (user).

            // Conditionally include the author's name ONLY if the 'user' relationship was loaded beforehand.
            // `whenLoaded('user', ...)` checks if the relationship data is already available
            // (due to eager loading like `Note::with('user')` or lazy loading like `$note->load('user')` in the controller).
            // If the relationship is loaded, the closure executes and returns the user's name.
            // If not loaded, this key ('authorName') will be omitted from the JSON response entirely.
            // This prevents accidental N+1 query problems if the relationship wasn't pre-loaded.
            'authorName' => $this->whenLoaded('user', function () {
                // Access the loaded user relationship and return the name.
                // Assumes the User model has a 'name' attribute.
                return $this->user->name;
            }),

            // Format timestamps into a standard ISO 8601 compatible string.
            // Assumes `created_at` and `updated_at` are Carbon instances (default Eloquent behavior for timestamps).
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}