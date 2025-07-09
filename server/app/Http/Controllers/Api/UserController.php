<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlanningPokerUser;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    use ApiResponseTrait;

    /**
     * Cast a vote for a user.
     */
    public function vote(Request $request, string $userId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'vote' => 'required|string|max:50'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse($validator->errors()->first(), 400);
            }

            $user = PlanningPokerUser::find($userId);

            if (!$user) {
                return $this->errorResponse('User not found', 404);
            }

            // Check if room exists and voting is allowed
            $room = Room::find($user->room_id);

            if (!$room) {
                return $this->errorResponse('Room not found', 404);
            }

            if ($room->is_voting_revealed) {
                return $this->errorResponse('Cannot vote after votes are revealed', 400);
            }

            // Cast the vote
            $user->castVote($request->vote);

            $userData = $this->formatUserResponse($user);

            return $this->successResponse($userData, 'Vote cast successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to cast vote', 500);
        }
    }

    /**
     * Clear a user's vote.
     */
    public function clearVote(string $userId): JsonResponse
    {
        try {
            $user = PlanningPokerUser::find($userId);

            if (!$user) {
                return $this->errorResponse('User not found', 404);
            }

            // Check if room exists and voting is allowed
            $room = Room::find($user->room_id);

            if (!$room) {
                return $this->errorResponse('Room not found', 404);
            }

            if ($room->is_voting_revealed) {
                return $this->errorResponse('Cannot clear vote after votes are revealed', 400);
            }

            // Clear the vote
            $user->clearVote();

            $userData = $this->formatUserResponse($user);

            return $this->successResponse($userData, 'Vote cleared successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to clear vote', 500);
        }
    }

    /**
     * Update user information.
     */
    public function update(Request $request, string $userId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'isConnected' => 'sometimes|boolean',
                'vote' => 'sometimes|nullable|string|max:50',
                'hasVoted' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse($validator->errors()->first(), 400);
            }

            $user = PlanningPokerUser::find($userId);

            if (!$user) {
                return $this->errorResponse('User not found', 404);
            }

            $updateData = [];
            $data = $validator->validated();

            if (isset($data['name'])) $updateData['name'] = $data['name'];
            if (isset($data['isConnected'])) $updateData['is_connected'] = $data['isConnected'];
            if (isset($data['vote'])) $updateData['vote'] = $data['vote'];
            if (isset($data['hasVoted'])) $updateData['has_voted'] = $data['hasVoted'];

            $user->update($updateData);

            $userData = $this->formatUserResponse($user);

            return $this->successResponse($userData, 'User updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update user', 500);
        }
    }

    /**
     * Get user information.
     */
    public function show(string $userId): JsonResponse
    {
        try {
            $user = PlanningPokerUser::find($userId);

            if (!$user) {
                return $this->errorResponse('User not found', 404);
            }

            $userData = $this->formatUserResponse($user);

            return $this->successResponse($userData);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch user', 500);
        }
    }

    private function formatUserResponse(PlanningPokerUser $user): array
    {
        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'isHost' => $user->is_host,
            'isConnected' => $user->is_connected,
            'hasVoted' => $user->has_voted,
            'vote' => $user->vote,
            'roomId' => $user->room_id
        ];
    }
}