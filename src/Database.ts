import oracledb, { Connection, Pool, PoolAttributes } from 'oracledb';
import { DBConfig } from './dbConfig';

export class Database {
  private pool!: Pool; // Use definite assignment assertion

  constructor(private config: DBConfig) {}

  async initialize() {
    try {
      this.pool = await oracledb.createPool(this.config as PoolAttributes);
      console.log('Connection pool started');
    } catch (err) {
      console.error('Error initializing connection pool', err);
      throw err;
    }
  }

  async closePool() {
    try {
      await this.pool.close();
      console.log('Connection pool closed');
    } catch (err) {
      console.error('Error closing connection pool', err);
      throw err;
    }
  }

  async runQuery(query: string, params: any[] = []) {
    let connection: Connection | null = null;
    try {
      connection = await this.pool.getConnection();
      const result = await connection.execute(query, params);
      return result;
    } catch (err) {
      console.error('Error running query', err);
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error closing connection', err);
        }
      }
    }
  }
}
