import request from 'supertest';
import { app } from '../../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('CreatorUp Integration Tests', () => {
    let testUser: any;
    let testToken: string;
    
    beforeAll(async () => {
        // Create test user
        testUser = await prisma.user.create({
            data: {
                email: 'test@creatorup.com',
                name: 'Test User',
                phone: '+6281234567890',
                password: 'hashedpassword',
                tokenOfRegisterConfirmation: 'test-token',
                tokenOfResetPassword: 'test-reset-token',
                isRegistered: true
            }
        });
        
        // Generate test token (you might need to implement this based on your auth system)
        testToken = 'test-jwt-token';
    });
    
    afterAll(async () => {
        // Clean up test data
        await prisma.user.delete({
            where: { id: testUser.id }
        });
        await prisma.$disconnect();
    });
    
    describe('POST /api/v1/creatorup/sync/user', () => {
        test('should sync user data to CreatorUp', async () => {
            const userData = {
                creatorup_api_url: 'https://api.creatorup.com'
            };
            
            const response = await request(app)
                .post('/api/v1/creatorup/sync/user')
                .set('Authorization', `Bearer ${testToken}`)
                .send(userData)
                .expect(200);
            
            expect(response.body.status).toBe('success');
            expect(response.body.data.synced_at).toBeDefined();
            expect(response.body.data.sync_event_id).toBeDefined();
        });
        
        test('should handle sync errors gracefully', async () => {
            const userData = {
                creatorup_api_url: 'https://invalid-url.com'
            };
            
            const response = await request(app)
                .post('/api/v1/creatorup/sync/user')
                .set('Authorization', `Bearer ${testToken}`)
                .send(userData)
                .expect(500);
            
            expect(response.body.status).toBe('error');
        });
    });
    
    describe('POST /api/v1/creatorup/sync/usage', () => {
        test('should sync usage data to DigiUp', async () => {
            const usageData = {
                usage_data: {
                    batch_name: 'test-batch-001',
                    batch_type: 'video',
                    usage_type: 'local_rendering',
                    usage_amount: 1,
                    month_year: '2024-01',
                    completed_at: new Date().toISOString(),
                    metadata: {
                        video_count: 5,
                        processing_time: '2 minutes'
                    }
                }
            };
            
            const response = await request(app)
                .post('/api/v1/creatorup/sync/usage')
                .set('Authorization', `Bearer ${testToken}`)
                .send(usageData)
                .expect(200);
            
            expect(response.body.status).toBe('success');
            expect(response.body.data.usage_id).toBeDefined();
            expect(response.body.data.synced_at).toBeDefined();
        });
        
        test('should validate usage data', async () => {
            const invalidUsageData = {
                usage_data: {
                    // Missing required fields
                }
            };
            
            const response = await request(app)
                .post('/api/v1/creatorup/sync/usage')
                .set('Authorization', `Bearer ${testToken}`)
                .send(invalidUsageData)
                .expect(400);
            
            expect(response.body.status).toBe('error');
        });
    });
    
    describe('GET /api/v1/creatorup/sync/status', () => {
        test('should get user sync status', async () => {
            const response = await request(app)
                .get('/api/v1/creatorup/sync/status')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);
            
            expect(response.body.status).toBe('success');
            expect(response.body.data.user_sync).toBeDefined();
            expect(response.body.data.recent_events).toBeDefined();
            expect(response.body.data.usage_statistics).toBeDefined();
        });
    });
    
    describe('POST /api/v1/creatorup/webhook/usage-update', () => {
        test('should handle usage webhook from CreatorUp', async () => {
            const webhookData = {
                digiup_user_id: testUser.id,
                usage_data: {
                    batch_name: 'webhook-test-batch',
                    batch_type: 'video',
                    usage_type: 'local_rendering',
                    usage_amount: 1,
                    month_year: '2024-01',
                    completed_at: new Date().toISOString(),
                    metadata: {
                        source: 'webhook'
                    }
                },
                signature: 'test-signature'
            };
            
            const response = await request(app)
                .post('/api/v1/creatorup/webhook/usage-update')
                .send(webhookData)
                .expect(200);
            
            expect(response.body.status).toBe('success');
            expect(response.body.data.usage_id).toBeDefined();
            expect(response.body.data.processed_at).toBeDefined();
        });
        
        test('should handle invalid user in webhook', async () => {
            const webhookData = {
                digiup_user_id: 'invalid-user-id',
                usage_data: {
                    batch_name: 'test-batch',
                    usage_type: 'local_rendering'
                },
                signature: 'test-signature'
            };
            
            const response = await request(app)
                .post('/api/v1/creatorup/webhook/usage-update')
                .send(webhookData)
                .expect(404);
            
            expect(response.body.status).toBe('error');
        });
    });
    
    describe('POST /api/v1/creatorup/webhook/subscription-update', () => {
        test('should handle subscription webhook from CreatorUp', async () => {
            const webhookData = {
                digiup_user_id: testUser.id,
                subscription_data: {
                    plan: 'Pro',
                    status: 'active',
                    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                },
                signature: 'test-signature'
            };
            
            const response = await request(app)
                .post('/api/v1/creatorup/webhook/subscription-update')
                .send(webhookData)
                .expect(200);
            
            expect(response.body.status).toBe('success');
            expect(response.body.data.updated_at).toBeDefined();
        });
    });
    
    describe('GET /api/v1/creatorup/verify', () => {
        test('should verify DigiUp token for CreatorUp access', async () => {
            const response = await request(app)
                .post('/api/v1/creatorup/verify')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);
            
            expect(response.body.status).toBe('success');
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.subscription).toBeDefined();
        });
    });
    
    describe('GET /api/v1/creatorup/profile', () => {
        test('should get user profile for CreatorUp sync', async () => {
            const response = await request(app)
                .get('/api/v1/creatorup/profile')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);
            
            expect(response.body.status).toBe('success');
            expect(response.body.data.digiup_user_id).toBe(testUser.id);
            expect(response.body.data.email).toBe(testUser.email);
        });
    });
    
    describe('GET /api/v1/creatorup/access', () => {
        test('should check user access to CreatorUp', async () => {
            const response = await request(app)
                .get('/api/v1/creatorup/access')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);
            
            expect(response.body.status).toBe('success');
            expect(response.body.data.hasAccess).toBeDefined();
            expect(response.body.data.subscription).toBeDefined();
        });
    });
});
