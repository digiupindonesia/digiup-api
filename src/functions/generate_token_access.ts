import jwt from 'jsonwebtoken';
import config from '@config/app';

export default async (tokenData: object) => {
    const secret = config.jwt.secretUser;

    if (!secret || secret.trim() === '') {
        throw new Error(
            'JWT secret is not configured. Please set JWT_SECRET_USER environment variable.',
        );
    }

    const token = jwt.sign(tokenData, secret, {
        expiresIn: config.jwt.expiredIn,
    } as any);

    return { success: true, data: token, error: null };
};
