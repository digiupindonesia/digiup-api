import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import httpMsg from '@utils/http_messages/http_msg';
import logger from '@utils/logger/winston/logger';

const prisma = new PrismaClient();

/**
 * Get all users with CreatorUp credentials
 */
const getAllCreatorUpUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const users = await prisma.user.findMany({
            where: {
                creatorup_metadata: {
                    not: null,
                } as any,
                sync_status: {
                    in: ['registered', 'synced'],
                },
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                creatorup_metadata: true,
                sync_status: true,
                creatorup_synced_at: true,
                last_creatorup_access: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                creatorup_synced_at: 'desc',
            },
        });

        // Format response with CreatorUp credentials
        const formattedUsers = users.map((user) => {
            const metadata = user.creatorup_metadata as any;
            return {
                digiup_user_id: user.id,
                digiup_email: user.email,
                digiup_name: user.name,
                digiup_phone: user.phone,
                creatorup_email: metadata?.email || null,
                creatorup_password: metadata?.password || null, // ⚠️ Security risk in production
                creatorup_registered_at: metadata?.registered_at || null,
                sync_status: user.sync_status,
                creatorup_synced_at: user.creatorup_synced_at,
                last_creatorup_access: user.last_creatorup_access,
                created_at: user.createdAt,
                updated_at: user.updatedAt,
            };
        });

        res.status(200).json({
            success: true,
            message: 'CreatorUp users retrieved successfully',
            data: {
                total_users: formattedUsers.length,
                users: formattedUsers,
            },
        });
    } catch (error: any) {
        logger.error(`Get CreatorUp users error: ${error.message}`);
        next(error);
    }
};

/**
 * Get specific user CreatorUp credentials by DigiUp user ID
 */
const getCreatorUpUserById = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { userId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                creatorup_metadata: true,
                sync_status: true,
                creatorup_synced_at: true,
                last_creatorup_access: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            const result = httpMsg.http404('User not found');
            res.status(result.httpStatusCode).json(result.data);
            return;
        }

        if (!user.creatorup_metadata) {
            const result = httpMsg.http404('User not registered to CreatorUp');
            res.status(result.httpStatusCode).json(result.data);
            return;
        }

        const metadata = user.creatorup_metadata as any;
        const formattedUser = {
            digiup_user_id: user.id,
            digiup_email: user.email,
            digiup_name: user.name,
            digiup_phone: user.phone,
            creatorup_email: metadata?.email || null,
            creatorup_password: metadata?.password || null, // ⚠️ Security risk in production
            creatorup_registered_at: metadata?.registered_at || null,
            sync_status: user.sync_status,
            creatorup_synced_at: user.creatorup_synced_at,
            last_creatorup_access: user.last_creatorup_access,
            created_at: user.createdAt,
            updated_at: user.updatedAt,
        };

        res.status(200).json({
            success: true,
            message: 'CreatorUp user retrieved successfully',
            data: formattedUser,
        });
    } catch (error: any) {
        logger.error(`Get CreatorUp user by ID error: ${error.message}`);
        next(error);
    }
};

/**
 * Get CreatorUp credentials summary
 */
const getCreatorUpSummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const totalUsers = await prisma.user.count();
        const creatorUpUsers = await prisma.user.count({
            where: {
                creatorup_metadata: {
                    not: null,
                } as any,
            },
        });
        const syncedUsers = await prisma.user.count({
            where: {
                sync_status: 'synced',
            },
        });
        const registeredUsers = await prisma.user.count({
            where: {
                sync_status: 'registered',
            },
        });

        res.status(200).json({
            success: true,
            message: 'CreatorUp summary retrieved successfully',
            data: {
                total_digiup_users: totalUsers,
                creatorup_registered_users: creatorUpUsers,
                creatorup_synced_users: syncedUsers,
                creatorup_pending_users: registeredUsers,
                registration_percentage:
                    totalUsers > 0 ? ((creatorUpUsers / totalUsers) * 100).toFixed(2) : 0,
            },
        });
    } catch (error: any) {
        logger.error(`Get CreatorUp summary error: ${error.message}`);
        next(error);
    }
};

export default {
    getAllCreatorUpUsers,
    getCreatorUpUserById,
    getCreatorUpSummary,
};
