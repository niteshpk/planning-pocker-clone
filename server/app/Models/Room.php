<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_code',
        'name',
        'host_id',
        'is_voting_revealed',
        'current_story_id',
        'voting_system_name',
    ];

    protected $casts = [
        'is_voting_revealed' => 'boolean',
    ];

    public function host(): BelongsTo
    {
        return $this->belongsTo(PlanningPokerUser::class, 'host_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(PlanningPokerUser::class);
    }

    public function stories(): HasMany
    {
        return $this->hasMany(Story::class);
    }

    public function currentStory(): BelongsTo
    {
        return $this->belongsTo(Story::class, 'current_story_id');
    }

    public static function generateRoomCode(): string
    {
        do {
            $code = strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 6));
        } while (self::where('room_code', $code)->exists());

        return $code;
    }
}