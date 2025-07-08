import { NextRequest } from 'next/server';
import { getConnection } from '@/lib/db';
import { User } from '@/models';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';
import { UpdateUserRequest } from '@/types/api';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await getConnection();
    
    const { userId } = await context.params;
    const body: UpdateUserRequest = await request.json();

    const user = await User.findById(parseInt(userId));

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Transform the update data to match MySQL field names
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.isConnected !== undefined) updateData.is_connected = body.isConnected;
    if (body.vote !== undefined) updateData.vote = body.vote;
    if (body.hasVoted !== undefined) updateData.has_voted = body.hasVoted;

    const updatedUser = await User.update(parseInt(userId), updateData);

    if (!updatedUser) {
      return createErrorResponse('Failed to update user', 500);
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

    return createSuccessResponse(userResponse, 'User updated successfully');
  } catch (error) {
    console.error('Error updating user:', error);
    return createErrorResponse('Failed to update user', 500);
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

    const deleted = await User.delete(parseInt(userId));

    if (!deleted) {
      return createErrorResponse('Failed to remove user', 500);
    }

    return createSuccessResponse(null, 'User removed successfully');
  } catch (error) {
    console.error('Error removing user:', error);
    return createErrorResponse('Failed to remove user', 500);
  }
}