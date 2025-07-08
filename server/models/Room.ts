import { query, queryOne, transaction } from '../lib/db';

export interface Room {
  id?: number;
  room_code: string;
  name: string;
  host_id?: number;
  is_voting_revealed: boolean;
  current_story_id?: number;
  voting_system_name: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface RoomWithRelations extends Room {
  users?: any[];
  stories?: any[];
}

class RoomModel {
  async findByRoomCode(roomCode: string): Promise<RoomWithRelations | null> {
    const room = await queryOne(
      'SELECT * FROM rooms WHERE room_code = ?',
      [roomCode.toUpperCase()]
    ) as Room | null;

    if (!room) return null;

    // Get users for this room
    const users = await query(
      'SELECT * FROM users WHERE room_id = ? ORDER BY created_at ASC',
      [room.id]
    );

    // Get stories for this room
    const stories = await query(
      'SELECT * FROM stories WHERE room_id = ? ORDER BY created_at ASC',
      [room.id]
    );

    return {
      ...room,
      users,
      stories
    };
  }

  async findById(id: number): Promise<RoomWithRelations | null> {
    const room = await queryOne(
      'SELECT * FROM rooms WHERE id = ?',
      [id]
    ) as Room | null;

    if (!room) return null;

    // Get users for this room
    const users = await query(
      'SELECT * FROM users WHERE room_id = ? ORDER BY created_at ASC',
      [room.id]
    );

    // Get stories for this room
    const stories = await query(
      'SELECT * FROM stories WHERE room_id = ? ORDER BY created_at ASC',
      [room.id]
    );

    return {
      ...room,
      users,
      stories
    };
  }

  async create(roomData: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> {
    const result = await query(
      `INSERT INTO rooms (room_code, name, host_id, is_voting_revealed, current_story_id, voting_system_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        roomData.room_code.toUpperCase(),
        roomData.name,
        roomData.host_id || null,
        roomData.is_voting_revealed,
        roomData.current_story_id || null,
        roomData.voting_system_name
      ]
    ) as any;

    return await this.findById(result.insertId) as Room;
  }

  async update(roomCode: string, updates: Partial<Room>): Promise<Room | null> {
    const setParts: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'room_code' && key !== 'created_at' && key !== 'updated_at') {
        setParts.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (setParts.length === 0) {
      return await this.findByRoomCode(roomCode) as Room;
    }

    values.push(roomCode.toUpperCase());

    await query(
      `UPDATE rooms SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE room_code = ?`,
      values
    );

    return await this.findByRoomCode(roomCode) as Room;
  }

  async delete(roomCode: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM rooms WHERE room_code = ?',
      [roomCode.toUpperCase()]
    ) as any;

    return result.affectedRows > 0;
  }

  async clearVotes(roomCode: string): Promise<void> {
    await query(
      `UPDATE users SET vote = NULL, has_voted = FALSE 
       WHERE room_id = (SELECT id FROM rooms WHERE room_code = ?)`,
      [roomCode.toUpperCase()]
    );
  }

  async revealVotes(roomCode: string): Promise<Room | null> {
    await query(
      'UPDATE rooms SET is_voting_revealed = TRUE WHERE room_code = ?',
      [roomCode.toUpperCase()]
    );

    return await this.findByRoomCode(roomCode);
  }
}

export default new RoomModel();