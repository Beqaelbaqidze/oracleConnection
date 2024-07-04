import oracledb, { Connection, Pool, PoolAttributes, Result } from 'oracledb';
import { DBConfig } from './dbConfig';

export class Database {
  private pool!: Pool;

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

  async callFunction(functionName: string, params: any[] = []) {
    let connection: Connection | null = null;
    try {
      connection = await this.pool.getConnection();
      const result = await connection.execute(
        `BEGIN :result := ${functionName}(:param1); END;`,
        {
          result: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          param1: params[0]
        }
      );
      const cursor = (result.outBinds as { result: oracledb.ResultSet<any> }).result;
      const rows = [];
      let row;
      while ((row = await cursor.getRow())) {
        rows.push(row);
      }
      await cursor.close();
      return rows;
    } catch (err) {
      console.error('Error calling function', err);
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
