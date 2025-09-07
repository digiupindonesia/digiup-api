import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedApps() {
    console.log('🌱 Seeding apps...');

    const apps = [
        {
            name: 'Creatorup',
            description: 'Auto Konten Generator untuk membuat konten kreatif dengan mudah menggunakan AI',
            logo: 'https://via.placeholder.com/64x64/8B5CF6/FFFFFF?text=C',
            category: 'Creation',
            status: 'active',
            appUrl: 'https://creatorup.app',
            features: [
                'AI Content Generation',
                'Template Library',
                'Multi-format Export',
                'Collaboration Tools'
            ],
            tags: ['AI', 'Content', 'Generator'],
            isEarlyAccess: true,
            sortOrder: 1
        },
        {
            name: 'Influp',
            description: 'Kol Management Sistem untuk mengelola influencer dan campaign dengan efektif',
            logo: 'https://via.placeholder.com/64x64/06B6D4/FFFFFF?text=I',
            category: 'Automation',
            status: 'active',
            appUrl: 'https://influp.app',
            features: [
                'Influencer Discovery',
                'Campaign Management',
                'Performance Analytics',
                'Payment Processing'
            ],
            tags: ['Influencer', 'Campaign', 'Management'],
            isEarlyAccess: false,
            sortOrder: 2
        },
        {
            name: 'DigiUp Analytics',
            description: 'Advanced analytics platform untuk memahami performa digital marketing Anda',
            logo: 'https://via.placeholder.com/64x64/10B981/FFFFFF?text=DA',
            category: 'Analytics',
            status: 'active',
            appUrl: null,
            features: [
                'Real-time Analytics',
                'Custom Dashboards',
                'Data Visualization',
                'Export Reports'
            ],
            tags: ['Analytics', 'Dashboard', 'Reports'],
            isEarlyAccess: false,
            sortOrder: 3
        },
        {
            name: 'Postup',
            description: 'Auto Post Multi Platform untuk menjadwalkan dan mengelola konten di berbagai platform sosial media',
            logo: 'https://via.placeholder.com/64x64/F59E0B/FFFFFF?text=P',
            category: 'Collaboration',
            status: 'active',
            appUrl: 'https://postup.app',
            features: [
                'Multi-platform Posting',
                'Content Scheduling',
                'Analytics Integration',
                'Performance Tracking'
            ],
            tags: ['Social Media', 'Automation', 'Scheduling'],
            isEarlyAccess: false,
            sortOrder: 4
        }
    ];

    for (const app of apps) {
        const existingApp = await prisma.digiupApp.findFirst({
            where: { name: app.name }
        });

        if (!existingApp) {
            await prisma.digiupApp.create({
                data: app
            });
            console.log(`✅ Created app: ${app.name}`);
        } else {
            console.log(`⚠️  App already exists: ${app.name}`);
        }
    }

    console.log('✅ Apps seeded successfully');
}
