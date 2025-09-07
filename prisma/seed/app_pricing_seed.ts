import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export default async function seedAppPricing() {
    console.log('🌱 Seeding app pricing plans...');

    // Get all apps
    const apps = await prisma.digiupApp.findMany();
    
    if (apps.length === 0) {
        console.log('❌ No apps found. Please seed apps first.');
        return;
    }

    for (const app of apps) {
        // Create pricing plans for each app
        const pricingPlans = [
            {
                name: 'Free',
                price: 0,
                currency: 'IDR',
                billingCycle: 'monthly',
                isFree: true,
                features: {
                    'generations_per_month': 10,
                    'video_quality': 'medium',
                    'ai_subtitle': false,
                    'ai_voiceover': false,
                    'support_level': 'community'
                },
                limits: {
                    'max_video_duration': 60, // seconds
                    'max_batch_size': 5,
                    'storage_gb': 1
                },
                sortOrder: 1
            },
            {
                name: 'Basic',
                price: 50000, // 50,000 IDR
                currency: 'IDR',
                billingCycle: 'monthly',
                isFree: false,
                features: {
                    'generations_per_month': 100,
                    'video_quality': 'high',
                    'ai_subtitle': true,
                    'ai_voiceover': false,
                    'support_level': 'email'
                },
                limits: {
                    'max_video_duration': 300, // 5 minutes
                    'max_batch_size': 20,
                    'storage_gb': 10
                },
                sortOrder: 2
            },
            {
                name: 'Pro',
                price: 150000, // 150,000 IDR
                currency: 'IDR',
                billingCycle: 'monthly',
                isFree: false,
                features: {
                    'generations_per_month': 500,
                    'video_quality': 'ultra',
                    'ai_subtitle': true,
                    'ai_voiceover': true,
                    'support_level': 'priority'
                },
                limits: {
                    'max_video_duration': 600, // 10 minutes
                    'max_batch_size': 50,
                    'storage_gb': 50
                },
                sortOrder: 3
            },
            {
                name: 'Enterprise',
                price: 500000, // 500,000 IDR
                currency: 'IDR',
                billingCycle: 'monthly',
                isFree: false,
                features: {
                    'generations_per_month': -1, // unlimited
                    'video_quality': 'ultra',
                    'ai_subtitle': true,
                    'ai_voiceover': true,
                    'support_level': 'dedicated'
                },
                limits: {
                    'max_video_duration': 1800, // 30 minutes
                    'max_batch_size': 200,
                    'storage_gb': 500
                },
                sortOrder: 4
            }
        ];

        for (const plan of pricingPlans) {
            const planId = uuidv4();
            await prisma.appPricingPlan.upsert({
                where: {
                    id: planId
                },
                update: {
                    ...plan,
                    appId: app.id
                },
                create: {
                    id: planId,
                    appId: app.id,
                    ...plan
                }
            });
        }

        console.log(`✅ Created pricing plans for ${app.name}`);
    }

    console.log('🎉 App pricing plans seeded successfully!');
}
