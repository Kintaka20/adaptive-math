import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const deletedUser = await prisma.user.delete({
            where: { email: 'wahyoto86@dinas.belajar.id' },
        });
        console.log('Successfully deleted user:', deletedUser.email);
    } catch (error) {
        console.error('Error deleting user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
