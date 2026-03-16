import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { toSpainTime } from '@/lib/utils/timezone'

/**
 * Formatea una fecha en formato corto español (dd/mm/yyyy)
 * IMPORTANTE: Convierte a hora de España antes de formatear
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const spainDate = toSpainTime(dateObj)

  return format(spainDate, 'dd/MM/yyyy', { locale: es })
}

/**
 * Formatea una fecha en formato largo español
 * Ejemplo: "6 de marzo de 2026"
 * IMPORTANTE: Convierte a hora de España antes de formatear
 */
export function formatDateLong(date: Date | string | null | undefined): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const spainDate = toSpainTime(dateObj)

  return format(spainDate, "d 'de' MMMM 'de' yyyy", { locale: es })
}

/**
 * Formatea fecha y hora
 * Ejemplo: "06/03/2026 14:30"
 * IMPORTANTE: Muestra hora de España (CET/CEST)
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const spainDate = toSpainTime(dateObj)

  return format(spainDate, 'dd/MM/yyyy HH:mm', { locale: es })
}

/**
 * Formatea fecha relativa
 * Ejemplo: "hace 2 días", "en 3 días"
 * IMPORTANTE: Calcula respecto a hora actual de España
 */
export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const spainDate = toSpainTime(dateObj)

  if (isToday(spainDate)) return 'Hoy'
  if (isTomorrow(spainDate)) return 'Mañana'
  if (isYesterday(spainDate)) return 'Ayer'

  return formatDistanceToNow(spainDate, {
    addSuffix: true,
    locale: es,
  })
}

/**
 * Obtiene solo la hora
 * Ejemplo: "14:30"
 * IMPORTANTE: Muestra hora de España (CET/CEST)
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const spainDate = toSpainTime(dateObj)

  return format(spainDate, 'HH:mm', { locale: es })
}

/**
 * Parsear fecha en formato español DD/MM/YYYY
 * Retorna null si la fecha es inválida
 */
export function parseSpanishDate(dateString: string): Date | null {
  if (!dateString || !dateString.trim()) return null

  try {
    const parts = dateString.trim().split('/')
    if (parts.length !== 3) return null

    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1 // Los meses en JS son 0-indexed
    const year = parseInt(parts[2], 10)

    // Validar rangos
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900) {
      return null
    }

    const date = new Date(year, month, day)

    // Verificar que la fecha sea válida (por ejemplo, 31/02 no es válido)
    if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
      return null
    }

    return date
  } catch (error) {
    console.error('Error parsing Spanish date:', error)
    return null
  }
}

/**
 * Formatear para input date HTML (YYYY-MM-DD)
 */
export function formatForInput(date: Date | string | null | undefined): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'yyyy-MM-dd')
  } catch (error) {
    console.error('Error formatting for input:', error)
    return ''
  }
}

/**
 * Formatear solo mes y año (Marzo 2026)
 * IMPORTANTE: Convierte a hora de España antes de formatear
 */
export function formatMonthYear(date: Date | string | null | undefined): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const spainDate = toSpainTime(dateObj)

  return format(spainDate, "MMMM 'de' yyyy", { locale: es })
}
