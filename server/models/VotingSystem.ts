import { query, queryOne } from '../lib/db';

export interface VotingSystem {
  id?: number;
  name: string;
  values: string[];
  created_at?: Date;
  updated_at?: Date;
}

class VotingSystemModel {
  async findAll(): Promise<VotingSystem[]> {
    const results = await query(
      'SELECT * FROM voting_systems ORDER BY name ASC'
    ) as any[];

    return results.map(row => ({
      ...row,
      values: JSON.parse(row.values)
    }));
  }

  async findByName(name: string): Promise<VotingSystem | null> {
    const result = await queryOne(
      'SELECT * FROM voting_systems WHERE name = ?',
      [name]
    ) as any;

    if (!result) return null;

    return {
      ...result,
      values: JSON.parse(result.values)
    };
  }

  async findById(id: number): Promise<VotingSystem | null> {
    const result = await queryOne(
      'SELECT * FROM voting_systems WHERE id = ?',
      [id]
    ) as any;

    if (!result) return null;

    return {
      ...result,
      values: JSON.parse(result.values)
    };
  }

  async create(votingSystemData: Omit<VotingSystem, 'id' | 'created_at' | 'updated_at'>): Promise<VotingSystem> {
    const result = await query(
      `INSERT INTO voting_systems (name, values)
       VALUES (?, ?)`,
      [
        votingSystemData.name,
        JSON.stringify(votingSystemData.values)
      ]
    ) as any;

    return await this.findById(result.insertId) as VotingSystem;
  }

  async update(id: number, updates: Partial<VotingSystem>): Promise<VotingSystem | null> {
    const setParts: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        setParts.push(`${key} = ?`);
        if (key === 'values') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    });

    if (setParts.length === 0) {
      return await this.findById(id);
    }

    values.push(id);

    await query(
      `UPDATE voting_systems SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM voting_systems WHERE id = ?',
      [id]
    ) as any;

    return result.affectedRows > 0;
  }
}

export default new VotingSystemModel();