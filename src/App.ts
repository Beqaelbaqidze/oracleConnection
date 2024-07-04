import express, { Request, Response, Express } from 'express';
import { Database } from './Database';
import { DBConfig } from './dbConfig';

interface RouteConfig {
  route: string;
  method: 'GET' | 'POST';
  queries: { query: string, params?: any[] }[];
}

export class App {
  private app: Express;
  private database: Database;
  private routes: RouteConfig[] = [];

  constructor(dbConfig: DBConfig) {
    this.app = express();
    this.database = new Database(dbConfig);
  }

  async initialize() {
    await this.database.initialize();
    this.setupRoutes();
  }

  addRoute(routeConfig: RouteConfig) {
    this.routes.push(routeConfig);
  }

  private setupRoutes() {
    this.routes.forEach(routeConfig => {
      if (routeConfig.method === 'GET') {
        this.app.get(routeConfig.route, async (req: Request, res: Response) => {
          try {
            const results = await Promise.all(
              routeConfig.queries.map(q => this.database.runQuery(q.query, q.params))
            );
            res.json(results.map(result => result.rows));
          } catch (err) {
            res.status(500).send('Error retrieving data');
          }
        });
      } else if (routeConfig.method === 'POST') {
        this.app.post(routeConfig.route, async (req: Request, res: Response) => {
          try {
            const results = await Promise.all(
              routeConfig.queries.map(q => this.database.runQuery(q.query, q.params))
            );
            res.json(results.map(result => result.rows));
          } catch (err) {
            res.status(500).send('Error retrieving data');
          }
        });
      }
    });
  }

  listen(port: number) {
    this.app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }

  async close() {
    await this.database.closePool();
  }
}
