'use client'

import { CheckCircle2, TrendingDown } from 'lucide-react'
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
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <DialogTitle className="text-center text-2xl">¡Pago registrado exitosamente!</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Monto pagado */}
          <div className="rounded-lg border-2 border-green-500/20 bg-green-50/50 p-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">Monto pagado</p>
            <p className="mt-1 text-3xl font-bold text-green-600">{formatCurrency(paymentData.amount)}</p>
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

          {/* Distribución del pago */}
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
