import { pool } from '@/config/database';
import { IUser } from '@/types';
import bcrypt from 'bcryptjs';

type UserRow = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
};

const mapRowToUser = (row: UserRow): IUser => ({
  id: row.id,
  name: row.name,
  email: row.email,
  password: row.password ?? '',
  role: row.role,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const findUserByEmail = async (
  email: string,
  includePassword = false
): Promise<IUser | null> => {
  const columns = includePassword
    ? 'id, name, email, password, role, created_at, updated_at'
    : 'id, name, email, role, created_at, updated_at';

  const result = await pool.query<UserRow>(
    `SELECT ${columns} FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  const row = result.rows[0];
  return row ? mapRowToUser(row) : null;
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  const result = await pool.query<UserRow>(
    'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );

  const row = result.rows[0];
  return row ? mapRowToUser(row) : null;
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<IUser> => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  const result = await pool.query<UserRow>(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role, created_at, updated_at`,
    [data.name, data.email.toLowerCase(), hashedPassword]
  );

  return mapRowToUser(result.rows[0]);
};

export const comparePassword = async (
  candidatePassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};
