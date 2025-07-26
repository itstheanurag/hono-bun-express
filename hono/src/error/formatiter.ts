import { ZodError } from 'zod'

export function errorFormatter(error: ZodError) {
  const formatted: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'non_field_error'
    if (!formatted[path]) {
      formatted[path] = issue.message
    }
  }

  return {
    message: 'Validation Failed',
    errors: formatted,
  }
}

