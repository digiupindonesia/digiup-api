import request from 'supertest';
import { app } from '../../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('CreatorUp Analytics Tests', () => {
    let adminToken: string;
    
    beforeAll(async () => {
        // Generate admin token (you might need to implement this based on your auth system)
        adminToken = 'admin-jwt-token';
    });
    
    afterAll(async () => {
        await prisma.$disconnect();
    });
    
    describe('GET /api/v1/admin/analytics/sync', () => {
        test('should get sync analytics', async () => {
            const response = await request(app)
                .get('/api/v1/admin/analytics/sync')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            
            expect(response.body.status).toBe('success');
            expect(response.body.data.user_sync).toBeDefined();
            expect(response.body.data.sync_events).toBeDefined();
            expect(response.body.data.webhooks).toBeDefined();
            expect(response.body.data.usage).toBeDefined();
            expect(response.body.data.queue).toBeDefined();
        });
        
        test('should get sync analytics with custom period', async () => {
            const response = await request(app)
                .get('/api/v1/admin/analytics/sync?period=7d')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            
            expect(response.body.status).toBe('success');
            expect(response.body.data.period).toBeDefined();
        });
        
        test('should get sync analytics with date range', async () => {
            const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const endDate = new Date().toISOString();
            
            const response = await request(app)
                .get(`/api/v1/admin/analytics/sync?startDate=${startDate}&endDate=${endDate}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            
            expect(response.body.status).toBe('success');
            expect(response.body.data.period.start).toBeDefined();
            expect(response.body.data.period.end).toBeDefined();
        });
    });
    
    describe('GET /api/v1/admin/analytics/sync/user/:userId', () => {
        test('should get user-specific sync analytics', async () => {
            // Create a test user first
            const testUser = await prisma.user.create({
                data: {
                    email: 'analytics-test@example.com',
                    name: 'Analytics Test User',
                    phone: '+6281234567890',
                    password: 'hashedpassword',
                    tokenOfRegisterConfirmation: 'test-token',
                    tokenOfResetPassword: 'test-reset-token',
                    isRegistered: true
                }
            });
            
            const response = await request(app)
                .get(`/api/v1/admin/analytics/sync/user/${testUser.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            
            expect(response.body.status).toBe('success');
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.sync_events).toBeDefined();
            expect(response.body.data.usage_statistics).toBeDefined();
            expect(response.body.data.webhook_logs).toBeDefined();
            
            // Clean up
            await prisma.user.delete({
                where: { id: testUser.id }
            });
        });
        
        test('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .get('/api/v1/admin/analytics/sync/user/non-existent-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
            
            expect(response.body.status).toBe('error');
        });
    });
    
    describe('GET /api/v1/admin/analytics/health', () => {
        test('should get system health status', async () => {
            const response = await request(app)
                .get('/api/v1/admin/analytics/health')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            
            expect(response.body.status).toBe('success');
            expect(response.body.data.database).toBeDefined();
            expect(response.body.data.redis).toBeDefined();
            expect(response.body.data.creatorup_api).toBeDefined();
            expect(response.body.data.overall_status).toBeDefined();
        });
    });
    
    describe('POST /api/v1/admin/analytics/retry-failed-sync', () => {
        test('should retry failed sync events', async () => {
            const response = await request(app)
                .post('/api/v1/admin/analytics/retry-failed-sync')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            
            expect(response.body.status).toBe('success');
            expect(response.body.data.retried_events).toBeDefined();
            expect(response.body.data.results).toBeDefined();
        });
    });
    
    describe('POST /api/v1/admin/analytics/cleanup-old-data', () => {
        test('should cleanup old data', async () => {
            const response = await request(app)
                .post('/api/v1/admin/analytics/cleanup-old-data')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            
            expect(response.body.status).toBe('success');
            expect(response.body.data.deleted_sync_events).toBeDefined();
            expect(response.body.data.deleted_webhooks).toBeDefined();
            expect(response.body.data.cleanup_timestamp).toBeDefined();
        });
    });
});
