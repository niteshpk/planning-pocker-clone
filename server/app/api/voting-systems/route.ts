import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';

export async function GET(request: NextRequest) {
  try {
    const votingSystems = await prisma.votingSystem.findMany({
      orderBy: { name: 'asc' }
    });

    // If no voting systems exist, return default ones without seeding
    if (votingSystems.length === 0) {
      const defaultSystems = [
        {
          id: 'default-1',
          name: 'Fibonacci',
          values: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?']
        },
        {
          id: 'default-2', 
          name: 'T-Shirt Sizes',
          values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?']
        }
      ];
      return createSuccessResponse(defaultSystems);
    }

    return createSuccessResponse(votingSystems);
  } catch (error) {
    console.error('Error fetching voting systems:', error);
    return createErrorResponse('Failed to fetch voting systems', 500);
  }
}