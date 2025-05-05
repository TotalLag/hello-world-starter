<?php

/**
 * @file api.php
 * @description Defines all API routes for the Laravel application.
 *
 * Routes defined in this file are automatically prefixed with `/api` by Laravel's
 * `RouteServiceProvider` (typically). This file maps HTTP verbs and URIs
 * to specific controller actions or closures.
 *
 * It utilizes Laravel Sanctum for API authentication, protecting routes that
 * require a valid user session (via API tokens).
 *
 * For a learner:
 * - This is the entry point for all API requests to your backend.
 * - `Route::get()`, `Route::post()`, etc., define how different HTTP requests are handled.
 * - `Route::prefix()` groups routes under a common URL segment.
 * - `Route::middleware('auth:sanctum')` is key for protecting routes and ensuring
 *   only authenticated users can access them.
 * - The `[Controller::class, 'methodName']` syntax links a route to a specific
 *   method within a controller class.
 */

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route; // Laravel's Facade for defining routes.
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NoteController;

// A simple public GET route for testing or basic info.
// Example: GET /api/hello
Route::get('/hello', function () {
    return response()->json(['message' => 'Hello World from Laravel!']);
});

// --- Authentication Routes ---
// Routes grouped under the '/auth' prefix.
// Example: POST /api/auth/register, POST /api/auth/login
Route::prefix('auth')->group(function () {
    // Publicly accessible routes for user registration and login.
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register'); // Named route
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');       // Named route

    // Routes within this group require authentication via Sanctum API tokens.
    // The 'auth:sanctum' middleware will ensure that the request includes a valid token.
    Route::middleware('auth:sanctum')->group(function () {
        // Example: POST /api/auth/logout
        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
        // Example: GET /api/auth/user
        Route::get('/user', [AuthController::class, 'user'])->name('auth.user');
    });
});

// --- Notes Routes ---

// Public endpoint: retrieves all notes. No authentication required.
// Example: GET /api/notes
Route::get('/notes', [NoteController::class, 'index'])->name('notes.index');

// Authenticated endpoint: creates a new note for the logged-in user.
// Requires a valid Sanctum API token due to the 'auth:sanctum' middleware.
// Example: POST /api/notes
Route::middleware('auth:sanctum')->post('/notes', [NoteController::class, 'store'])->name('notes.store');