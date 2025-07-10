<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\PlanningPokerUser;
use App\Models\VotingSystem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Events\MyEvent;

class RoomController extends Controller
{
    use ApiResponseTrait;

    /**
     * Store a newly created room.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'hostName' => 'required|string|max:255',
                'votingSystem' => 'sometimes|string|max:100'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse($validator->errors()->first(), 400);
            }

            $data = $validator->validated();
            $votingSystem = $data['votingSystem'] ?? 'Fibonacci';

            return DB::transaction(function () use ($data, $votingSystem) {
                // Generate unique room code
                $roomCode = Room::generateRoomCode();

                // Create room first
                $room = Room::create([
                    'room_code' => $roomCode,
                    'name' => $data['name'],
                    'voting_system_name' => $votingSystem,
                ]);

                // Create host user
                $hostUser = PlanningPokerUser::create([
                    'name' => $data['hostName'],
                    'is_host' => true,
                    'is_connected' => true,
                    'room_id' => $room->id,
                ]);

                // Update room with host ID
                $room->update(['host_id' => $hostUser->id]);

                // Load relationships
                $room->load(['users', 'host']);

                // Get voting system data
                $votingSystemData = $this->getVotingSystemData($votingSystem);

                // Format response
                $roomData = $this->formatRoomResponse($room, $votingSystemData);

                return $this->successResponse($roomData, 'Room created successfully', 201);
            });
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create room', 500);
        }
    }

    /**
     * Display the specified room.
     */
    public function show(string $roomCode): JsonResponse
    {
        try {
            if (!$this->isValidRoomCode($roomCode)) {
                return $this->errorResponse('Invalid room code format', 400);
            }

            $room = Room::with(['users', 'host', 'stories'])
                ->where('room_code', strtoupper($roomCode))
                ->first();

            if (!$room) {
                return $this->errorResponse('Room not found', 404);
            }

            $votingSystemData = $this->getVotingSystemData($room->voting_system_name);
            $roomData = $this->formatRoomResponse($room, $votingSystemData);

            return $this->successResponse($roomData);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch room', 500);
        }
    }

    /**
     * Update the specified room.
     */
    public function update(Request $request, string $roomCode): JsonResponse
    {
        try {
            if (!$this->isValidRoomCode($roomCode)) {
                return $this->errorResponse('Invalid room code format', 400);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'isVotingRevealed' => 'sometimes|boolean',
                'currentStoryId' => 'sometimes|nullable|string',
                'votingSystemName' => 'sometimes|string|max:100'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse($validator->errors()->first(), 400);
            }

            $room = Room::with(['users', 'host'])
                ->where('room_code', strtoupper($roomCode))
                ->first();

            if (!$room) {
                return $this->errorResponse('Room not found', 404);
            }

            $updateData = [];
            $data = $validator->validated();

            if (isset($data['name'])) $updateData['name'] = $data['name'];
            if (isset($data['isVotingRevealed'])) $updateData['is_voting_revealed'] = $data['isVotingRevealed'];
            if (isset($data['currentStoryId'])) $updateData['current_story_id'] = $data['currentStoryId'];
            if (isset($data['votingSystemName'])) $updateData['voting_system_name'] = $data['votingSystemName'];

            $room->update($updateData);
            $room->refresh();

            $votingSystemData = $this->getVotingSystemData($room->voting_system_name);
            $roomData = $this->formatRoomResponse($room, $votingSystemData);

            return $this->successResponse($roomData, 'Room updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update room', 500);
        }
    }

    /**
     * Remove the specified room.
     */
    public function destroy(string $roomCode): JsonResponse
    {
        try {
            if (!$this->isValidRoomCode($roomCode)) {
                return $this->errorResponse('Invalid room code format', 400);
            }

            $room = Room::where('room_code', strtoupper($roomCode))->first();

            if (!$room) {
                return $this->errorResponse('Room not found', 404);
            }

            $room->delete();

            return $this->successResponse(null, 'Room deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete room', 500);
        }
    }

    /**
     * Join a room.
     */
    public function join(Request $request, string $roomCode): JsonResponse
    {
        try {
            if (!$this->isValidRoomCode($roomCode)) {
                return $this->errorResponse('Invalid room code format', 400);
            }

            $validator = Validator::make($request->all(), [
                'userName' => 'required|string|max:255'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse($validator->errors()->first(), 400);
            }

            $userName = trim($request->userName);
            $room = Room::with(['users', 'host'])
                ->where('room_code', strtoupper($roomCode))
                ->first();

            if (!$room) {
                return $this->errorResponse('Room not found', 404);
            }

            // Check if user already exists
            $existingUser = $room->users->where('name', $userName)->first();

            if ($existingUser) {
                // Update existing user to connected
                $existingUser->update(['is_connected' => true]);
                $room->refresh();

                $votingSystemData = $this->getVotingSystemData($room->voting_system_name);
                $roomData = $this->formatRoomResponse($room, $votingSystemData);
                $userData = $this->formatUserResponse($existingUser);

                return $this->successResponse([
                    'room' => $roomData,
                    'user' => $userData
                ], 'Rejoined room successfully');
            }

            // Get voting system data first
            $votingSystemData = $this->getVotingSystemData($room->voting_system_name);

            // Create new user
            $newUser = PlanningPokerUser::create([
                'name' => $userName,
                'is_host' => false,
                'is_connected' => true,
                'room_id' => $room->id,
            ]);

            $room->refresh();

            $roomData = $this->formatRoomResponse($room, $votingSystemData);
            $userData = $this->formatUserResponse($newUser);

            event(new MyEvent('hello world'));

            return $this->successResponse([
                'room' => $roomData,
                'user' => $userData
            ], 'Joined room successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to join room', 500);
        }
    }

    private function isValidRoomCode(string $roomCode): bool
    {
        return preg_match('/^[A-Z0-9]{6}$/', strtoupper($roomCode));
    }

    private function getVotingSystemData(string $systemName): array
    {
        $votingSystem = VotingSystem::where('name', $systemName)->first();
        
        if ($votingSystem) {
            return [
                'name' => $votingSystem->name,
                'values' => $votingSystem->values
            ];
        }

        // Return default Fibonacci if not found
        return [
            'name' => 'Fibonacci',
            'values' => ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?']
        ];
    }

    private function formatRoomResponse(Room $room, array $votingSystemData): array
    {
        return [
            'id' => (string) $room->id,
            'roomCode' => $room->room_code,
            'name' => $room->name,
            'hostId' => $room->host_id,
            'isVotingRevealed' => $room->is_voting_revealed,
            'currentStoryId' => $room->current_story_id,
            'votingSystemName' => $room->voting_system_name,
            'votingSystem' => $votingSystemData,
            'users' => $room->users->map(function ($user) {
                return $this->formatUserResponse($user);
            }),
            'stories' => $room->stories ?? []
        ];
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