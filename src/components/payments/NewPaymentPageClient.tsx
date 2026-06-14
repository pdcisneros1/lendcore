'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PaymentSuccessModal } from './PaymentSuccessModal'
import { formatCurrency } from '@/lib/formatters/currency'
import { formatDate } from '@/lib/formatters/date'
import { getOpenInstallmentStatuses } from '@/lib/utils/installmentStatus'
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  CreditCard,
  Landmark,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import type { InstallmentStatus } from '@prisma/client'

type PaymentMethodValue = 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'CHECK' | 'OTHER'
type PaymentTypeValue = 'INSTALLMENT' | 'CAPITAL'

interface LoanClientSummary {
  type: 'INDIVIDUAL' | 'BUSINESS'
  individualProfile?: {
    firstName?: string | null
    lastName?: string | null
  } | null
  businessProfile?: {
    businessName?: string | null
  } | null
}

interface LoanInstallmentSummary {
  id: string
  installmentNumber: number
  dueDate: string
  principalAmount: number | string
  interestAmount: number | string
  pendingAmount: number | string
  totalAmount: number | string
  status: string
}

interface LoanPaymentPageData {
  id: string
  loanNumber: string
  principalAmount: number | string
  outstandingPrincipal: number | string
  interestRate: number | string
  interestType: string
  amortizationType: string
  fixedInterestAmount?: number | string | null
  client: LoanClientSummary
  installments: LoanInstallmentSummary[]
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0)
}

function isOpenInstallment(status: string) {
  return getOpenInstallmentStatuses().includes(status as InstallmentStatus)
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text()

  if (!text) {
    return {} as T
  }

  try {
    return JSON.parse(text) as T
  } catch {
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      throw new Error('El servidor devolvió HTML en lugar de JSON. Revisa el endpoint de pagos.')
    }

    throw new Error('El servidor devolvió una respuesta inesperada.')
  }
}

