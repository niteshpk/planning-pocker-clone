import { NextRequest } from 'next/server';
import { getConnection } from '@/lib/db';
import { Room } from '@/models';
import { createSuccessResponse, createErrorResponse, validateRoomCode } from '@/utils/api';
import { UpdateRoomRequest } from '@/types/api';
import { getVotingSystemByName, getDefaultVotingSystem } from '@/utils/voting-systems';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    const connection = await getConnection();
    if (!connection) {
      return createErrorResponse('Database not available in development mode', 503);
    }
    
    const { roomCode } = await context.params;

    if (!validateRoomCode(roomCode)) {
      return createErrorResponse('Invalid room code format', 400);
    }

    const room = await Room.findByRoomCode(roomCode.toUpperCase());

    if (!room) {
      return createErrorResponse('Room not found', 404);
    }

    // Get the voting system object
    const votingSystemData = getVotingSystemByName(room.voting_system_name) || getDefaultVotingSystem();

    // Transform the response to match the expected format
    const roomWithVotingSystem = {
      ...room,
      id: room.id!.toString(),
      roomCode: room.room_code,
      hostId: room.host_id,
      isVotingRevealed: room.is_voting_revealed,
      currentStoryId: room.current_story_id,
      votingSystemName: room.voting_system_name,
      votingSystem: votingSystemData
    };

    return createSuccessResponse(roomWithVotingSystem);
  } catch (error) {
    console.error('Error fetching room:', error);
    return createErrorResponse('Failed to fetch room', 500);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    const connection = await getConnection();
    if (!connection) {
      return createErrorResponse('Database not available in development mode', 503);
    }
    
    const { roomCode } = await context.params;
    const body: UpdateRoomRequest = await request.json();

    if (!validateRoomCode(roomCode)) {
      return createErrorResponse('Invalid room code format', 400);
    }

    const room = await Room.findByRoomCode(roomCode.toUpperCase());

    if (!room) {
      return createErrorResponse('Room not found', 404);
    }

    // Transform the update data to match MySQL field names
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.isVotingRevealed !== undefined) updateData.is_voting_revealed = body.isVotingRevealed;
    if (body.currentStoryId !== undefined) updateData.current_story_id = body.currentStoryId;
    if (body.votingSystemName !== undefined) updateData.voting_system_name = body.votingSystemName;

    const updatedRoom = await Room.update(roomCode.toUpperCase(), updateData);

    if (!updatedRoom) {
      return createErrorResponse('Failed to update room', 500);
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

    return createSuccessResponse(roomWithVotingSystem, 'Room updated successfully');
  } catch (error) {
    console.error('Error updating room:', error);
    return createErrorResponse('Failed to update room', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    const connection = await getConnection();
    if (!connection) {
      return createErrorResponse('Database not available in development mode', 503);
    }
    
    const { roomCode } = await context.params;

    if (!validateRoomCode(roomCode)) {
      return createErrorResponse('Invalid room code format', 400);
    }

    const room = await Room.findByRoomCode(roomCode.toUpperCase());

    if (!room) {
      return createErrorResponse('Room not found', 404);
    }

    await Room.delete(roomCode.toUpperCase());

    return createSuccessResponse(null, 'Room deleted successfully');
  } catch (error) {
    console.error('Error deleting room:', error);
    return createErrorResponse('Failed to delete room', 500);
  }
}