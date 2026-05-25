const { PrismaClient } = require('@prisma/client');
const { signToken } = require('./src/utils/jwt');

async function go() {
    const c = new PrismaClient();
    try {
        const admin = await c.user.findFirst({ where: { role: 'ADMIN' } });
        if (!admin) {
            console.log('No admin found');
            return;
        }
        const t = signToken({ userId: admin.id, role: 'ADMIN', email: admin.email });
        const res = await fetch('http://localhost:3001/api/admin/dashboard', { headers: { Authorization: 'Bearer ' + t } });
        const j = await res.json();
        console.log(JSON.stringify(j, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await c.$disconnect();
    }
}
go();
