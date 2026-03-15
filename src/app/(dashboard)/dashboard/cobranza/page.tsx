import { Suspense } from 'react'
import { CollectionWorkspace } from '@/components/collection/CollectionWorkspace'
import { CollectionDashboardService } from '@/services/collectionDashboardService'
import { decryptSafe } from '@/lib/security/encryption'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/constants/permissions'
import { Skeleton } from '@/components/ui/skeleton'

// Caché de 15 segundos para cobranza (datos más dinámicos que préstamos)
export const revalidate = 15

// Loading skeleton
function CollectionLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

// Componente asíncrono para datos de cobranza
async function CollectionContent() {
  const [session, metrics, prioritizedCases, promisesToday] = await Promise.all([
    auth(),
    CollectionDashboardService.getMetrics(),
    CollectionDashboardService.getPrioritizedCases(undefined, 50), // Aumentado para incluir todos los casos
    CollectionDashboardService.getPromisesDueToday(),
  ])

  const canCreateCollectionAction =
    session?.user?.role ? hasPermission(session.user.role, 'COLLECTION_CREATE') : false

  const serializedCases = prioritizedCases.map(caseItem => ({
    ...caseItem,
    lastContactDate: caseItem.lastContactDate?.toISOString(),
  }))

  const serializedPromises = promisesToday.map(promise => {
    const clientName =
      promise.client.type === 'INDIVIDUAL'
        ? `${promise.client.individualProfile?.firstName || ''} ${promise.client.individualProfile?.lastName || ''}`.trim()
        : promise.client.businessProfile?.businessName || 'Cliente'

    return {
      id: promise.id,
      clientId: promise.clientId,
      clientName,
      phone: decryptSafe(promise.client.phone),
      promiseDate: promise.promiseDate.toISOString(),
      promisedAmount: Number(promise.promisedAmount),
    }
  })

  return (
    <CollectionWorkspace
      canCreateCollectionAction={canCreateCollectionAction}
      metrics={metrics}
      prioritizedCases={serializedCases}
      promisesToday={serializedPromises}
    />
  )
}

export default async function CobranzaPage() {
  return (
    <Suspense fallback={<CollectionLoadingSkeleton />}>
      <CollectionContent />
    </Suspense>
  )
}
