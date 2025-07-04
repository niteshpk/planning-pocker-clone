import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, validateRoomCode } from '@/utils/api';
import { CreateStoryRequest } from '@/types/api';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await context.params;
    const body: CreateStoryRequest = await request.json();
    const { title, description } = body;

    if (!validateRoomCode(roomCode)) {
      return createErrorResponse('Invalid room code format', 400);
    }

    if (!title || title.trim().length === 0) {
      return createErrorResponse('Story title is required', 400);
    }

    const room = await prisma.room.findUnique({
      where: { roomCode: roomCode.toUpperCase() }
    });

    if (!room) {
      return createErrorResponse('Room not found', 404);
    }

    const story = await prisma.story.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        roomId: room.id
      }
    });

    return createSuccessResponse(story, 'Story created successfully', 201);
  } catch (error) {
    console.error('Error creating story:', error);
    return createErrorResponse('Failed to create story', 500);
  }
}