<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

/**
 * Authentication controller for managing user registration, login, and session management.
 *
 * Note: Custom validation error messages for these endpoints are defined in the frontend
 * at packages/api-types/src/extendedSchemas.ts. When updating validation rules here,
 * make sure to update the corresponding error messages in the extended schemas.
 */
class AuthController extends Controller
{
    /**
     * Register a new user.
     *
     * Custom validation error messages for this endpoint are defined in ExtendedRegisterSchema
     * at packages/api-types/src/extendedSchemas.ts.
     *
     * @bodyParam name string required The user's full name. Example: John Doe
     * @bodyParam email string required The user's email address. Example: john@example.com
     * @bodyParam password string required The user's password (min 8 characters). Example: password123
     * @bodyParam password_confirmation string required Password confirmation. Example: password123
     *
     * @response {
     *   "message": "User registered successfully.",
     *   "user": {
     *     "id": 1,
     *     "name": "John Doe",
     *     "email": "john@example.com",
     *     "created_at": "2025-05-07T01:00:00.000000Z",
     *     "updated_at": "2025-05-07T01:00:00.000000Z"
     *   },
     *   "token": "1|laravel_sanctum_token..."
     * }
     *
     * @response 422 {
     *   "message": "The given data was invalid.",
     *   "errors": {
     *     "email": ["The email has already been taken."]
     *   }
     * }
     */
    public function register(Request $request)
    {
        // Laravel's built-in validation. If validation fails, it automatically
        // throws a ValidationException, which is rendered as a 422 JSON response
        // with a structured error message (as shown in the @response 422 example).
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            // 'unique:'.User::class ensures the email is unique in the 'users' table (table name inferred from User model).
            'email' => ['required', 'string', 'email', 'max:255', 'unique:'.User::class],
            // 'confirmed' rule requires a matching 'password_confirmation' field in the request.
            // Rules\Password::defaults() applies Laravel's default strong password complexity rules.
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Create a new user record in the database using the User Eloquent model.
        // Eloquent is Laravel's Object-Relational Mapper (ORM).
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            // `Hash::make()` securely hashes the password using Laravel's configured hashing algorithm (usually bcrypt).
            // Never store plain-text passwords. `Hash` is a Laravel Facade providing access to hashing services.
            'password' => Hash::make($request->password),
        ]);

        // Issue a new Sanctum API token for the newly registered user.
        // 'api-token' is a descriptive name for the token (can be used for token abilities/scopes if needed).
        // `plainTextToken` is the actual token string that must be sent to the client.
        // The token itself is stored hashed in the database for security.
        $token = $user->createToken('api-token')->plainTextToken;

        // Return a JSON response with a success message, the created user data (transformed by UserResource),
        // and the API token. HTTP status 201 indicates "Created".
        // `UserResource` controls how the User model is serialized to JSON.
        return response()->json([
            'message' => 'User registered successfully.',
            'user' => new UserResource($user),
            'token' => $token
        ], 201);
    }

    /**
     * Login user and create authentication token.
     *
     * Custom validation error messages for this endpoint are defined in ExtendedLoginSchema
     * at packages/api-types/src/extendedSchemas.ts.
     *
     * @bodyParam email string required The user's email address. Example: john@example.com
     * @bodyParam password string required The user's password. Example: password123
     *
     * @response {
     *   "message": "Login successful.",
     *   "user": {
     *     "id": 1,
     *     "name": "John Doe",
     *     "email": "john@example.com",
     *     "created_at": "2025-05-07T01:00:00.000000Z",
     *     "updated_at": "2025-05-07T01:00:00.000000Z"
     *   },
     *   "token": "1|laravel_sanctum_token..."
     * }
     *
     * @response 422 {
     *   "message": "The given data was invalid.",
     *   "errors": {
     *     "email": ["These credentials do not match our records."]
     *   }
     * }
     */
    public function login(Request $request)
    {
        // Validate the incoming request data.
        $request->validate([
            'email' => 'required|email', // Pipe syntax for rules is also common.
            'password' => 'required',
        ]);

        // `Auth::attempt()` tries to authenticate a user using the provided credentials.
        // `Auth` is a Laravel Facade. It checks against the hashed passwords in the database.
        // If authentication fails, it returns false.
        if (!Auth::attempt($request->only('email', 'password'))) {
            // If authentication fails, throw a ValidationException.
            // This will result in a 422 response with the specified error message.
            // `__('auth.failed')` retrieves a localized error message from Laravel's language files
            // (e.g., "These credentials do not match our records.").
             throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        // If authentication is successful, retrieve the authenticated user instance.
        // `$request->user()` is available because Laravel's authentication middleware (likely Sanctum)
        // has identified the user based on the successful `Auth::attempt`.
        $user = $request->user();

        // Create a new Sanctum API token for the authenticated user.
        $token = $user->createToken('api-token')->plainTextToken;

        // Return a JSON response with a success message, user data, and the token.
        // `UserResource` ensures the user data is formatted consistently for API responses.
        return response()->json([
            'message' => 'Login successful.',
            'user' => new UserResource($user),
            'token' => $token
        ]);
    }

    /**
     * Logout user (revoke token).
     *
     * @authenticated
     *
     * @response {
     *   "message": "Logged out successfully."
     * }
     *
     * @response 401 {
     *   "message": "Unauthenticated."
     * }
     */
    public function logout(Request $request)
    {
        // `$request->user()` retrieves the authenticated user model instance via Sanctum.
        // `currentAccessToken()` gets the specific Sanctum token instance that was used
        // to authenticate the current request.
        // `delete()` revokes this token, effectively logging the user out for this session/device.
        // Other tokens the user might have (e.g., on other devices) remain valid.
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Get authenticated user details.
     *
     * @authenticated
     *
     * @response {
     *   "id": 1,
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "created_at": "2025-05-07T01:00:00.000000Z",
     *   "updated_at": "2025-05-07T01:00:00.000000Z"
     * }
     *
     * @response 401 {
     *   "message": "Unauthenticated."
     * }
     */
    public function user(Request $request)
    {
        // `$request->user()` retrieves the currently authenticated user,
        // identified by Laravel Sanctum through the provided API token.
        // The User model instance is then passed to `UserResource` to format it for the JSON response.
        return new UserResource($request->user());
    }
}