export default function NewPaymentPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const loanId = searchParams.get('loanId')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loan, setLoan] = useState<LoanPaymentPageData | null>(null)
  const [selectedInstallmentId, setSelectedInstallmentId] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>('CASH')
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split('T')[0])
  const [paymentType, setPaymentType] = useState<PaymentTypeValue>('INSTALLMENT')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    amount: number
    paymentMethod: string
    loanNumber: string
    clientName: string
    remainingBalance: number
    allocatedToPrincipal: number
    allocatedToInterest: number
    allocatedToPenalty?: number
    isCapitalPayment?: boolean
    capitalPaymentDetails?: {
      previousPrincipal: number
      newPrincipal: number
      previousInterestPerInstallment: number
      newInterestPerInstallment: number
      installmentsRecalculated: number
      interestSavings: number
    }
  } | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // F2: Advertir si hay cambios sin guardar
  const hasUnsavedChanges = amount !== '' && !showSuccessModal
  useUnsavedChanges(hasUnsavedChanges)

  useEffect(() => {
    if (!loanId) {
      setError('No se especificó el préstamo')
      setLoading(false)
      return
    }

    fetch(`/api/loans/${loanId}`)
      .then(async res => {
        const data = await parseResponse<LoanPaymentPageData & { error?: string }>(res)

        if (!res.ok) {
          throw new Error(data.error || 'Error al cargar el préstamo')
        }

        return data
      })
      .then(data => {
        setLoan(data)
        const firstPending = data.installments?.find(
          inst => isOpenInstallment(inst.status) && toNumber(inst.pendingAmount) > 0
        )
        if (firstPending) {
          setSelectedInstallmentId(firstPending.id)
          setAmount(toNumber(firstPending.pendingAmount).toString())
        }
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Error al cargar el préstamo')))
      .finally(() => setLoading(false))
  }, [loanId])

  // ── Valores calculados para Abono al Capital ────────────────────────────────
  const pendingOnlyInstallments = useMemo(() => {
    return loan?.installments?.filter(inst => inst.status === 'PENDING') || []
  }, [loan])

  const capitalPendiente = useMemo(() => {
    return pendingOnlyInstallments.reduce(
      (sum, inst) => sum + toNumber(inst.principalAmount),
      0
    )
  }, [pendingOnlyInstallments])

  const currentInterestPerInstallment = useMemo(() => {
    return pendingOnlyInstallments.length > 0
      ? toNumber(pendingOnlyInstallments[0].interestAmount)
      : 0
  }, [pendingOnlyInstallments])

  const capitalPreview = useMemo(() => {
    const abonoAmount = parseFloat(amount) || 0
    if (abonoAmount <= 0 || !loan || paymentType !== 'CAPITAL') return null

    const newCapital = Math.max(0, capitalPendiente - abonoAmount)
    let newInterest = 0

    if (newCapital > 0 && loan.interestType !== 'FIXED_AMOUNT') {
      const rawRate = toNumber(loan.interestRate)
      const rateDecimal = rawRate <= 1 ? rawRate : rawRate / 100

      if (loan.interestType === 'PERCENTAGE_MONTHLY') {
        newInterest = newCapital * rateDecimal
      } else if (loan.interestType === 'PERCENTAGE_ANNUAL') {
        newInterest = newCapital * (rateDecimal / 12)
      }
      newInterest = Number(newInterest.toFixed(2))
    } else if (loan.interestType === 'FIXED_AMOUNT') {
      newInterest = currentInterestPerInstallment
    }

    const savings = Number(
      ((currentInterestPerInstallment - newInterest) * pendingOnlyInstallments.length).toFixed(2)
    )

    return {
      newCapital: Number(newCapital.toFixed(2)),
      newInterest,
      savings,
      isFullPayoff: newCapital <= 0,
    }
  }, [amount, loan, paymentType, capitalPendiente, currentInterestPerInstallment, pendingOnlyInstallments])

  const interestRateDisplay = useMemo(() => {
    if (!loan) return ''
    const rawRate = toNumber(loan.interestRate)
    if (loan.interestType === 'FIXED_AMOUNT') {
      return `${formatCurrency(toNumber(loan.fixedInterestAmount))} fijo`
    }
    const pct = rawRate <= 1 ? (rawRate * 100).toFixed(2) : rawRate.toFixed(2)
    const suffix = loan.interestType === 'PERCENTAGE_ANNUAL' ? '% anual' : '% mensual'
    return `${pct}${suffix}`
  }, [loan])

  // F1: Interceptar submit para mostrar confirmación
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirmDialog(true)
  }

  const handleConfirmedSubmit = async () => {
    setShowConfirmDialog(false)
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId,
          amount: parseFloat(amount),
          paymentMethod,
          paidAt,
          paymentType,
          installmentId: paymentType === 'INSTALLMENT' ? (selectedInstallmentId || null) : null,
        }),
      })

      const result = await parseResponse<{
        error?: string
        id: string
        amount: number
        paymentMethod: string
        allocations?: Array<{
          type: 'PRINCIPAL' | 'INTEREST' | 'PENALTY'
          amount: number
        }>
        loan?: {
          loanNumber: string
          outstandingPrincipal: number
          client: LoanClientSummary
        }
        capitalPaymentDetails?: {
          previousPrincipal: number
          newPrincipal: number
          previousInterestPerInstallment: number
          newInterestPerInstallment: number
          installmentsRecalculated: number
          interestSavings: number
        }
      }>(response)

      if (!response.ok) {
        throw new Error(result.error || 'Error al registrar el pago')
      }

      // Preparar datos para el modal de éxito
      const clientName =
        loan?.client.type === 'INDIVIDUAL'
          ? `${loan.client.individualProfile?.firstName} ${loan.client.individualProfile?.lastName}`
          : loan?.client.businessProfile?.businessName || 'Cliente'

      if (result.capitalPaymentDetails) {
        // Abono al capital
        setPaymentSuccessData({
          amount: result.amount,
          paymentMethod: result.paymentMethod,
          loanNumber: result.loan?.loanNumber || loan?.loanNumber || '',
          clientName,
          remainingBalance: result.loan?.outstandingPrincipal
            ? toNumber(result.loan.outstandingPrincipal)
            : 0,
          allocatedToPrincipal: result.amount,
          allocatedToInterest: 0,
          isCapitalPayment: true,
          capitalPaymentDetails: result.capitalPaymentDetails,
        })
      } else {
        // Pago de cuota normal
        const allocatedToPrincipal =
          result.allocations?.find(a => a.type === 'PRINCIPAL')?.amount || 0
        const allocatedToInterest =
          result.allocations?.find(a => a.type === 'INTEREST')?.amount || 0
        const allocatedToPenalty =
          result.allocations?.find(a => a.type === 'PENALTY')?.amount || 0

        setPaymentSuccessData({
          amount: result.amount,
          paymentMethod: result.paymentMethod,
          loanNumber: result.loan?.loanNumber || loan?.loanNumber || '',
          clientName,
          remainingBalance: result.loan?.outstandingPrincipal
            ? toNumber(result.loan.outstandingPrincipal)
            : 0,
          allocatedToPrincipal,
          allocatedToInterest,
          allocatedToPenalty: allocatedToPenalty > 0 ? allocatedToPenalty : undefined,
        })
      }

      setShowSuccessModal(true)
      setSubmitting(false)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al registrar el pago'))
      setSubmitting(false)
    }
  }

  // ── Cambiar tipo de pago ────────────────────────────────────────────────────
  const switchPaymentType = (type: PaymentTypeValue) => {
    setPaymentType(type)
    setAmount('')
    setSelectedInstallmentId('')
    setError('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!loan) {
    return (
      <div className="space-y-6">
        <p className="text-red-600">{error || 'Préstamo no encontrado'}</p>
        <Link href="/dashboard/prestamos">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>
    )
  }

  const clientName =
    loan.client.type === 'INDIVIDUAL'
      ? `${loan.client.individualProfile?.firstName} ${loan.client.individualProfile?.lastName}`
      : loan.client.businessProfile?.businessName

  const pendingInstallments = loan.installments?.filter(
    inst => isOpenInstallment(inst.status) && toNumber(inst.pendingAmount) > 0
  ) || []

  const isCapitalMode = paymentType === 'CAPITAL'
  const abonoAmount = parseFloat(amount) || 0
  const isAmountValid = isCapitalMode
    ? abonoAmount > 0 && abonoAmount <= capitalPendiente
    : abonoAmount > 0

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/prestamos/${loanId}`}>
          <Button variant="ghost" size="icon" aria-label="Volver atrás">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Registrar Pago</h1>
          <p className="text-muted-foreground">
            {loan.loanNumber} - {clientName}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* ── Selector de tipo de pago ──────────────────────────────────────────── */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl max-w-md">
        <button
          type="button"
          onClick={() => switchPaymentType('INSTALLMENT')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            !isCapitalMode
              ? 'bg-white shadow-sm text-[#14263f] ring-1 ring-black/5'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Pago de Cuota
        </button>
        <button
          type="button"
          onClick={() => switchPaymentType('CAPITAL')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            isCapitalMode
              ? 'bg-white shadow-sm text-[#14263f] ring-1 ring-black/5'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Landmark className="h-4 w-4" />
          Abono al Capital
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ── Panel izquierdo ────────────────────────────────────────────────── */}
        {isCapitalMode ? (
          /* ── Resumen del préstamo (modo capital) ──────────────────────────── */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-[#a97b36]" />
                Resumen del Préstamo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Capital original</span>
                <span className="font-semibold">{formatCurrency(toNumber(loan.principalAmount))}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#14263f]/5 rounded-lg border border-[#14263f]/10">
                <span className="text-sm font-medium text-[#14263f]">Capital pendiente</span>
                <span className="font-bold text-lg text-[#14263f]">{formatCurrency(capitalPendiente)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Tasa de interés</span>
                <span className="font-semibold">{interestRateDisplay}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Cuotas pendientes</span>
                <span className="font-semibold">{pendingOnlyInstallments.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Interés actual / cuota</span>
                <span className="font-semibold text-orange-600">{formatCurrency(currentInterestPerInstallment)}</span>
              </div>

              {/* Previsualización del impacto */}
              {capitalPreview && (
                <div className="mt-2 p-4 border-2 border-green-500/20 bg-green-50/50 rounded-xl space-y-3 animate-in fade-in duration-300">
                  <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Previsualización del Abono
                  </p>

                  {capitalPreview.isFullPayoff && (
                    <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-800">
                        Este abono liquida todo el capital. Las cuotas de interés restantes serán eliminadas.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nuevo capital pendiente</span>
                    <span className="font-bold">{formatCurrency(capitalPreview.newCapital)}</span>
                  </div>
                  {!capitalPreview.isFullPayoff && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nuevo interés / cuota</span>
                      <span className="font-bold text-green-700">{formatCurrency(capitalPreview.newInterest)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-t border-green-200 pt-2">
                    <span className="font-medium text-green-800">Ahorro total en intereses</span>
                    <span className="font-bold text-green-600">{formatCurrency(capitalPreview.savings)}</span>
                  </div>
                </div>
              )}

              {capitalPendiente <= 0 && (
                <div className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-green-800">
                    No hay capital pendiente para abonar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* ── Lista de cuotas pendientes (modo cuota — sin cambios) ────────── */
          <Card>
            <CardHeader>
              <CardTitle>Cuotas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingInstallments.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <p className="text-lg font-semibold text-green-800 mb-2">
                    ¡Préstamo Completado!
                  </p>
                  <p className="text-sm text-gray-600">
                    Este préstamo no tiene cuotas pendientes.
                    <br />
                    Todas las cuotas han sido pagadas.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingInstallments.map(inst => (
                    <div
                      key={inst.id}
                      onClick={() => {
                        setSelectedInstallmentId(inst.id)
                        setAmount(toNumber(inst.pendingAmount).toString())
                      }}
                      className={`p-4 border rounded cursor-pointer hover:bg-gray-50 ${
                        selectedInstallmentId === inst.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">Cuota #{inst.installmentNumber}</p>
                          <p className="text-sm text-gray-600">{formatDate(inst.dueDate)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">
                            {formatCurrency(toNumber(inst.pendingAmount))}
                          </p>
                          <p className="text-xs text-gray-500">
                            Total: {formatCurrency(toNumber(inst.totalAmount))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Panel derecho: Formulario de pago ──────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isCapitalMode ? 'Datos del Abono' : 'Datos del Pago'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label htmlFor="payment-amount">
                  {isCapitalMode ? 'Monto a Abonar al Capital *' : 'Monto a Pagar *'}
                </Label>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={isCapitalMode ? capitalPendiente : undefined}
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder={isCapitalMode ? `Máx: ${formatCurrency(capitalPendiente)}` : undefined}
                />
                {isCapitalMode && abonoAmount > capitalPendiente && (
                  <p className="text-xs text-red-600 mt-1">
                    El monto excede el capital pendiente ({formatCurrency(capitalPendiente)})
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="payment-method">Método de Pago *</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={value => setPaymentMethod(value as PaymentMethodValue)}
                >
                  <SelectTrigger id="payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Efectivo</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Transferencia</SelectItem>
                    <SelectItem value="CARD">Tarjeta</SelectItem>
                    <SelectItem value="CHECK">Cheque</SelectItem>
                    <SelectItem value="OTHER">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="payment-date">Fecha de Pago</Label>
                <Input
                  id="payment-date"
                  type="date"
                  value={paidAt}
                  onChange={e => setPaidAt(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={
                    submitting ||
                    !isAmountValid ||
                    (isCapitalMode ? capitalPendiente <= 0 : pendingInstallments.length === 0)
                  }
                  className={isCapitalMode
                    ? 'bg-[linear-gradient(135deg,#14663f_0%,#1f5c3a_72%,#a9a036_100%)] text-white'
                    : undefined
                  }
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : isCapitalMode ? (
                    <>
                      <Landmark className="mr-2 h-4 w-4" />
                      Registrar Abono al Capital
                    </>
                  ) : (
                    'Registrar Pago'
                  )}
                </Button>
                <Link href={`/dashboard/prestamos/${loanId}`}>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* ── Diálogo de confirmación ──────────────────────────────────────────── */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-label="Confirmar pago">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {isCapitalMode ? (
              <>
                <h3 className="text-lg font-semibold text-[#14263f] flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-[#a97b36]" />
                  Confirmar Abono al Capital
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Estás a punto de abonar <strong>{formatCurrency(abonoAmount)}</strong> al capital del préstamo.
                </p>

                {capitalPreview && (
                  <div className="mt-4 space-y-2 rounded-lg bg-muted/30 p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Capital actual</span>
                      <span className="font-medium">{formatCurrency(capitalPendiente)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nuevo capital</span>
                      <span className="font-bold text-green-700">{formatCurrency(capitalPreview.newCapital)}</span>
                    </div>
                    {!capitalPreview.isFullPayoff && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Nuevo interés / cuota</span>
                        <span className="font-bold text-green-700">{formatCurrency(capitalPreview.newInterest)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="font-medium">Ahorro en intereses</span>
                      <span className="font-bold text-green-600">{formatCurrency(capitalPreview.savings)}</span>
                    </div>
                  </div>
                )}

                <p className="mt-3 text-xs text-muted-foreground">
                  Se recalcularán las cuotas pendientes con el nuevo capital. Esta operación no se puede deshacer.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-[#14263f]">Confirmar registro de pago</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Estás a punto de registrar un pago por <strong>{formatCurrency(parseFloat(amount || '0'))}</strong>.
                  Esta operación no se puede deshacer.
                </p>
              </>
            )}
            <div className="mt-6 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmedSubmit}
                className={`rounded-xl text-white ${
                  isCapitalMode
                    ? 'bg-[linear-gradient(135deg,#14663f_0%,#1f5c3a_72%,#a9a036_100%)]'
                    : 'bg-[linear-gradient(135deg,#14263f_0%,#1f3a5c_72%,#a97b36_100%)]'
                }`}
              >
                {isCapitalMode ? 'Confirmar Abono' : 'Confirmar pago'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {paymentSuccessData && (
        <PaymentSuccessModal
          open={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false)
            router.push(`/dashboard/prestamos/${loanId}`)
            router.refresh()
          }}
          paymentData={paymentSuccessData}
        />
      )}
    </div>
  )
}
