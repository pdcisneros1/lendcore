'use client'

import { CheckCircle2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/formatters/currency'

interface LoanCreatedModalProps {
  open: boolean
  onClose: () => void
  loanData: {
    clientName: string
    loanNumber: string
    amortizationType: string
    principalAmount: number
    termMonths: number
    installmentAmount: number
    finalPayment: number
    annualRate: number
  }
}

const getAmortizationLabel = (type: string) => {
  switch (type) {
    case 'FRENCH':
      return 'Francés (cuota fija)'
    case 'AMERICAN':
      return 'Americano (intereses periódicos)'
    case 'GERMAN':
      return 'Alemán (amortización constante)'
    default:
      return type
  }
}

export function LoanCreatedModal({ open, onClose, loanData }: LoanCreatedModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <DialogTitle className="text-center text-2xl">¡Préstamo creado exitosamente!</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Cliente */}
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">Cliente</p>
            <p className="mt-1 text-base font-semibold">{loanData.clientName}</p>
            <p className="text-sm text-muted-foreground">Préstamo #{loanData.loanNumber}</p>
          </div>

          {/* Detalles del préstamo */}
          <div className="grid gap-3">
            <div className="flex justify-between rounded-lg border border-border/60 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Tipo de préstamo</p>
                <p className="mt-1 text-sm font-medium">{getAmortizationLabel(loanData.amortizationType)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Tasa anual</p>
                <p className="mt-1 text-sm font-medium">{loanData.annualRate.toFixed(2)}%</p>
              </div>
            </div>

            <div className="flex justify-between rounded-lg border border-border/60 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Monto prestado</p>
                <p className="mt-1 text-lg font-bold text-primary">
                  {formatCurrency(loanData.principalAmount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Plazo</p>
                <p className="mt-1 text-lg font-bold">
                  {loanData.termMonths} {loanData.termMonths === 1 ? 'mes' : 'meses'}
                </p>
              </div>
            </div>

            <div className="flex justify-between rounded-lg border border-border/60 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Cuota mensual</p>
                <p className="mt-1 text-base font-semibold">{formatCurrency(loanData.installmentAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Último pago</p>
                <p className="mt-1 text-base font-semibold">{formatCurrency(loanData.finalPayment)}</p>
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
