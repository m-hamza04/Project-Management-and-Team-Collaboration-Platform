import bcrypt from 'bcrypt';
import prisma from '../config/prisma';
import { signToken } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { Role } from '@prisma/client';

interface RegisterInput {
    name: string;
    email: string;
    password: string;
    role?: Role;
}

interface LoginInput {
    email: string;
    password: string;
}

export const registerUser = async (input: RegisterInput) => {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
        throw ApiError.conflict('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            password: hashedPassword,
            // Public self-registration always defaults to TEAM_MEMBER.
            // Admins are promoted manually / seeded; PMs are assigned by Admin.
            role: Role.TEAM_MEMBER,
        },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return { user, token };
};

export const loginUser = async (input: LoginInput) => {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user || !user.isActive) {
        throw ApiError.unauthorized('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
        throw ApiError.unauthorized('Invalid credentials');
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const { password, ...safeUser } = user;
    return { user: safeUser, token };
};

export const getProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
            isActive: true,
            createdAt: true,
        },
    });

    if (!user) throw ApiError.notFound('User not found');
    return user;
};
