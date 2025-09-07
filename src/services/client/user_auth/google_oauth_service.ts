import { google } from 'googleapis';
import prisma from '../../../../prisma/prisma-client';
import generateTokenAccess from '../../../functions/generate_token_access';
import config from '../../../config/app';
import { User } from '@prisma/client';

export interface IGoogleUserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
}

export interface IGoogleAuthResult {
    success: boolean;
    user?: User;
    token?: string;
    message?: string;
    isNewUser?: boolean;
}

export class GoogleOAuthService {
    private oauth2Client;

    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            config.googleOauth.clientId,
            config.googleOauth.clientSecret,
            config.googleOauth.redirectUri,
        );
    }

    /**
     * Generate Google OAuth consent URL
     */
    getAuthUrl(): string {
        const scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent',
        });
    }

    /**
     * Exchange authorization code for access token and get user info
     */
    async authenticateWithCode(code: string): Promise<IGoogleAuthResult> {
        try {
            // Exchange authorization code for access token
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);

            // Get user info from Google
            const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
            const { data } = await oauth2.userinfo.get();

            if (!data.email) {
                return {
                    success: false,
                    message: 'Unable to retrieve email from Google account',
                };
            }

            // Check if user already exists
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: data.email },
                        {
                            AND: [{ google_signin: true }, { email: data.email }],
                        },
                    ],
                },
            });

            let user: User;
            let isNewUser = false;

            if (existingUser) {
                // Update existing user with Google info if not already set
                user = await prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        google_signin: true,
                        google_given_name: data.given_name || existingUser.google_given_name,
                        google_family_name: data.family_name || existingUser.google_family_name,
                        google_avatar: data.picture || existingUser.google_avatar,
                        google_locale: data.locale || existingUser.google_locale,
                        isRegistered: true, // Google emails are verified
                    },
                });
            } else {
                // Create new user
                user = await prisma.user.create({
                    data: {
                        email: data.email,
                        name: data.name || `${data.given_name} ${data.family_name}`.trim(),
                        phone: '', // Required field, but empty for Google OAuth users
                        password: '', // No password for Google OAuth users
                        google_signin: true,
                        google_given_name: data.given_name,
                        google_family_name: data.family_name,
                        google_avatar: data.picture,
                        google_locale: data.locale,
                        isRegistered: true,
                        tokenOfRegisterConfirmation: '', // Required field
                        tokenOfResetPassword: '', // Required field
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                });
                isNewUser = true;
            }

            // Generate JWT token
            const tokenResult = await generateTokenAccess({
                user_id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
            });

            return {
                success: true,
                user,
                token: tokenResult.data,
                isNewUser,
                message: isNewUser
                    ? 'Account created successfully with Google'
                    : 'Signed in successfully with Google',
            };
        } catch (error) {
            console.error('Google OAuth error:', error);
            return {
                success: false,
                message: 'Failed to authenticate with Google',
            };
        }
    }

    /**
     * Sign in or sign up with Google using access token directly
     */
    async authenticateWithAccessToken(accessToken: string): Promise<IGoogleAuthResult> {
        try {
            // Set the access token
            this.oauth2Client.setCredentials({ access_token: accessToken });

            // Get user info from Google
            const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
            const { data } = await oauth2.userinfo.get();

            if (!data.email) {
                return {
                    success: false,
                    message: 'Unable to retrieve email from Google account',
                };
            }

            // Check if user already exists
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: data.email },
                        {
                            AND: [{ google_signin: true }, { email: data.email }],
                        },
                    ],
                },
            });

            let user: User;
            let isNewUser = false;

            if (existingUser) {
                // Update existing user with Google info if not already set
                user = await prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        google_signin: true,
                        google_given_name: data.given_name || existingUser.google_given_name,
                        google_family_name: data.family_name || existingUser.google_family_name,
                        google_avatar: data.picture || existingUser.google_avatar,
                        google_locale: data.locale || existingUser.google_locale,
                        isRegistered: true,
                    },
                });
            } else {
                // Create new user
                user = await prisma.user.create({
                    data: {
                        email: data.email,
                        name: data.name || `${data.given_name} ${data.family_name}`.trim(),
                        phone: '', // Required field, but empty for Google OAuth users
                        password: '', // No password for Google OAuth users
                        google_signin: true,
                        google_given_name: data.given_name,
                        google_family_name: data.family_name,
                        google_avatar: data.picture,
                        google_locale: data.locale,
                        isRegistered: true,
                        tokenOfRegisterConfirmation: '', // Required field
                        tokenOfResetPassword: '', // Required field
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                });
                isNewUser = true;
            }

            // Generate JWT token
            const tokenResult = await generateTokenAccess({
                user_id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
            });

            return {
                success: true,
                user,
                token: tokenResult.data,
                isNewUser,
                message: isNewUser
                    ? 'Account created successfully with Google'
                    : 'Signed in successfully with Google',
            };
        } catch (error) {
            console.error('Google OAuth error:', error);
            return {
                success: false,
                message: 'Failed to authenticate with Google',
            };
        }
    }
}

export default GoogleOAuthService;
