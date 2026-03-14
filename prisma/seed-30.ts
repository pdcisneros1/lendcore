/**
 * SEED DE PRUEBA - 30 CLIENTES
 * Prueba inicial con datos moderados
 */

import { PrismaClient, ClientType, LoanStatus, InterestType, PaymentFrequency, AmortizationType, PaymentMethod, ClientStatus, ApplicationStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { encrypt } from '../src/lib/security/encryption'

const prisma = new PrismaClient()

// Datos realistas españoles
const firstNames = ['Carlos', 'María', 'José', 'Ana', 'Juan', 'Laura', 'Pedro', 'Carmen', 'Miguel', 'Isabel']
const lastNames = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez']
const cities = ['Bilbao', 'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza']
const streets = ['Calle Mayor', 'Gran Vía', 'Paseo Constitución', 'Avenida Libertad']

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomElement<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}

function randomFloat(min: number, max: number, decimals: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

function generateDNI() {
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
  const number = randomInt(10000000, 99999999)
  return `${number}${letters[number % 23]}`
}

function generateCIF() {
  return `B${randomInt(10000000, 99999999)}`
}

function generatePhone() {
  return `6${randomInt(10000000, 99999999)}`
}

function generateEmail(base: string) {
  return `${base.toLowerCase().replace(/\s/g, '')}@ejemplo.es`
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addMonths(date: Date, months: number) {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

async function main() {
  console.log('🚀 SEED 30 CLIENTES - Iniciando...\n')

  // 1. Usuarios del sistema
  console.log('👤 Creando usuarios...')
  const hashedPassword = await bcrypt.hash('Admin123!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lendcore.com' },
    update: {},
    create: {
      email: 'admin@lendcore.com',
      name: 'Admin Sistema',
      firstName: 'Admin',
      lastName: 'Sistema',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  })

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@lendcore.com' },
    update: {},
    create: {
      email: 'analyst@lendcore.com',
      name: 'Analista Crediticio',
      firstName: 'Analista',
      lastName: 'Crediticio',
      passwordHash: hashedPassword,
      role: 'ANALYST',
    },
  })

  console.log('✅ Usuarios creados\n')

  // 2. Cobradores
  console.log('👮 Creando cobradores...')
  const collectors = []
  for (const name of ['Carlos Méndez', 'Laura Torres']) {
    const collector = await prisma.collector.create({
      data: {
        name,
        email: generateEmail(name),
        phone: generatePhone(),
        isActive: true,
      },
    })
    collectors.push(collector)
  }
  console.log('✅ 2 cobradores creados\n')

  // 3. Clientes (30)
  console.log('👥 Generando 30 clientes...')
  const clients = []
  const today = new Date()

  for (let i = 0; i < 30; i++) {
    const isIndividual = Math.random() > 0.3
    const type: ClientType = isIndividual ? 'INDIVIDUAL' : 'BUSINESS'

    let clientData: any = {
      type,
      status: 'ACTIVE' as ClientStatus,
      email: encrypt(generateEmail(`cliente${i}`)),
      phone: encrypt(generatePhone()),
      address: encrypt(`${randomElement(streets)} ${randomInt(1, 200)}`),
      city: randomElement(cities),
      postalCode: `480${randomInt(10, 99)}`,
      creditLimit: randomInt(5000, 50000),
    }

    const client = await prisma.client.create({ data: clientData })

    if (isIndividual) {
      const firstName = randomElement(firstNames)
      const lastName = randomElement(lastNames)
      await prisma.individualProfile.create({
        data: {
          clientId: client.id,
          firstName,
          lastName,
          taxId: encrypt(generateDNI()),
          dateOfBirth: new Date(1980 + randomInt(0, 30), randomInt(0, 11), randomInt(1, 28)),
          occupation: randomElement(['Empleado', 'Autónomo', 'Empresario']),
          income: randomInt(15000, 45000),
        },
      })
    } else {
      await prisma.businessProfile.create({
        data: {
          clientId: client.id,
          businessName: `Empresa ${i + 1} SL`,
          taxId: encrypt(generateCIF()),
          legalRepName: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
          legalRepTaxId: encrypt(generateDNI()),
          industry: randomElement(['Comercio', 'Servicios', 'Construcción']),
          annualRevenue: randomInt(50000, 500000),
        },
      })
    }

    clients.push(client)
  }

  console.log('✅ 30 clientes creados\n')

  // 4. Solicitudes (10)
  console.log('📋 Creando 10 solicitudes...')
  const applications = []
  for (let i = 0; i < 10; i++) {
    const application = await prisma.creditApplication.create({
      data: {
        clientId: randomElement(clients).id,
        requestedAmount: randomInt(1000, 20000),
        termMonths: randomElement([6, 12, 18, 24]),
        proposedRate: randomInt(1, 8) / 100,
        purpose: randomElement(['Personal', 'Negocio', 'Vehículo']),
        status: randomElement<ApplicationStatus>(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']),
        createdAt: addDays(today, -randomInt(1, 90)),
      },
    })
    applications.push(application)
  }
  console.log('✅ 10 solicitudes creadas\n')

  // 5. Préstamos AMERICANOS (50)
  console.log('💰 Creando 50 préstamos AMERICANOS...')
  const loanScenarios = [
    { status: 'ACTIVE' as LoanStatus, count: 25 },
    { status: 'PAID' as LoanStatus, count: 15 },
    { status: 'ACTIVE' as LoanStatus, count: 10 }, // Con mora
  ]

  let loanCount = 0
  for (const scenario of loanScenarios) {
    for (let i = 0; i < scenario.count; i++) {
      const client = randomElement(clients)
      const principalAmount = randomInt(2000, 15000)
      const interestRate = randomFloat(0.01, 0.04, 4)
      const termMonths = randomElement([6, 12, 18])
      const disbursementDate = addDays(today, -randomInt(30, 180))
      const firstDueDate = addMonths(disbursementDate, 1)
      const finalDueDate = addMonths(disbursementDate, termMonths)
      const monthlyInterest = principalAmount * interestRate
      const totalInterest = monthlyInterest * termMonths

      const loan = await prisma.loan.create({
        data: {
          loanNumber: `PRE-${randomInt(100000, 999999)}`,
          clientId: client.id,
          principalAmount,
          amortizationType: 'AMERICAN' as AmortizationType,
          interestType: 'PERCENTAGE_MONTHLY' as InterestType,
          interestRate,
          termMonths,
          paymentFrequency: 'MONTHLY' as PaymentFrequency,
          disbursementDate,
          firstDueDate,
          finalDueDate,
          status: scenario.status,
          totalInterest,
          outstandingPrincipal: scenario.status === 'PAID' ? 0 : principalAmount,
          totalPaid: scenario.status === 'PAID' ? principalAmount + totalInterest : 0,
          createdBy: analyst.id,
          collectorId: randomElement(collectors).id,
          createdAt: disbursementDate,
        },
      })

      // Crear cuotas
      for (let month = 0; month < termMonths; month++) {
        const isLastInstallment = month === termMonths - 1
        const installmentDueDate = addMonths(firstDueDate, month)
        const principalForInstallment = isLastInstallment ? principalAmount : 0
        const interestForInstallment = monthlyInterest
        const totalForInstallment = principalForInstallment + interestForInstallment

        const isPaid = scenario.status === 'PAID' || Math.random() > 0.5

        await prisma.installment.create({
          data: {
            loanId: loan.id,
            installmentNumber: month + 1,
            dueDate: installmentDueDate,
            principalAmount: principalForInstallment,
            interestAmount: interestForInstallment,
            totalAmount: totalForInstallment,
            paidPrincipal: isPaid ? principalForInstallment : 0,
            paidInterest: isPaid ? interestForInstallment : 0,
            paidAmount: isPaid ? totalForInstallment : 0,
            pendingAmount: isPaid ? 0 : totalForInstallment,
            status: isPaid ? 'PAID' : 'PENDING',
            paidAt: isPaid ? addDays(installmentDueDate, randomInt(0, 5)) : null,
          },
        })
      }

      loanCount++
    }
  }

  console.log(`✅ ${loanCount} préstamos AMERICANOS creados\n`)

  console.log('✅ SEED COMPLETADO - 30 CLIENTES')
  console.log(`📊 Total: 30 clientes, ${loanCount} préstamos, 10 solicitudes`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
