import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, validateRoomCode } from '@/utils/api';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await context.params;

    if (!validateRoomCode(roomCode)) {
      return createErrorResponse('Invalid room code format', 400);
    }

    const room = await prisma.room.findUnique({
      where: { roomCode: roomCode.toUpperCase() }
    });

    if (!room) {
      return createErrorResponse('Room not found', 404);
    }

    // Clear all votes and reset voting state
    await prisma.user.updateMany({
      where: { roomId: room.id },
      data: {
        vote: null,
        hasVoted: false
      }
    });

    const updatedRoom = await prisma.room.update({
      where: { roomCode: roomCode.toUpperCase() },
      data: { isVotingRevealed: false },
      include: {
        users: {
          orderBy: { createdAt: 'asc' }
        },
        stories: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return createSuccessResponse(updatedRoom, 'Votes cleared successfully');
  } catch (error) {
    console.error('Error clearing votes:', error);
    return createErrorResponse('Failed to clear votes', 500);
  }
}