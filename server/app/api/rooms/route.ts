import { NextRequest } from 'next/server';
import { getConnection } from '@/lib/db';
import { Room, User } from '@/models';
import { createSuccessResponse, createErrorResponse, generateRoomCode } from '@/utils/api';
import { CreateRoomRequest } from '@/types/api';
import { getVotingSystemByName, getDefaultVotingSystem } from '@/utils/voting-systems';

export async function POST(request: NextRequest) {
  try {
    const connection = await getConnection();
    if (!connection) {
      return createErrorResponse('Database not available in development mode', 503);
    }
    
    const body: CreateRoomRequest = await request.json();
    const { name, hostName, votingSystem = 'Fibonacci' } = body;

    if (!name || !hostName) {
      return createErrorResponse('Room name and host name are required', 400);
    }

    // Generate unique room code
    let roomCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      roomCode = generateRoomCode();
      const existingRoom = await Room.findByRoomCode(roomCode);
      if (!existingRoom) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return createErrorResponse('Failed to generate unique room code. Please try again.', 500);
    }

    // Create room first
    const room = await Room.create({
      room_code: roomCode,
      name,
      host_id: undefined, // Will be updated after user creation
      is_voting_revealed: false,
      voting_system_name: votingSystem,
    });

    // Create host user separately
    const hostUser = await User.create({
      name: hostName,
      is_host: true,
      is_connected: true,
      has_voted: false,
      room_id: room.id!,
    });

    // Update room with host ID
    const updatedRoom = await Room.update(roomCode, { host_id: hostUser.id });

    // Get the voting system object
    const votingSystemData = getVotingSystemByName(updatedRoom!.voting_system_name) || getDefaultVotingSystem();

    // Add the voting system object to the response
    const roomWithVotingSystem = {
      ...updatedRoom,
      id: updatedRoom!.id!.toString(),
      roomCode: updatedRoom!.room_code,
      hostId: updatedRoom!.host_id,
      isVotingRevealed: updatedRoom!.is_voting_revealed,
      currentStoryId: updatedRoom!.current_story_id,
      votingSystemName: updatedRoom!.voting_system_name,
      votingSystem: votingSystemData
    };

    return createSuccessResponse(roomWithVotingSystem, 'Room created successfully', 201);
  } catch (error) {
    console.error('Error creating room:', error);
    return createErrorResponse('Failed to create room', 500);
  }
}