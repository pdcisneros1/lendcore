import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmins() {
  console.log('🔧 Creando usuarios administradores...\n')

  try {
    // Admin 1: auracaceres@gmail.com
    const admin1Password = await bcrypt.hash('Admin2026!Temp', 10)
    const admin1 = await prisma.user.upsert({
      where: { email: 'auracaceres@gmail.com' },
      update: {
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      create: {
        email: 'auracaceres@gmail.com',
        passwordHash: admin1Password,
        name: 'Aura Cáceres',
        firstName: 'Aura',
        lastName: 'Cáceres',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })

    console.log('✓ Usuario administrador creado:')
    console.log(`   Email: ${admin1.email}`)
    console.log(`   Nombre: ${admin1.name}`)
    console.log(`   Rol: ${admin1.role}`)
    console.log(`   Contraseña temporal: Admin2026!Temp`)
    console.log('')

    // Admin 2: jpalvareztorres11@gmail.com
    const admin2Password = await bcrypt.hash('Admin2026!Temp', 10)
    const admin2 = await prisma.user.upsert({
      where: { email: 'jpalvareztorres11@gmail.com' },
      update: {
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      create: {
        email: 'jpalvareztorres11@gmail.com',
        passwordHash: admin2Password,
        name: 'Juan Pablo Álvarez Torres',
        firstName: 'Juan Pablo',
        lastName: 'Álvarez Torres',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })

    console.log('✓ Usuario administrador creado:')
    console.log(`   Email: ${admin2.email}`)
    console.log(`   Nombre: ${admin2.name}`)
    console.log(`   Rol: ${admin2.role}`)
    console.log(`   Contraseña temporal: Admin2026!Temp`)
    console.log('')

    console.log('🎉 Ambos usuarios administradores han sido creados exitosamente!')
    console.log('')
    console.log('⚠️  IMPORTANTE:')
    console.log('   - Contraseña temporal: Admin2026!Temp')
    console.log('   - Los usuarios deben cambiar su contraseña al primer login')
    console.log('   - Acceso: https://lendcore.vercel.app/login')
    console.log('')
  } catch (error) {
    console.error('❌ Error al crear administradores:', error)
    throw error
  }
}

createAdmins()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
