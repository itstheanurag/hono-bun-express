import { MiddlewareHandler } from 'hono'
import { Pool } from 'pg'

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.connect()
  .then(client => {
    console.log('✅ Connected to the database successfully.')
    client.release()
  })
  .catch(err => {
    console.error('❌ Failed to connect to the database:', err.message)
  })

export const injectDb: MiddlewareHandler = async (c, next) => {
  c.set('db', pool)
  await next()
}