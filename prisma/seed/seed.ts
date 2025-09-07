import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import randtoken from 'rand-token';
import bcrypt from 'bcryptjs';
import { seedApps } from './apps_seed';
import { default as seedAppPricing } from './app_pricing_seed';

import config from '../../src/config/app';

const prisma = new PrismaClient();
const saltRounds = config.bcrypt.saltRounds;

const userQty = 9;
const users: any = [];

const states = [
    'AC',
    'AL',
    'AM',
    'AP',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MG',
    'MS',
    'MT',
    'PA',
    'PB',
    'PE',
    'PI',
    'PR',
    'RJ',
    'RN',
    'RO',
    'RR',
    'RS',
    'SC',
    'SE',
    'SP',
    'TO',
];

function randomBirthDate(): Date {
    return new Date(
        new Date().getTime() - Math.random() * 10000 * 24 * 60 * 60 * 1000,
    );
}

for (let i = 0; i < userQty; i++) {
    const randTokenGen = randtoken.generate(26).toString();
    const hashedPassword = bcrypt.hashSync(randTokenGen, saltRounds);

    users.push({
        id: uuidv4(),
        email: `user${i}@api.com.br`,
        name: `User ${i}`,
        phone: `1199999999${i}`,
        password: hashedPassword,
        tokenOfRegisterConfirmation: randTokenGen,
        tokenOfResetPassword: randTokenGen,
        accountLocationState: states[Math.floor(Math.random() * states.length)],
        isRegistered: true,
        isDisabled: false,
        isDeleted: false,
        createdAt: randomBirthDate(),
        updatedAt: randomBirthDate(),
    });
}

async function main() {
    console.log('🌱 Start seeding...');
    
    // Seed users
    console.log('👥 Seeding users...');
    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
    }
    console.log('✅ Users seeded');

    // Seed apps
    await seedApps();
    await seedAppPricing();

    console.log('🎉 Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (err) => {
        /* eslint-disable no-console */
        console.error(err);
        /* eslint-enable no-console */
        await prisma.$disconnect();
        process.exit(1);
    });
