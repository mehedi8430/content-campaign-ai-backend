import {
  comparePassword,
  createUser,
  findUserByEmail,
  findUserById,
} from '@/repositories/userRepository';
import { sendError, sendResponse } from '@/utils/apiResponse';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';

const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const envExpires = process.env.JWT_EXPIRE;
  const expiresIn: SignOptions['expiresIn'] = envExpires
    ? (envExpires as unknown as SignOptions['expiresIn'])
    : ('1d' as const);

  return jwt.sign({ id }, secret, { expiresIn });
};

export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const userExists = await findUserByEmail(email);
  if (userExists) {
    sendError(res, 400, 'User already exists');
    return;
  }

  const user = await createUser({ name, email, password });

  sendResponse(res, 201, true, 'User registered successfully', {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email, true);
  if (
    !user ||
    !user.password ||
    !(await comparePassword(password, user.password))
  ) {
    sendError(res, 401, 'Invalid credentials');
    return;
  }

  const token = generateToken(user.id);

  sendResponse(res, 200, true, 'Login successful', {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await findUserById(req.user?.id as string);

  if (!user) {
    sendError(res, 404, 'User not found');
    return;
  }

  sendResponse(res, 200, true, 'Profile retrieved successfully', {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});
