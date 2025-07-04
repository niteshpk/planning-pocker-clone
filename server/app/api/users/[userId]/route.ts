import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';
import { UpdateUserRequest } from '@/types/api';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const body: UpdateUserRequest = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: body
    });

    return createSuccessResponse(updatedUser, 'User updated successfully');
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
    const { userId } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return createSuccessResponse(null, 'User removed successfully');
  } catch (error) {
    console.error('Error removing user:', error);
    return createErrorResponse('Failed to remove user', 500);
  }
}