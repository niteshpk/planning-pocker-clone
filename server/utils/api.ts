import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success,
      data,
      error,
      message,
    },
    { status }
  );
}

export function createErrorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return createApiResponse(false, undefined, error, undefined, status);
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return createApiResponse(true, data, undefined, message, status);
}

export function generateRoomCode(): string {
  // Generate a 6-character room code using crypto for better randomness
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function validateRoomCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}