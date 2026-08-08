import bcrypt from 'bcrypt';
import prisma from '../config/db';
import { ApiError } from '../utils/apiError';
import { Role } from '@prisma/client';

const safeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  avatarUrl: true,
  createdAt: true,
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: Role;
}) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw ApiError.conflict('A user with this email already exists');

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: { ...data, password: hashedPassword },
    select: safeSelect,
  });
};

export const getAllUsers = async (query: {
  role?: Role;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const page = query.page || 1;
  const limit = query.limit || 20;

  const where = {
    ...(query.role ? { role: query.role } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { email: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: safeSelect,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, totalPages: Math.ceil(total / limit) };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, select: safeSelect });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const updateUser = async (
  id: string,
  data: Partial<{ name: string; role: Role; isActive: boolean; avatarUrl: string }>
) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound('User not found');

  return prisma.user.update({ where: { id }, data, select: safeSelect });
};

export const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound('User not found');

  await prisma.user.delete({ where: { id } });
};
