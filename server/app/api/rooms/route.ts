import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, generateRoomCode } from '@/utils/api';
import { CreateRoomRequest } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const body: CreateRoomRequest = await request.json();
    const { name, hostName, votingSystem = 'Fibonacci' } = body;

    if (!name || !hostName) {
      return createErrorResponse('Room name and host name are required', 400);
    }

    // Generate unique room code
    let roomCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      roomCode = generateRoomCode();
      const existingRoom = await prisma.room.findUnique({
        where: { roomCode }
      });
      if (!existingRoom) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return createErrorResponse('Failed to generate unique room code. Please try again.', 500);
    }

    // Create room with host user
    const room = await prisma.room.create({
      data: {
        roomCode,
        name,
        hostId: '', // Will be updated after user creation
        votingSystemName: votingSystem,
        users: {
          create: {
            name: hostName,
            isHost: true,
            isConnected: true,
          }
        }
      },
      include: {
        users: true,
        stories: true,
      }
    });

    // Update room with host ID
    const hostUser = room.users[0];
    const updatedRoom = await prisma.room.update({
      where: { id: room.id },
      data: { hostId: hostUser.id },
      include: {
        users: true,
        stories: true,
      }
    });

    return createSuccessResponse(updatedRoom, 'Room created successfully', 201);
  } catch (error) {
    console.error('Error creating room:', error);
    return createErrorResponse('Failed to create room', 500);
  }
}