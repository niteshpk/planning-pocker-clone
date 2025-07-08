import { NextRequest } from 'next/server';
import { getConnection } from '@/lib/db';
import { Room, User } from '@/models';
import { createSuccessResponse, createErrorResponse, validateRoomCode } from '@/utils/api';
import { JoinRoomRequest } from '@/types/api';
import { getVotingSystemByName, getDefaultVotingSystem } from '@/utils/voting-systems';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    const connection = await getConnection();
    if (!connection) {
      return createErrorResponse('Database not available in development mode', 503);
    }
    
    const { roomCode } = await context.params;
    const body: JoinRoomRequest = await request.json();
    const { userName } = body;

    if (!validateRoomCode(roomCode)) {
      return createErrorResponse('Invalid room code format', 400);
    }

    if (!userName || userName.trim().length === 0) {
      return createErrorResponse('User name is required', 400);
    }

    const room = await Room.findByRoomCode(roomCode.toUpperCase());

    if (!room) {
      return createErrorResponse('Room not found', 404);
    }

    // Check if user with same name already exists in room
    const existingUser = room.users?.find((user: any) => 
      user.name.toLowerCase() === userName.trim().toLowerCase()
    );

    if (existingUser) {
      // Update existing user to connected and return room data
      const updatedUser = await User.update(existingUser.id, { is_connected: true });

      const updatedRoom = await Room.findByRoomCode(roomCode.toUpperCase());

      if (!updatedRoom) {
        return createErrorResponse('Room not found', 404);
      }

      // Get the voting system object
      const votingSystemData = getVotingSystemByName(updatedRoom.voting_system_name) || getDefaultVotingSystem();

      // Transform the response to match the expected format
      const roomWithVotingSystem = {
        ...updatedRoom,
        id: updatedRoom.id!.toString(),
        roomCode: updatedRoom.room_code,
        hostId: updatedRoom.host_id,
        isVotingRevealed: updatedRoom.is_voting_revealed,
        currentStoryId: updatedRoom.current_story_id,
        votingSystemName: updatedRoom.voting_system_name,
        votingSystem: votingSystemData
      };

      return createSuccessResponse({
        room: roomWithVotingSystem,
        user: {
          ...updatedUser,
          id: updatedUser!.id!.toString(),
          isHost: updatedUser!.is_host,
          isConnected: updatedUser!.is_connected,
          hasVoted: updatedUser!.has_voted,
          roomId: updatedUser!.room_id
        }
      }, 'Rejoined room successfully');
    }

    // Create new user in the room
    const newUser = await User.create({
      name: userName.trim(),
      is_host: false,
      is_connected: true,
      has_voted: false,
      room_id: room.id!
    });

    const updatedRoom = await Room.findByRoomCode(roomCode.toUpperCase());

    if (!updatedRoom) {
      return createErrorResponse('Room not found', 404);
    }

    // Get the voting system object
    const votingSystemData = getVotingSystemByName(updatedRoom.voting_system_name) || getDefaultVotingSystem();

    // Transform the response to match the expected format
    const roomWithVotingSystem = {
      ...updatedRoom,
      id: updatedRoom.id!.toString(),
      roomCode: updatedRoom.room_code,
      hostId: updatedRoom.host_id,
      isVotingRevealed: updatedRoom.is_voting_revealed,
      currentStoryId: updatedRoom.current_story_id,
      votingSystemName: updatedRoom.voting_system_name,
      votingSystem: votingSystemData
    };

    return createSuccessResponse({
      room: roomWithVotingSystem,
      user: {
        ...newUser,
        id: newUser.id!.toString(),
        isHost: newUser.is_host,
        isConnected: newUser.is_connected,
        hasVoted: newUser.has_voted,
        roomId: newUser.room_id
      }
    }, 'Joined room successfully');
  } catch (error) {
    console.error('Error joining room:', error);
    return createErrorResponse('Failed to join room', 500);
  }
}