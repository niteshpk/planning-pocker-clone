import { NextRequest } from 'next/server';
import { getConnection } from '@/lib/db';
import { Story, Room } from '@/models';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';
import { UpdateStoryRequest } from '@/types/api';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ storyId: string }> }
) {
  try {
    await getConnection();
    
    const { storyId } = await context.params;
    const body: UpdateStoryRequest = await request.json();

    const story = await Story.findById(parseInt(storyId));

    if (!story) {
      return createErrorResponse('Story not found', 404);
    }

    // Transform the update data to match MySQL field names
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.estimate !== undefined) updateData.estimate = body.estimate;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;

    // If setting this story as active, deactivate all other stories in the room
    if (body.isActive === true) {
      await Story.setActive(parseInt(storyId), story.room_id);
      
      // Also update room's current_story_id
      await Room.update(story.room_id.toString(), { current_story_id: parseInt(storyId) });
    } else {
      // Just update the story normally
      const updatedStory = await Story.update(parseInt(storyId), updateData);
      
      if (!updatedStory) {
        return createErrorResponse('Failed to update story', 500);
      }
    }

    // Get the updated story
    const finalStory = await Story.findById(parseInt(storyId));

    if (!finalStory) {
      return createErrorResponse('Story not found after update', 500);
    }

    // Transform the response to match the expected format
    const storyResponse = {
      ...finalStory,
      id: finalStory.id!.toString(),
      isActive: finalStory.is_active,
      roomId: finalStory.room_id
    };

    return createSuccessResponse(storyResponse, 'Story updated successfully');
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
    await getConnection();
    
    const { storyId } = await context.params;

    const story = await Story.findById(parseInt(storyId));

    if (!story) {
      return createErrorResponse('Story not found', 404);
    }

    // If this was the current story, clear it from the room
    if (story.is_active) {
      await Room.update(story.room_id.toString(), { current_story_id: undefined });
    }

    const deleted = await Story.delete(parseInt(storyId));

    if (!deleted) {
      return createErrorResponse('Failed to delete story', 500);
    }

    return createSuccessResponse(null, 'Story deleted successfully');
  } catch (error) {
    console.error('Error deleting story:', error);
    return createErrorResponse('Failed to delete story', 500);
  }
}