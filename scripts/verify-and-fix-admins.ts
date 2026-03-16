import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function verifyAndFixAdmins() {
  console.log('🔍 Verificando y corrigiendo usuarios administradores...\n')

  try {
    // Verificar ambos usuarios
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['auracaceres@gmail.com', 'jpalvareztorres11@gmail.com']
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        passwordHash: true,
      }
    })

    console.log(`📊 Usuarios encontrados: ${users.length}\n`)

    for (const user of users) {
      console.log('Usuario existente:')
      console.log(`  Email: ${user.email}`)
      console.log(`  Nombre: ${user.name}`)
      console.log(`  Rol: ${user.role}`)
      console.log(`  Estado: ${user.status}`)
      console.log(`  Password Hash existe: ${user.passwordHash ? 'Sí' : 'No'}`)
      console.log('')
    }

    // Nueva contraseña temporal más simple
    const newPassword = 'JeanPaul2026!'
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    console.log('🔧 Actualizando contraseñas...\n')

    // Actualizar Admin 1
    await prisma.user.upsert({
      where: { email: 'auracaceres@gmail.com' },
      update: {
        passwordHash: newPasswordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      create: {
        email: 'auracaceres@gmail.com',
        passwordHash: newPasswordHash,
        name: 'Aura Cáceres',
        firstName: 'Aura',
        lastName: 'Cáceres',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })

    console.log('✓ auracaceres@gmail.com - Actualizado')

    // Actualizar Admin 2
    await prisma.user.upsert({
      where: { email: 'jpalvareztorres11@gmail.com' },
      update: {
        passwordHash: newPasswordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      create: {
        email: 'jpalvareztorres11@gmail.com',
        passwordHash: newPasswordHash,
        name: 'Juan Pablo Álvarez Torres',
        firstName: 'Juan Pablo',
        lastName: 'Álvarez Torres',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })

    console.log('✓ jpalvareztorres11@gmail.com - Actualizado')
    console.log('')

    // Verificar que el hash funciona
    const testMatch = await bcrypt.compare('JeanPaul2026!', newPasswordHash)
    console.log(`🧪 Test de contraseña: ${testMatch ? '✓ Correcto' : '✗ Error'}`)
    console.log('')

    // Verificar usuarios finales
    const finalUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['auracaceres@gmail.com', 'jpalvareztorres11@gmail.com']
        }
      },
      select: {
        email: true,
        name: true,
        role: true,
        status: true,
      }
    })

    console.log('📋 Usuarios finales:')
    for (const user of finalUsers) {
      console.log(`  ✓ ${user.email} - ${user.role} - ${user.status}`)
    }
    console.log('')

    console.log('🎉 Usuarios actualizados exitosamente!')
    console.log('')
    console.log('📝 CREDENCIALES DE ACCESO:')
    console.log('   URL: https://lendcore.vercel.app/login')
    console.log('')
    console.log('   Email: auracaceres@gmail.com')
    console.log('   Contraseña: JeanPaul2026!')
    console.log('')
    console.log('   Email: jpalvareztorres11@gmail.com')
    console.log('   Contraseña: JeanPaul2026!')
    console.log('')
    console.log('⚠️  IMPORTANTE: Cambiar contraseña después del primer login')
    console.log('')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

verifyAndFixAdmins()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
