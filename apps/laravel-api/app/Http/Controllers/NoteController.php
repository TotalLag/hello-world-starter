<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Note;
use App\Http\Resources\NoteResource;
use Illuminate\Http\JsonResponse;

/**
 * Notes controller for managing user notes.
 *
 * Note: Custom validation error messages for these endpoints are defined in the frontend
 * at packages/api-types/src/extendedSchemas.ts. When updating validation rules here,
 * make sure to update the corresponding error messages in the extended schemas.
 */
class NoteController extends Controller
{
    /**
     * List all notes with their authors.
     *
     * Retrieves all notes from the database with their associated authors.
     * This endpoint is public and does not require authentication.
     *
     * @response {
     *   "data": [
     *     {
     *       "id": 1,
     *       "title": "My First Note",
     *       "content": "This is the content of my first note",
     *       "userId": 1,
     *       "authorName": "John Doe",
     *       "created_at": "2025-05-07T01:00:00.000000Z",
     *       "updated_at": "2025-05-07T01:00:00.000000Z"
     *     },
     *     {
     *       "id": 2,
     *       "title": "Another Note",
     *       "content": "This is another note with some content",
     *       "userId": 2,
     *       "authorName": "Jane Smith",
     *       "created_at": "2025-05-07T01:10:00.000000Z",
     *       "updated_at": "2025-05-07T01:10:00.000000Z"
     *     }
     *   ]
     * }
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        // Retrieve all notes. `Note` is an Eloquent model.
        // `with('user')` performs eager loading of the 'user' relationship (defined in the Note model).
        // This is crucial for performance as it fetches all related user data in a single additional query,
        // preventing the "N+1 query problem" that would occur if each note's user was loaded separately.
        $notes = Note::with('user')->get();

        // `NoteResource::collection($notes)` transforms the collection of Note models
        // into a JSON-serializable array, where each note is formatted by `NoteResource`.
        // This allows consistent formatting and control over which data is exposed.
        return response()->json(NoteResource::collection($notes));
    }

    /**
     * Create a new note for the authenticated user.
     *
     * Custom validation error messages for this endpoint are defined in ExtendedNoteSchema
     * at packages/api-types/src/extendedSchemas.ts.
     *
     * @authenticated
     *
     * @bodyParam title string required The title of the note. Example: My Note Title
     * @bodyParam content string required The content of the note. Example: This is the content of my note
     *
     * @response {
     *   "id": 3,
     *   "title": "My Note Title",
     *   "content": "This is the content of my note",
     *   "userId": 1,
     *   "authorName": "John Doe",
     *   "created_at": "2025-05-07T01:30:00.000000Z",
     *   "updated_at": "2025-05-07T01:30:00.000000Z"
     * }
     *
     * @response 401 {
     *   "message": "Unauthenticated."
     * }
     *
     * @response 422 {
     *   "message": "The given data was invalid.",
     *   "errors": {
     *     "title": ["The title field is required."],
     *     "content": ["The content field is required."]
     *   }
     * }
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Laravel's built-in validation. If validation fails, it automatically
        // throws a ValidationException, resulting in a 422 JSON response with errors.
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        // Retrieve the currently authenticated user instance.
        // This is made available by Laravel Sanctum (or other auth middleware)
        // after validating the API token from the request.
        $user = $request->user();

        // Create a new note using the Note Eloquent model.
        // The 'user_id' is set to the authenticated user's ID to associate the note with its author.
        // For `Note::create()` to work, 'user_id', 'title', and 'content' must be in the `$fillable`
        // array in the `app/Models/Note.php` model to protect against mass assignment vulnerabilities.
        $note = Note::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'content' => $validated['content'],
        ]);

        // After creating the note, explicitly load the 'user' relationship onto this instance.
        // This ensures that the `NoteResource` can access the author's details (e.g., name)
        // without triggering an additional database query when the resource is being prepared.
        $note->load('user');

        // Return the newly created note, formatted by `NoteResource`, as a JSON response.
        // HTTP status 201 ("Created") is standard for successful resource creation.
        return response()->json(new NoteResource($note), 201);
    }
}
