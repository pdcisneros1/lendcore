/**
 * User Validation Utilities
 *
 * Validates that users are still ACTIVE in the database.
 * Important for security: prevents deactivated users from
 * using stale JWT sessions to perform critical operations.
 */

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export interface UserValidationResult {
  isValid: boolean
  response?: NextResponse
}

/**
 * Validates that a user is still ACTIVE in the database.
 * Use this in critical API routes to ensure deactivated users
 * cannot perform operations with stale sessions.
 *
 * @param userId - The user ID from the session
 * @returns UserValidationResult with isValid flag and optional error response
 */
export async function validateActiveUser(userId: string): Promise<UserValidationResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    })

    if (!user) {
      return {
        isValid: false,
        response: NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 401 }
        ),
      }
    }

    if (user.status !== 'ACTIVE') {
      return {
        isValid: false,
        response: NextResponse.json(
          { error: 'Tu cuenta ha sido desactivada. Contacta al administrador.' },
          { status: 403 }
        ),
      }
    }

    return { isValid: true }
  } catch (error) {
    console.error('Error validating user status:', error)
    // In case of database error, fail open but log the issue
    // This prevents locking out all users if there's a temporary DB issue
    return { isValid: true }
  }
}
