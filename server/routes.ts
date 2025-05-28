import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve the CSV files for client-side parsing
  app.get('/movies_metadata.csv', (req, res) => {
    const csvPath = path.join(process.cwd(), 'public', 'movies_metadata.csv');
    res.sendFile(csvPath);
  });

  app.get('/movies.csv', (req, res) => {
    const csvPath = path.join(process.cwd(), 'public', 'movies.csv');
    res.sendFile(csvPath);
  });

  app.get('/ratings.csv', (req, res) => {
    const csvPath = path.join(process.cwd(), 'public', 'ratings.csv');
    res.sendFile(csvPath);
  });

  app.get('/tags.csv', (req, res) => {
    const csvPath = path.join(process.cwd(), 'public', 'tags.csv');
    res.sendFile(csvPath);
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'MoodFlix API is running' });
  });

  const httpServer = createServer(app);

  return httpServer;
}
