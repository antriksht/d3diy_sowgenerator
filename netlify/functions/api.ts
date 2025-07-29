import serverless from "serverless-http";
import { setupApp } from "../../server/index";

let cachedServer: any;

export const handler = async (event: any, context: any) => {
  if (!cachedServer) {
    const app = await setupApp();
    cachedServer = serverless(app);
  }

  return cachedServer(event, context);
};
