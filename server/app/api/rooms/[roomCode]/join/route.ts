import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, validateRoomCode } from '@/utils/api';
import { JoinRoomRequest } from '@/types/api';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await context.params;
    const body: JoinRoomRequest = await request.json();
    const { userName } = body;

    if (!validateRoomCode(roomCode)) {
      return createErrorResponse('Invalid room code format', 400);
    }

    if (!userName || userName.trim().length === 0) {
      return createErrorResponse('User name is required', 400);
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

    // Check if user with same name already exists in room
    const existingUser = room.users.find(user => 
      user.name.toLowerCase() === userName.trim().toLowerCase()
    );

    if (existingUser) {
      // Update existing user to connected and return room data
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: { isConnected: true }
      });

      const updatedRoom = await prisma.room.findUnique({
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

      return createSuccessResponse({
        room: updatedRoom,
        user: updatedUser
      }, 'Rejoined room successfully');
    }

    // Create new user in the room
    const newUser = await prisma.user.create({
      data: {
        name: userName.trim(),
        isHost: false,
        isConnected: true,
        roomId: room.id
      }
    });

    const updatedRoom = await prisma.room.findUnique({
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

    return createSuccessResponse({
      room: updatedRoom,
      user: newUser
    }, 'Joined room successfully');
  } catch (error) {
    console.error('Error joining room:', error);
    return createErrorResponse('Failed to join room', 500);
  }
}