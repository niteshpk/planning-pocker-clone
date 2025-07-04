import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';
import { seedVotingSystems } from '@/utils/seed';

export async function GET(request: NextRequest) {
  try {
    // Ensure voting systems are seeded
    await seedVotingSystems();
    
    const votingSystems = await prisma.votingSystem.findMany({
      orderBy: { name: 'asc' }
    });

    return createSuccessResponse(votingSystems);
  } catch (error) {
    console.error('Error fetching voting systems:', error);
    return createErrorResponse('Failed to fetch voting systems', 500);
  }
}