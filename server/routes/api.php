<?php

use App\Http\Controllers\Api\VotingSystemController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\StoryController;
use Illuminate\Support\Facades\Route;

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

// Voting Systems
Route::get('/voting-systems', [VotingSystemController::class, 'index']);

// Rooms
Route::post('/rooms', [RoomController::class, 'store']);
Route::get('/rooms/{roomCode}', [RoomController::class, 'show']);
Route::put('/rooms/{roomCode}', [RoomController::class, 'update']);
Route::delete('/rooms/{roomCode}', [RoomController::class, 'destroy']);

// Room Join
Route::post('/rooms/{roomCode}/join', [RoomController::class, 'join']);

// Room Stories
Route::get('/rooms/{roomCode}/stories', [StoryController::class, 'index']);
Route::post('/rooms/{roomCode}/stories', [StoryController::class, 'store']);

// Stories
Route::get('/stories/{storyId}', [StoryController::class, 'show']);
Route::put('/stories/{storyId}', [StoryController::class, 'update']);
Route::delete('/stories/{storyId}', [StoryController::class, 'destroy']);

// Users
Route::get('/users/{userId}', [UserController::class, 'show']);
Route::put('/users/{userId}', [UserController::class, 'update']);

// User Voting
Route::post('/users/{userId}/vote', [UserController::class, 'vote']);
Route::delete('/users/{userId}/vote', [UserController::class, 'clearVote']);



// Room Actions (additional endpoints that might be needed)
Route::post('/rooms/{roomCode}/reveal-votes', function($roomCode) {
    // This could be implemented as a room update with isVotingRevealed = true
    return response()->json(['message' => 'Use PUT /rooms/{roomCode} with isVotingRevealed: true']);
});

Route::post('/rooms/{roomCode}/clear-votes', function($roomCode) {
    // This could be implemented by clearing all user votes in the room
    return response()->json(['message' => 'Use individual user vote clearing endpoints']);
});