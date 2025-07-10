<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\PlanningPokerUser;

Broadcast::channel('room.{roomId}', function ($request, $roomId) {
    \Log::info('[Broadcast Auth]', [
        'roomId' => $roomId,
        'participant_id' => $request->input('participant_id'),
    ]);

    $participant = PlanningPokerUser::where('room_id', $roomId)
        ->where('id', $request->input('participant_id'))
        ->first();

    if (!$participant) {
        \Log::warning('[Broadcast Auth] Participant not found');
        return false;
    }

    return [
        'id' => $participant->id,
        'name' => $participant->name,
        'is_host' => $participant->is_host,
    ];
});
