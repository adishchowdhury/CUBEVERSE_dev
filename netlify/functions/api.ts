import serverless from 'serverless-http';
import { createServer } from '../../server';

let server: any;

export const handler = async (event: any, context: any) => {
  if (!server) {
    const app = await createServer();
    server = serverless(app);
  }
  return server(event, context);
};
