import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const pendingTeachers = await prisma.user.findMany({
            where: { role: 'TEACHER', isActive: false },
            include: { teacher: { include: { school: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        console.log('Pending teachers query result:\n', JSON.stringify(pendingTeachers, null, 2));
    } catch (error) {
        console.error('Query error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
