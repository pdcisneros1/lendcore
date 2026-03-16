/**
 * Utilidades de Zona Horaria - España (Bilbao/Madrid)
 *
 * IMPORTANTE: Esta aplicación opera en zona horaria de España (Europe/Madrid)
 * independientemente de dónde esté desplegado el servidor.
 *
 * - CET (Invierno): UTC+1
 * - CEST (Verano): UTC+2
 */

import { APP_CONFIG } from '@/lib/constants/config'

export const SPAIN_TIMEZONE = APP_CONFIG.timezone // 'Europe/Madrid'

/**
 * Obtiene la fecha/hora actual en zona horaria de España
 */
export function getNowInSpain(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: SPAIN_TIMEZONE }))
}

/**
 * Convierte cualquier fecha a zona horaria de España
 */
export function toSpainTime(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Date(dateObj.toLocaleString('en-US', { timeZone: SPAIN_TIMEZONE }))
}

/**
 * Obtiene el inicio del día en España (00:00:00)
 */
export function getStartOfDaySpain(date?: Date): Date {
  const targetDate = date ? toSpainTime(date) : getNowInSpain()
  targetDate.setHours(0, 0, 0, 0)
  return targetDate
}

/**
 * Obtiene el fin del día en España (23:59:59)
 */
export function getEndOfDaySpain(date?: Date): Date {
  const targetDate = date ? toSpainTime(date) : getNowInSpain()
  targetDate.setHours(23, 59, 59, 999)
  return targetDate
}

/**
 * Verifica si una fecha es "hoy" en España
 */
export function isTodayInSpain(date: Date | string): boolean {
  const targetDate = toSpainTime(date)
  const today = getNowInSpain()

  return (
    targetDate.getDate() === today.getDate() &&
    targetDate.getMonth() === today.getMonth() &&
    targetDate.getFullYear() === today.getFullYear()
  )
}

/**
 * Verifica si una fecha ya pasó (en hora de España)
 */
export function isPastInSpain(date: Date | string): boolean {
  const targetDate = toSpainTime(date)
  const now = getNowInSpain()
  return targetDate < now
}

/**
 * Calcula días de diferencia respecto a hoy (en España)
 */
export function getDaysFromTodaySpain(date: Date | string): number {
  const targetDate = toSpainTime(date)
  const today = getNowInSpain()

  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Formatea fecha/hora para mostrar al usuario (siempre en hora España)
 */
export function formatForDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return new Intl.DateTimeFormat('es-ES', {
    timeZone: SPAIN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

/**
 * Formatea solo fecha para mostrar al usuario
 */
export function formatDateForDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return new Intl.DateTimeFormat('es-ES', {
    timeZone: SPAIN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj)
}

/**
 * Formatea solo hora para mostrar al usuario
 */
export function formatTimeForDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return new Intl.DateTimeFormat('es-ES', {
    timeZone: SPAIN_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

/**
 * Agrega días a una fecha (respetando zona horaria España)
 */
export function addDaysSpain(date: Date | string, days: number): Date {
  const dateObj = toSpainTime(date)
  dateObj.setDate(dateObj.getDate() + days)
  return dateObj
}

/**
 * Agrega meses a una fecha (respetando zona horaria España)
 */
export function addMonthsSpain(date: Date | string, months: number): Date {
  const dateObj = toSpainTime(date)
  dateObj.setMonth(dateObj.getMonth() + months)
  return dateObj
}

/**
 * Obtiene el offset de España respecto a UTC en minutos
 * CET (invierno): -60 (UTC+1)
 * CEST (verano): -120 (UTC+2)
 */
export function getSpainUTCOffset(): number {
  const now = new Date()
  const spainTime = new Date(now.toLocaleString('en-US', { timeZone: SPAIN_TIMEZONE }))
  const utcTime = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))

  return (spainTime.getTime() - utcTime.getTime()) / (1000 * 60)
}

/**
 * Verifica si España está en horario de verano (CEST)
 */
export function isSpainInDST(): boolean {
  const offset = getSpainUTCOffset()
  return offset === 120 // CEST = UTC+2
}
