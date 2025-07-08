import { NextRequest } from 'next/server';
import { getConnection } from '@/lib/db';
import { Room, Story } from '@/models';
import { createSuccessResponse, createErrorResponse, validateRoomCode } from '@/utils/api';
import { CreateStoryRequest } from '@/types/api';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    await getConnection();
    
    const { roomCode } = await context.params;
    const body: CreateStoryRequest = await request.json();
    const { title, description } = body;

    if (!validateRoomCode(roomCode)) {
      return createErrorResponse('Invalid room code format', 400);
    }

    if (!title || title.trim().length === 0) {
      return createErrorResponse('Story title is required', 400);
    }

    const room = await Room.findByRoomCode(roomCode.toUpperCase());

    if (!room) {
      return createErrorResponse('Room not found', 404);
    }

    const story = await Story.create({
      title: title.trim(),
      description: description?.trim(),
      is_active: false,
      room_id: room.id!
    });

    // Transform the response to match the expected format
    const storyResponse = {
      ...story,
      id: story.id!.toString(),
      isActive: story.is_active,
      roomId: story.room_id
    };

    return createSuccessResponse(storyResponse, 'Story created successfully', 201);
  } catch (error) {
    console.error('Error creating story:', error);
    return createErrorResponse('Failed to create story', 500);
  }
}