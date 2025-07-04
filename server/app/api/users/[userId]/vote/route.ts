import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';
import { CastVoteRequest } from '@/types/api';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const body: CastVoteRequest = await request.json();
    const { vote } = body;

    if (!vote) {
      return createErrorResponse('Vote value is required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { room: true }
    });

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    if (user.room.isVotingRevealed) {
      return createErrorResponse('Cannot vote after votes are revealed', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        vote,
        hasVoted: true
      }
    });

    return createSuccessResponse(updatedUser, 'Vote cast successfully');
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
    const { userId } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { room: true }
    });

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    if (user.room.isVotingRevealed) {
      return createErrorResponse('Cannot clear vote after votes are revealed', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        vote: null,
        hasVoted: false
      }
    });

    return createSuccessResponse(updatedUser, 'Vote cleared successfully');
  } catch (error) {
    console.error('Error clearing vote:', error);
    return createErrorResponse('Failed to clear vote', 500);
  }
}