import express, { Request, Response, Express } from 'express';
import { Database } from './Database';
import { DBConfig } from './dbConfig';

interface QueryConfig {
  query: string;
  params?: (req: Request) => any[];
}

interface FunctionConfig {
  funcName: string;
  params?: (req: Request) => any[];
}

type RouteConfig = {
  route: string;
  method: 'GET' | 'POST';
  queries?: QueryConfig[];
  functions?: FunctionConfig[];
};

export class App {
  private app: Express;
  private database: Database;
  private routes: RouteConfig[] = [];

  constructor(dbConfig: DBConfig) {
    this.app = express();
    this.database = new Database(dbConfig);

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
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
      const handler = async (req: Request, res: Response) => {
        try {
          if (routeConfig.queries) {
            const results = await Promise.all(
              routeConfig.queries.map(q => this.database.runQuery(q.query, q.params ? q.params(req) : []))
            );
            res.json(results.map(result => result.rows));
          } else if (routeConfig.functions) {
            const results = await Promise.all(
              routeConfig.functions.map(f => this.database.callFunction(f.funcName, f.params ? f.params(req) : []))
            );
            res.json(results);
          } else {
            res.status(400).send('No queries or functions provided');
          }
        } catch (err) {
          res.status(500).send('Error retrieving data');
        }
      };

      if (routeConfig.method === 'GET') {
        this.app.get(routeConfig.route, handler);
      } else if (routeConfig.method === 'POST') {
        this.app.post(routeConfig.route, handler);
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
