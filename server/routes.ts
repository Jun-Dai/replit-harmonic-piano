import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTuningConfigSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for tuning configurations
  const apiRouter = express.Router();

  // Get all tuning configurations
  apiRouter.get("/tuning-configs", async (req, res) => {
    try {
      const configs = await storage.getTuningConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tuning configurations" });
    }
  });

  // Get a specific tuning configuration
  apiRouter.get("/tuning-configs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const config = await storage.getTuningConfig(id);
      if (!config) {
        return res.status(404).json({ message: "Tuning configuration not found" });
      }

      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tuning configuration" });
    }
  });

  // Create a new tuning configuration
  apiRouter.post("/tuning-configs", async (req, res) => {
    try {
      const configData = insertTuningConfigSchema.parse(req.body);
      const newConfig = await storage.createTuningConfig(configData);
      res.status(201).json(newConfig);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create tuning configuration" });
    }
  });

  // Update a tuning configuration
  apiRouter.put("/tuning-configs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const configData = insertTuningConfigSchema.partial().parse(req.body);
      const updatedConfig = await storage.updateTuningConfig(id, configData);
      
      if (!updatedConfig) {
        return res.status(404).json({ message: "Tuning configuration not found" });
      }

      res.json(updatedConfig);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update tuning configuration" });
    }
  });

  // Delete a tuning configuration
  apiRouter.delete("/tuning-configs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const deleted = await storage.deleteTuningConfig(id);
      if (!deleted) {
        return res.status(404).json({ message: "Tuning configuration not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tuning configuration" });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
