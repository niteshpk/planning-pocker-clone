import { query, queryOne } from '../lib/db';

export interface Story {
  id?: number;
  title: string;
  description?: string;
  estimate?: string;
  is_active: boolean;
  room_id: number;
  created_at?: Date;
  updated_at?: Date;
}

class StoryModel {
  async findById(id: number): Promise<Story | null> {
    return await queryOne(
      'SELECT * FROM stories WHERE id = ?',
      [id]
    ) as Story | null;
  }

  async findByRoomId(roomId: number): Promise<Story[]> {
    return await query(
      'SELECT * FROM stories WHERE room_id = ? ORDER BY created_at ASC',
      [roomId]
    ) as Story[];
  }

  async findActiveByRoomId(roomId: number): Promise<Story | null> {
    return await queryOne(
      'SELECT * FROM stories WHERE room_id = ? AND is_active = TRUE',
      [roomId]
    ) as Story | null;
  }

  async create(storyData: Omit<Story, 'id' | 'created_at' | 'updated_at'>): Promise<Story> {
    const result = await query(
      `INSERT INTO stories (title, description, estimate, is_active, room_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        storyData.title,
        storyData.description || null,
        storyData.estimate || null,
        storyData.is_active,
        storyData.room_id
      ]
    ) as any;

    return await this.findById(result.insertId) as Story;
  }

  async update(id: number, updates: Partial<Story>): Promise<Story | null> {
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
      `UPDATE stories SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM stories WHERE id = ?',
      [id]
    ) as any;

    return result.affectedRows > 0;
  }

  async deleteByRoomId(roomId: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM stories WHERE room_id = ?',
      [roomId]
    ) as any;

    return result.affectedRows > 0;
  }

  async setActive(id: number, roomId: number): Promise<Story | null> {
    // First, deactivate all stories in the room
    await query(
      'UPDATE stories SET is_active = FALSE WHERE room_id = ?',
      [roomId]
    );

    // Then activate the specific story
    await query(
      'UPDATE stories SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    return await this.findById(id);
  }

  async deactivateAll(roomId: number): Promise<void> {
    await query(
      'UPDATE stories SET is_active = FALSE WHERE room_id = ?',
      [roomId]
    );
  }
}

export default new StoryModel();