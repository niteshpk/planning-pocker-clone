import { query, queryOne } from '../lib/db';

export interface User {
  id?: number;
  name: string;
  is_host: boolean;
  is_connected: boolean;
  vote?: string;
  has_voted: boolean;
  room_id: number;
  created_at?: Date;
  updated_at?: Date;
}

class UserModel {
  async findById(id: number): Promise<User | null> {
    return await queryOne(
      'SELECT * FROM users WHERE id = ?',
      [id]
    ) as User | null;
  }

  async findByRoomId(roomId: number): Promise<User[]> {
    return await query(
      'SELECT * FROM users WHERE room_id = ? ORDER BY created_at ASC',
      [roomId]
    ) as User[];
  }

  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const result = await query(
      `INSERT INTO users (name, is_host, is_connected, vote, has_voted, room_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userData.name,
        userData.is_host,
        userData.is_connected,
        userData.vote || null,
        userData.has_voted,
        userData.room_id
      ]
    ) as any;

    return await this.findById(result.insertId) as User;
  }

  async update(id: number, updates: Partial<User>): Promise<User | null> {
    const setParts: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        setParts.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (setParts.length === 0) {
      return await this.findById(id);
    }

    values.push(id);

    await query(
      `UPDATE users SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM users WHERE id = ?',
      [id]
    ) as any;

    return result.affectedRows > 0;
  }

  async deleteByRoomId(roomId: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM users WHERE room_id = ?',
      [roomId]
    ) as any;

    return result.affectedRows > 0;
  }

  async vote(userId: number, vote: string): Promise<User | null> {
    await query(
      'UPDATE users SET vote = ?, has_voted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [vote, userId]
    );

    return await this.findById(userId);
  }

  async clearVote(userId: number): Promise<User | null> {
    await query(
      'UPDATE users SET vote = NULL, has_voted = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );

    return await this.findById(userId);
  }

  async setConnectionStatus(userId: number, isConnected: boolean): Promise<User | null> {
    await query(
      'UPDATE users SET is_connected = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [isConnected, userId]
    );

    return await this.findById(userId);
  }
}

export default new UserModel();