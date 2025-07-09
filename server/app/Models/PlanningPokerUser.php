<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanningPokerUser extends Model
{
    use HasFactory;

    protected $table = 'planning_poker_users';

    protected $fillable = [
        'name',
        'is_host',
        'is_connected',
        'vote',
        'has_voted',
        'room_id',
    ];

    protected $casts = [
        'is_host' => 'boolean',
        'is_connected' => 'boolean',
        'has_voted' => 'boolean',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function castVote(string $vote): void
    {
        $this->update([
            'vote' => $vote,
            'has_voted' => true,
        ]);
    }

    public function clearVote(): void
    {
        $this->update([
            'vote' => null,
            'has_voted' => false,
        ]);
    }
}