<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VotingSystem;
use Illuminate\Http\JsonResponse;

class VotingSystemController extends Controller
{
    use ApiResponseTrait;

    /**
     * Display a listing of voting systems.
     */
    public function index(): JsonResponse
    {
        try {
            $votingSystems = VotingSystem::all();

            // If no voting systems exist, return default ones
            if ($votingSystems->isEmpty()) {
                $defaultSystems = [
                    [
                        'id' => 'default-1',
                        'name' => 'Fibonacci',
                        'values' => ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?']
                    ],
                    [
                        'id' => 'default-2',
                        'name' => 'T-Shirt Sizes',
                        'values' => ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?']
                    ]
                ];
                return $this->successResponse($defaultSystems);
            }

            return $this->successResponse($votingSystems);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch voting systems', 500);
        }
    }
}