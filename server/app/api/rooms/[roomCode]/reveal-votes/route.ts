import { NextRequest } from 'next/server';
import { getConnection } from '@/lib/db';
import { Room } from '@/models';
import { createSuccessResponse, createErrorResponse, validateRoomCode } from '@/utils/api';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    await getConnection();
    
    const { roomCode } = await context.params;

    if (!validateRoomCode(roomCode)) {
      return createErrorResponse('Invalid room code format', 400);
    }

    const room = await Room.findByRoomCode(roomCode.toUpperCase());

    if (!room) {
      return createErrorResponse('Room not found', 404);
    }

    const updatedRoom = await Room.revealVotes(roomCode.toUpperCase());

    if (!updatedRoom) {
      return createErrorResponse('Failed to reveal votes', 500);
    }

    // Transform the response to match the expected format
    const roomResponse = {
      ...updatedRoom,
      id: updatedRoom.id!.toString(),
      roomCode: updatedRoom.room_code,
      hostId: updatedRoom.host_id,
      isVotingRevealed: updatedRoom.is_voting_revealed,
      currentStoryId: updatedRoom.current_story_id,
      votingSystemName: updatedRoom.voting_system_name
    };

    return createSuccessResponse(roomResponse, 'Votes revealed successfully');
  } catch (error) {
    console.error('Error revealing votes:', error);
    return createErrorResponse('Failed to reveal votes', 500);
  }
}