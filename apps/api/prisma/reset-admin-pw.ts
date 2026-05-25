import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const admin = await prisma.user.findUnique({
        where: { email: 'admin@adaptivemath.id' },
        select: { id: true, email: true, role: true, isActive: true, isSuspended: true, password: true }
    })
    
    if (!admin) {
        console.log('❌ Admin user not found!')
        return
    }
    
    console.log('Admin user found:')
    console.log('  email:', admin.email)
    console.log('  role:', admin.role)
    console.log('  isActive:', admin.isActive)
    console.log('  isSuspended:', admin.isSuspended)
    console.log('  password hash (first 20):', admin.password.substring(0, 20))
    
    const testResult = await bcrypt.compare('admin123456', admin.password)
    console.log('  password "admin123456" match:', testResult)
    
    if (!admin.isActive) {
        await prisma.user.update({ 
            where: { email: 'admin@adaptivemath.id' }, 
            data: { isActive: true } 
        })
        console.log('  ✅ Set isActive = true')
    }
    
    if (!testResult) {
        const newHash = await bcrypt.hash('admin123456', 12)
        await prisma.user.update({ 
            where: { email: 'admin@adaptivemath.id' }, 
            data: { password: newHash } 
        })
        console.log('  ✅ Password reset to admin123456')
    }
    
    console.log('\n✅ Done! Try login with: admin@adaptivemath.id / admin123456')
}

main()
    .catch(console.error)
    .finally(() => prisma['$disconnect']())
