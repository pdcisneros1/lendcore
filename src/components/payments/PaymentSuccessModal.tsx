'use client'

import { CheckCircle2, TrendingDown, Landmark } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/formatters/currency'

interface PaymentSuccessModalProps {
  open: boolean
  onClose: () => void
  paymentData: {
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
  }
}

const getPaymentMethodLabel = (method: string) => {
  switch (method) {
    case 'CASH':
      return 'Efectivo'
    case 'BANK_TRANSFER':
      return 'Transferencia bancaria'
    case 'CHECK':
      return 'Cheque'
    case 'CARD':
      return 'Tarjeta'
    default:
      return method
  }
}

export function PaymentSuccessModal({ open, onClose, paymentData }: PaymentSuccessModalProps) {
  const isCapital = paymentData.isCapitalPayment
  const details = paymentData.capitalPaymentDetails

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            isCapital ? 'bg-emerald-100' : 'bg-green-100'
          }`}>
            {isCapital ? (
              <Landmark className="h-10 w-10 text-emerald-600" />
            ) : (
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            )}
          </div>
          <DialogTitle className="text-center text-2xl">
            {isCapital
              ? '¡Abono al Capital Exitoso!'
              : '¡Pago registrado exitosamente!'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Monto pagado */}
          <div className={`rounded-lg border-2 p-4 text-center ${
            isCapital
              ? 'border-emerald-500/20 bg-emerald-50/50'
              : 'border-green-500/20 bg-green-50/50'
          }`}>
            <p className="text-sm font-medium text-muted-foreground">
              {isCapital ? 'Abonado al Capital' : 'Monto pagado'}
            </p>
            <p className={`mt-1 text-3xl font-bold ${
              isCapital ? 'text-emerald-600' : 'text-green-600'
            }`}>
              {formatCurrency(paymentData.amount)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {getPaymentMethodLabel(paymentData.paymentMethod)}
            </p>
          </div>

          {/* Cliente y préstamo */}
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">Aplicado al préstamo</p>
            <p className="mt-1 text-base font-semibold">{paymentData.loanNumber}</p>
            <p className="text-sm text-muted-foreground">{paymentData.clientName}</p>
          </div>

          {/* ── Contenido específico: Abono al Capital ──────────────────────── */}
          {isCapital && details ? (
            <div className="space-y-2 rounded-lg border border-border/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recálculo Aplicado
              </p>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Capital anterior</span>
                <span className="font-medium">{formatCurrency(details.previousPrincipal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Capital nuevo</span>
                <span className="font-bold text-emerald-700">
                  {formatCurrency(details.newPrincipal)}
                </span>
              </div>

              {details.newPrincipal > 0 && (
                <>
                  <div className="my-1.5 border-t border-border/40" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Interés anterior / cuota</span>
                    <span className="font-medium">
                      {formatCurrency(details.previousInterestPerInstallment)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Interés nuevo / cuota</span>
                    <span className="font-bold text-emerald-700">
                      {formatCurrency(details.newInterestPerInstallment)}
                    </span>
                  </div>
                </>
              )}

              {details.interestSavings > 0 && (
                <div className="flex justify-between text-sm border-t border-border/40 pt-2 mt-2">
                  <span className="font-medium text-emerald-800">Ahorro en intereses</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(details.interestSavings)}
                  </span>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                {details.installmentsRecalculated > 0
                  ? `${details.installmentsRecalculated} cuotas recalculadas`
                  : 'Todas las cuotas pendientes eliminadas'}
              </p>
            </div>
          ) : (
            /* ── Contenido específico: Pago de Cuota (sin cambios) ────────── */
            <div className="space-y-2 rounded-lg border border-border/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Distribución del pago
              </p>

              {paymentData.allocatedToPrincipal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Capital</span>
                  <span className="font-medium">{formatCurrency(paymentData.allocatedToPrincipal)}</span>
                </div>
              )}

              {paymentData.allocatedToInterest > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Intereses</span>
                  <span className="font-medium">{formatCurrency(paymentData.allocatedToInterest)}</span>
                </div>
              )}

              {paymentData.allocatedToPenalty && paymentData.allocatedToPenalty > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Penalización</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(paymentData.allocatedToPenalty)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Saldo pendiente */}
          <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Saldo pendiente</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(paymentData.remainingBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={onClose} className="w-full">
          Entendido
        </Button>
      </DialogContent>
    </Dialog>
  )
}
