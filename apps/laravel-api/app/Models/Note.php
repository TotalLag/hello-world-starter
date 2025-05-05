<?php

/**
 * @file apps/laravel-api/app/Models/Note.php
 * @description Eloquent model representing a single note in the database.
 *
 * This class defines the structure, relationships, and business logic associated
 * with the `notes` database table (table name inferred by convention from the class name).
 * It extends Laravel's base `Model` class, providing powerful ORM capabilities
 * for interacting with note data (CRUD operations, relationships, etc.).
 *
 * For a learner:
 * - Eloquent models are a core part of Laravel for database interaction.
 * - The `$fillable` property is crucial for security (mass assignment protection).
 * - Methods like `user()` define relationships between models (e.g., Note belongs to User).
 * - These relationships allow easy data retrieval (e.g., `$note->user->name`) and
 *   efficient querying using eager loading (`Note::with('user')`).
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model; // Base Eloquent model class.
use Illuminate\Database\Eloquent\Relations\BelongsTo; // Type hint for BelongsTo relationship.
use App\Models\User; // Import the related User model.

class Note extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * Mass assignment allows creating or updating models using an array of attributes,
     * typically from request data (e.g., `Note::create($request->all())`).
     * The `$fillable` array specifies which attributes are "safe" to be set this way.
     * This acts as a whitelist, protecting against unintended updates to sensitive columns
     * (like `id` or potentially `user_id` if it shouldn't be set directly from user input
     * in certain contexts, though here it's needed for creation).
     * The alternative is `$guarded`, which acts as a blacklist. Using `$fillable` is often recommended.
     *
     * @var array<int, string>
     */
    protected $fillable = ['user_id', 'title', 'content'];

    /**
     * Get the user (author) that owns the note.
     *
     * This method defines an inverse one-to-many relationship (BelongsTo) between Note and User.
     * It tells Eloquent that each Note belongs to a single User.
     *
     * By convention, Eloquent assumes:
     * - The foreign key on the `notes` table is `user_id` (derived from the method name `user` + `_id`).
     * - This foreign key relates to the `id` column on the `users` table (associated with the `User` model).
     *
     * This relationship allows accessing the author via `$note->user` and enables
     * eager loading like `Note::with('user')->get()` to prevent N+1 query problems.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo
    {
        // Defines the relationship: A Note belongs to a User.
        return $this->belongsTo(User::class);
    }
}
