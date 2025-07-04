import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';
import { UpdateStoryRequest } from '@/types/api';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ storyId: string }> }
) {
  try {
    const { storyId } = await context.params;
    const body: UpdateStoryRequest = await request.json();

    const story = await prisma.story.findUnique({
      where: { id: storyId }
    });

    if (!story) {
      return createErrorResponse('Story not found', 404);
    }

    // If setting this story as active, deactivate all other stories in the room
    if (body.isActive === true) {
      await prisma.story.updateMany({
        where: { 
          roomId: story.roomId,
          id: { not: storyId }
        },
        data: { isActive: false }
      });

      // Also update room's currentStoryId
      await prisma.room.update({
        where: { id: story.roomId },
        data: { currentStoryId: storyId }
      });
    }

    const updatedStory = await prisma.story.update({
      where: { id: storyId },
      data: body
    });

    return createSuccessResponse(updatedStory, 'Story updated successfully');
  } catch (error) {
    console.error('Error updating story:', error);
    return createErrorResponse('Failed to update story', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ storyId: string }> }
) {
  try {
    const { storyId } = await context.params;

    const story = await prisma.story.findUnique({
      where: { id: storyId }
    });

    if (!story) {
      return createErrorResponse('Story not found', 404);
    }

    // If this was the current story, clear it from the room
    if (story.isActive) {
      await prisma.room.update({
        where: { id: story.roomId },
        data: { currentStoryId: null }
      });
    }

    await prisma.story.delete({
      where: { id: storyId }
    });

    return createSuccessResponse(null, 'Story deleted successfully');
  } catch (error) {
    console.error('Error deleting story:', error);
    return createErrorResponse('Failed to delete story', 500);
  }
}