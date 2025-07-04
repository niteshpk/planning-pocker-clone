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
      where: { roomCode: roomCode.toUpperCase() },
      include: {
        users: true,
        stories: true
      }
    });

    if (!room) {
      return createErrorResponse('Room not found', 404);
    }

    const updatedRoom = await prisma.room.update({
      where: { roomCode: roomCode.toUpperCase() },
      data: { isVotingRevealed: true },
      include: {
        users: {
          orderBy: { createdAt: 'asc' }
        },
        stories: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return createSuccessResponse(updatedRoom, 'Votes revealed successfully');
  } catch (error) {
    console.error('Error revealing votes:', error);
    return createErrorResponse('Failed to reveal votes', 500);
  }
}