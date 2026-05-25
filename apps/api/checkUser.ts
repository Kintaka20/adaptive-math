import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'wahyoto86@dinas.belajar.id' },
            include: { teacher: true }
        });
        console.log('User found:', JSON.stringify(user, null, 2));
    } catch (error) {
        console.error('Error finding user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
