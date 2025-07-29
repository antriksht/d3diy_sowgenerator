import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      // In a serverless environment, we might not have a direct 'log' function
      // but console.log will go to Netlify Function logs.
      console.log(logLine);
    }
  });

  next();
});

export const setupApp = async () => {
  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error("Express error:", err); // Log error in serverless context
  });

  return app;
};

// For local development/testing if needed, but not used by Netlify Function
if (process.env.NODE_ENV !== "production" && process.env.REPL_ID === undefined) {
  setupApp().then(app => {
    const port = parseInt(process.env.PORT || '5000', 10);
    app.listen(port, () => {
      console.log(`Local server serving on port ${port}`);
    });
  });
}

