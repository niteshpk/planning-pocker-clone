<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Story;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StoryController extends Controller
{
    use ApiResponseTrait;

    /**
     * Store a newly created story.
     */
    public function store(Request $request, string $roomCode): JsonResponse
    {
        try {
            if (!$this->isValidRoomCode($roomCode)) {
                return $this->errorResponse('Invalid room code format', 400);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:500',
                'description' => 'sometimes|nullable|string'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse($validator->errors()->first(), 400);
            }

            $room = Room::where('room_code', strtoupper($roomCode))->first();

            if (!$room) {
                return $this->errorResponse('Room not found', 404);
            }

            $data = $validator->validated();

            $story = Story::create([
                'title' => trim($data['title']),
                'description' => isset($data['description']) ? trim($data['description']) : null,
                'room_id' => $room->id,
            ]);

            $storyData = $this->formatStoryResponse($story);

            return $this->successResponse($storyData, 'Story created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create story', 500);
        }
    }

    /**
     * Display the specified story.
     */
    public function show(string $storyId): JsonResponse
    {
        try {
            $story = Story::find($storyId);

            if (!$story) {
                return $this->errorResponse('Story not found', 404);
            }

            $storyData = $this->formatStoryResponse($story);

            return $this->successResponse($storyData);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch story', 500);
        }
    }

    /**
     * Update the specified story.
     */
    public function update(Request $request, string $storyId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|string|max:500',
                'description' => 'sometimes|nullable|string',
                'estimate' => 'sometimes|nullable|string|max:50',
                'isActive' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse($validator->errors()->first(), 400);
            }

            $story = Story::find($storyId);

            if (!$story) {
                return $this->errorResponse('Story not found', 404);
            }

            $updateData = [];
            $data = $validator->validated();

            if (isset($data['title'])) $updateData['title'] = trim($data['title']);
            if (isset($data['description'])) $updateData['description'] = $data['description'] ? trim($data['description']) : null;
            if (isset($data['estimate'])) $updateData['estimate'] = $data['estimate'];
            if (isset($data['isActive'])) $updateData['is_active'] = $data['isActive'];

            $story->update($updateData);

            $storyData = $this->formatStoryResponse($story);

            return $this->successResponse($storyData, 'Story updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update story', 500);
        }
    }

    /**
     * Remove the specified story.
     */
    public function destroy(string $storyId): JsonResponse
    {
        try {
            $story = Story::find($storyId);

            if (!$story) {
                return $this->errorResponse('Story not found', 404);
            }

            $story->delete();

            return $this->successResponse(null, 'Story deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete story', 500);
        }
    }

    /**
     * Get all stories for a room.
     */
    public function index(string $roomCode): JsonResponse
    {
        try {
            if (!$this->isValidRoomCode($roomCode)) {
                return $this->errorResponse('Invalid room code format', 400);
            }

            $room = Room::where('room_code', strtoupper($roomCode))->first();

            if (!$room) {
                return $this->errorResponse('Room not found', 404);
            }

            $stories = Story::where('room_id', $room->id)->get();

            $storiesData = $stories->map(function ($story) {
                return $this->formatStoryResponse($story);
            });

            return $this->successResponse($storiesData);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch stories', 500);
        }
    }

    private function isValidRoomCode(string $roomCode): bool
    {
        return preg_match('/^[A-Z0-9]{6}$/', strtoupper($roomCode));
    }

    private function formatStoryResponse(Story $story): array
    {
        return [
            'id' => (string) $story->id,
            'title' => $story->title,
            'description' => $story->description,
            'estimate' => $story->estimate,
            'isActive' => $story->is_active,
            'roomId' => $story->room_id
        ];
    }
}