// types.ts (optional, but clean)
import type { Pool } from 'pg'

export type Env = {
  Variables: {
    db: Pool
  }
}