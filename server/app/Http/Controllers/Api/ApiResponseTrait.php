<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;

trait ApiResponseTrait
{
    protected function successResponse($data = null, string $message = null, int $status = 200): JsonResponse
    {
        $response = ['success' => true];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        if ($message) {
            $response['message'] = $message;
        }
        
        return response()->json($response, $status);
    }
    
    protected function errorResponse(string $error, int $status = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => $error
        ], $status);
    }
}