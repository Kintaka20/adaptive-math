import { PrismaClient } from '@prisma/client';
import { signToken } from './src/utils/jwt';

async function go() {
    const c = new PrismaClient();
    try {
        const admin = await c.user.findFirst({ where: { role: 'ADMIN' } });
        const t = signToken({ userId: admin.id, role: 'ADMIN', email: admin.email });
        const res = await fetch('http://localhost:3001/api/admin/users', { headers: { Authorization: 'Bearer ' + t } });
        const j = await res.json();
        console.log('users endpoint returns keys:', Object.keys(j));
        if (j.data) console.log('j.data is array?', Array.isArray(j.data), 'keys of j.data if object:', Object.keys(j.data));
    } catch (e) {
        console.error(e);
    } finally {
        await c.$disconnect();
    }
}
go();
