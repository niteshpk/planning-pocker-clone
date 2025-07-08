import { NextRequest } from 'next/server';
import { getConnection } from '@/lib/db';
import { User, Room } from '@/models';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';
import { CastVoteRequest } from '@/types/api';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await getConnection();
    
    const { userId } = await context.params;
    const body: CastVoteRequest = await request.json();
    const { vote } = body;

    if (!vote) {
      return createErrorResponse('Vote value is required', 400);
    }

    const user = await User.findById(parseInt(userId));

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Get the room to check voting status
    const room = await Room.findById(user.room_id);

    if (!room) {
      return createErrorResponse('Room not found', 404);
    }

    if (room.is_voting_revealed) {
      return createErrorResponse('Cannot vote after votes are revealed', 400);
    }

    const updatedUser = await User.vote(parseInt(userId), vote);

    if (!updatedUser) {
      return createErrorResponse('Failed to cast vote', 500);
    }

    // Transform the response to match the expected format
    const userResponse = {
      ...updatedUser,
      id: updatedUser.id!.toString(),
      isHost: updatedUser.is_host,
      isConnected: updatedUser.is_connected,
      hasVoted: updatedUser.has_voted,
      roomId: updatedUser.room_id
    };

    return createSuccessResponse(userResponse, 'Vote cast successfully');
  } catch (error) {
    console.error('Error casting vote:', error);
    return createErrorResponse('Failed to cast vote', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await getConnection();
    
    const { userId } = await context.params;

    const user = await User.findById(parseInt(userId));

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Get the room to check voting status
    const room = await Room.findById(user.room_id);

    if (!room) {
      return createErrorResponse('Room not found', 404);
    }

    if (room.is_voting_revealed) {
      return createErrorResponse('Cannot clear vote after votes are revealed', 400);
    }

    const updatedUser = await User.clearVote(parseInt(userId));

    if (!updatedUser) {
      return createErrorResponse('Failed to clear vote', 500);
    }

    // Transform the response to match the expected format
    const userResponse = {
      ...updatedUser,
      id: updatedUser.id!.toString(),
      isHost: updatedUser.is_host,
      isConnected: updatedUser.is_connected,
      hasVoted: updatedUser.has_voted,
      roomId: updatedUser.room_id
    };

    return createSuccessResponse(userResponse, 'Vote cleared successfully');
  } catch (error) {
    console.error('Error clearing vote:', error);
    return createErrorResponse('Failed to clear vote', 500);
  }
}