<?php

/**
 * @file apps/laravel-api/app/Models/User.php
 * @description Eloquent model representing a user in the application.
 *
 * This class defines the structure, relationships, and authentication-related logic
 * for the `users` database table. It extends Laravel's `Authenticatable` class,
 * making it compatible with Laravel's built-in authentication system.
 * It also utilizes several traits to add common functionality:
 * - `HasApiTokens`: From Laravel Sanctum, for API token management.
 * - `HasFactory`: For integration with database factories (testing/seeding).
 * - `Notifiable`: For handling notifications (e.g., password resets, email verification).
 *
 * Key properties define mass assignable fields (`$fillable`), hidden fields for serialization (`$hidden`),
 * and attribute casting (`casts()`) for data type handling and security (e.g., password hashing).
 *
 * For a learner:
 * - This is the central model for user data and authentication.
 * - Extending `Authenticatable` is standard for user models in Laravel.
 * - Traits (`use ...`) are PHP's way of adding reusable functionality to classes.
 * - `$fillable`, `$hidden`, and `casts()` are important Eloquent properties for security and data handling.
 * - This model would typically define relationships to other models (e.g., a `hasMany` relationship to `Note`).
 */

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail; // Interface for email verification functionality (commented out).
use Illuminate\Database\Eloquent\Factories\HasFactory; // Trait for model factories.
use Illuminate\Foundation\Auth\User as Authenticatable; // Base class for authenticatable user models.
use Illuminate\Notifications\Notifiable; // Trait for sending notifications.
use Laravel\Sanctum\HasApiTokens; // Trait from Laravel Sanctum for API token handling.

class User extends Authenticatable // Extend Laravel's base authenticatable user model.
{
    /**
     * Incorporate traits to add functionality to the User model:
     * - HasApiTokens: Adds methods for issuing and managing Sanctum API tokens (e.g., `createToken`).
     * - HasFactory: Enables the use of the associated UserFactory (`Database\Factories\UserFactory`)
     *   for creating user instances during testing or seeding. The `@use` annotation provides type hinting.
     * - Notifiable: Adds methods for sending notifications (e.g., `$user->notify(...)`).
     *
     * @use HasFactory<\Database\Factories\UserFactory>
     */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     * Specifies which fields can be set using `User::create([...])` or `User::update([...])`.
     * Protects against mass assignment vulnerabilities.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password', // Note: Password will be automatically hashed due to the 'hashed' cast below.
    ];

    /**
     * The attributes that should be hidden for serialization.
     * These attributes will NOT be included when the model is converted to an array or JSON
     * (e.g., when returned in API responses). Crucial for security to hide sensitive data.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password', // Always hide the password hash.
        'remember_token', // Used for web "remember me" functionality, not typically needed in APIs.
    ];

    /**
     * Get the attributes that should be cast to native types or custom classes.
     * Eloquent automatically applies these casts when accessing or setting attributes.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            // Cast `email_verified_at` from a database timestamp string to a Carbon\Carbon instance.
            'email_verified_at' => 'datetime',
            // Automatically hash the password attribute whenever it is set on the model.
            // This ensures passwords are always stored securely hashed, even if `Hash::make` isn't used explicitly elsewhere.
            'password' => 'hashed',
        ];
    }

    // --- Relationships ---
    // Example: Define the relationship to Notes (a User has many Notes)
    // public function notes(): \Illuminate\Database\Eloquent\Relations\HasMany
    // {
    //     return $this->hasMany(Note::class);
    // }
}
