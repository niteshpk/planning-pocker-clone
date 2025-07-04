import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, validateRoomCode } from '@/utils/api';
import { UpdateRoomRequest } from '@/types/api';

export async function GET(
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
        users: {
          orderBy: { createdAt: 'asc' }
        },
        stories: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!room) {
      return createErrorResponse('Room not found', 404);
    }

    return createSuccessResponse(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    return createErrorResponse('Failed to fetch room', 500);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await context.params;
    const body: UpdateRoomRequest = await request.json();

    if (!validateRoomCode(roomCode)) {
      return createErrorResponse('Invalid room code format', 400);
    }

    const room = await prisma.room.findUnique({
      where: { roomCode: roomCode.toUpperCase() }
    });

    if (!room) {
      return createErrorResponse('Room not found', 404);
    }

    const updatedRoom = await prisma.room.update({
      where: { roomCode: roomCode.toUpperCase() },
      data: body,
      include: {
        users: {
          orderBy: { createdAt: 'asc' }
        },
        stories: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return createSuccessResponse(updatedRoom, 'Room updated successfully');
  } catch (error) {
    console.error('Error updating room:', error);
    return createErrorResponse('Failed to update room', 500);
  }
}

export async function DELETE(
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

    await prisma.room.delete({
      where: { roomCode: roomCode.toUpperCase() }
    });

    return createSuccessResponse(null, 'Room deleted successfully');
  } catch (error) {
    console.error('Error deleting room:', error);
    return createErrorResponse('Failed to delete room', 500);
  }
}