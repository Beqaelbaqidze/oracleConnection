import { App } from './App';
import { DBConfig } from './dbConfig';

const dbConfig: DBConfig = {
  user: 'your_username',
  password: 'your_password',
  connectString: 'your_connect_string'
};

const app = new App(dbConfig);

app.addRoute({
  route: '/data',
  method: 'GET',
  queries: [
    {
      query: `SELECT * FROM your_table WHERE your_column = :value`,
      params: ['your_value']
    },
    {
      query: `SELECT * FROM another_table WHERE another_column = :another_value`,
      params: ['another_value']
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
