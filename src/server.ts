import { App } from './App';
import { DBConfig } from './dbConfig';
import { Request } from 'express';

const dbConfig: DBConfig = {
  user: 'your_username',
  password: 'your_password',
  connectString: 'your_connect_string'
};

const app = new App(dbConfig);

// Example route with dynamic parameters
app.addRoute({
  route: '/data',
  method: 'GET',
  queries: [
    {
      query: `SELECT * FROM your_table WHERE your_column = :value`,
      params: (req: Request) => [req.query.value || 'default_value']
    },
    {
      query: `SELECT * FROM another_table WHERE another_column = :another_value`,
      params: (req: Request) => [req.query.another_value || 'default_value']
    }
  ]
});

// Example route calling an Oracle function
app.addRoute({
  route: '/call-function',
  method: 'POST',
  functions: [
    {
      funcName: 'get_data_cursor',
      params: (req: Request) => [req.body ? req.body.value : 'default_value']
    }
  ]
});

app.initialize().then(() => {
  app.listen(3000);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await app.close();
    console.log('Server closed');
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    await app.close();
    console.log('Server closed');
    process.exit(0);
  });
}).catch(err => {
  console.error('Error initializing app', err);
});
