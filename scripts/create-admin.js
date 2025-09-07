const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const randtoken = require('rand-token');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        console.log('🔐 Creating admin user...');
        
        // Generate random tokens
        const registerToken = randtoken.generate(16);
        const resetToken = randtoken.generate(16);
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);
        
        // Create admin user
        const adminUser = await prisma.user.upsert({
            where: { email: 'admin@digiup.com' },
            update: {
                role: 'admin',
                password: hashedPassword,
                isRegistered: true,
                isDisabled: false,
                isDeleted: false,
            },
            create: {
                id: uuidv4(),
                email: 'admin@digiup.com',
                name: 'Admin DigiUp',
                phone: '081234567890',
                password: hashedPassword,
                role: 'admin',
                accountType: 'free',
                isRegistered: true,
                isDisabled: false,
                isDeleted: false,
                tokenOfRegisterConfirmation: registerToken,
                tokenOfResetPassword: resetToken,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        
        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: admin@digiup.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Role: admin');
        console.log('🆔 User ID:', adminUser.id);
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
