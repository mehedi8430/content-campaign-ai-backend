import { prisma } from '@/config/db';
import { sendError, sendResponse } from '@/utils/apiResponse';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// const generateToken = (id: string): string => {
//   const secret = process.env.JWT_SECRET;
//   if (!secret) {
//     throw new Error('JWT_SECRET is not defined');
//   }

//   const envExpires = process.env.JWT_EXPIRE;
//   const expiresIn: SignOptions['expiresIn'] = envExpires
//     ? (envExpires as unknown as SignOptions['expiresIn'])
//     : ('1d' as const);

//   return jwt.sign({ id }, secret, { expiresIn });
// };

const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // user exists check
  const userExists = await prisma.user.findUnique({
    where: { email },
  });

  if (userExists) {
    sendError(res, 400, 'User already exists');
    return;
  }

  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // create user
  const user = await prisma.user.create({
    data: { email, passwordHash: hashedPassword },
  });

  sendResponse(
    res,
    201,
    true,
    'User registered successfully',
    {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      }
    });
}

export { register };

// export const register = catchAsync(async (req: Request, res: Response) => {
//   const { name, email, password } = req.body;

//   const userExists = await User.findOne({ email });
//   if (userExists) {
//     sendError(res, 400, 'User already exists');
//     return;
//   }

//   const user = await User.create({
//     name,
//     email,
//     password,
//   });

//   sendResponse(res, 201, true, 'User registered successfully', {
//     user: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     },
//   });
// });

// export const login = catchAsync(async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email }).select('+password');
//   if (!user || !(await user.comparePassword(password))) {
//     sendError(res, 401, 'Invalid credentials');
//     return;
//   }

//   const token = generateToken(user._id.toString());

//   sendResponse(res, 200, true, 'Login successful', {
//     user: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     },
//     token,
//   });
// });

// export const getProfile = catchAsync(async (req: Request, res: Response) => {
//   const user = await User.findById(req.user?.id);

//   if (!user) {
//     sendError(res, 404, 'User not found');
//     return;
//   }

//   sendResponse(res, 200, true, 'Profile retrieved successfully', {
//     user: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     },
//   });
// });