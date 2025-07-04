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
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function validateRoomCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}