import { Router, Request, Response } from 'express';
import { User } from '../models';
import { handleError } from '../utils';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const router = Router();


export default router;
