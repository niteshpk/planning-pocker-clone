import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'planning_poker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  idleTimeout: 600000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

let pool: mysql.Pool | null = null;

export async function getConnection() {
  if (!pool) {
    try {
      // Only create pool if we have proper database configuration
      if (!process.env.DB_HOST && !process.env.DB_PASSWORD) {
        console.log('Database not configured - using development mode');
        return null;
      }
      
      pool = mysql.createPool(DB_CONFIG);
      console.log('MySQL connection pool created');
      
      // Test the connection
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      console.log('Connected to MySQL database');
    } catch (error) {
      console.error('MySQL connection error:', error);
      // Don't throw error in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Continuing without database in development mode');
        return null;
      }
      throw error;
    }
  }
  
  return pool;
}

export async function query(sql: string, params: any[] = []): Promise<any[]> {
  const connection = await getConnection();
  if (!connection) {
    console.log('No database connection available');
    return [];
  }
  
  try {
    const [results] = await connection.execute(sql, params);
    return results as any[];
  } catch (error) {
    console.error('MySQL query error:', error);
    throw error;
  }
}

export async function queryOne(sql: string, params: any[] = []): Promise<any | null> {
  const results = await query(sql, params);
  return results.length > 0 ? results[0] : null;
}

export async function transaction(queries: Array<{ sql: string; params?: any[] }>) {
  const connection = await getConnection();
  if (!connection) {
    console.log('No database connection available for transaction');
    return [];
  }
  
  const conn = await connection.getConnection();
  
  try {
    await conn.beginTransaction();
    
    const results = [];
    for (const { sql, params = [] } of queries) {
      const [result] = await conn.execute(sql, params);
      results.push(result);
    }
    
    await conn.commit();
    return results;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export default { getConnection, query, queryOne, transaction };