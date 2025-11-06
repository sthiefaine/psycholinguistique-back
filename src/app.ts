import express, { type Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import healthRoutes from './routes/healthRoutes';

dotenv.config();

const app: Express = express();

// Middleware pour extraire l'IP réelle (même derrière un proxy)
app.set('trust proxy', true);

// Middleware globaux
app.use(cors()); // Permet les requêtes depuis votre frontend
app.use(express.json()); // Parse les requêtes JSON

// Route de santé à la racine
app.use('/health', healthRoutes);

// Routes API
app.use('/api', apiRoutes);

export default app;

