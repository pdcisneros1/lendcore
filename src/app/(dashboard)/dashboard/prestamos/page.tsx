import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { LoansExplorer } from '@/components/loans/LoansExplorer'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/constants/permissions'
import { LoanService } from '@/services/loanService'
import { decryptSafe } from '@/lib/security/encryption'
import { Skeleton } from '@/components/ui/skeleton'

// Configuración de caché de Next.js - revalidar cada 30 segundos
export const revalidate = 30

// Componente de loading skeleton
function LoansLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

// Componente asíncrono para cargar préstamos
async function LoansContent() {
  const session = await auth()

  // Cargar solo los primeros 20 préstamos para velocidad inicial
  const loansResult = await LoanService.getAll({ pageSize: 20 })

  const canCreateLoan =
    session?.user?.role ? hasPermission(session.user.role, 'LOANS_CREATE') : false
  const canRegisterPayment =
    session?.user?.role ? hasPermission(session.user.role, 'PAYMENTS_REGISTER') : false

  const serializedLoans = loansResult.data.map(loan => ({
    id: loan.id,
    loanNumber: loan.loanNumber,
    status: loan.status,
    clientName:
      loan.client.type === 'INDIVIDUAL'
        ? `${loan.client.individualProfile?.firstName || ''} ${loan.client.individualProfile?.lastName || ''}`.trim()
        : loan.client.businessProfile?.businessName || 'Cliente',
    clientTaxId:
      loan.client.type === 'INDIVIDUAL'
        ? decryptSafe(loan.client.individualProfile?.taxId)
        : decryptSafe(loan.client.businessProfile?.taxId),
    principalAmount: Number(loan.principalAmount),
    totalPending: Number(loan.totalPending || 0),
    totalInterest: Number(loan.totalInterest || 0),
    interestRate: Number(loan.interestRate),
    interestType: loan.interestType,
    termMonths: loan.termMonths,
    disbursementDate: loan.disbursementDate.toISOString(),
  }))

  return (
    <LoansExplorer
      loans={serializedLoans}
      canCreateLoan={canCreateLoan}
      canRegisterPayment={canRegisterPayment}
    />
  )
}

export default async function PrestamosPage() {
  const session = await auth()
  const canCreateLoan =
    session?.user?.role ? hasPermission(session.user.role, 'LOANS_CREATE') : false

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Préstamos</h1>
          <p className="text-muted-foreground">Gestión de préstamos activos e históricos</p>
        </div>
        {canCreateLoan && (
          <Link href="/dashboard/prestamos/nuevo" className="w-full lg:w-auto">
            <Button className="w-full rounded-xl lg:w-auto">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Nuevo Préstamo
            </Button>
          </Link>
        )}
      </div>

      {/* Usar Suspense para streaming - carga el header primero, luego los datos */}
      <Suspense fallback={<LoansLoadingSkeleton />}>
        <LoansContent />
      </Suspense>
    </div>
  )
}
