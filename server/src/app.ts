import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { json, urlencoded } from 'body-parser';
// TODO convert to use barrel exports
import userRoutes from './routes/user.routes';
import noteRoutes from './routes/note.routes';
import authRoutes from './routes/auth.routes'; 
import versionHistoryRoutes from './routes/version-history.routes';
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

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/notes', noteRoutes);
app.use('/versions', versionHistoryRoutes);

export default app;
