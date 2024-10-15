import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { json, urlencoded } from 'body-parser';
import rateLimit from 'express-rate-limit';
import { noteRoutes, authRoutes, versionHistoryRoutes } from './routes';
// Fix @utils not working TODO
import { verifyToken } from './utils/auth.util';

const app: Application = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

const unprotectedRoutes = ['/auth/register', '/auth/login'];

app.use((req, res, next) => {
  if (unprotectedRoutes.some(route => req.originalUrl.startsWith(route))) {
    return next(); // Skip authentication for unprotected routes
  }
  verifyToken(req, res, next);
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again after 15 minutes.',
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});

app.use('/auth', authLimiter, authRoutes);
app.use('/notes', generalLimiter, noteRoutes);
app.use('/versions', generalLimiter, versionHistoryRoutes);


export default app;
