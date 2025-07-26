import { Hono } from 'hono'

const decoys = new Hono()

// Create 100 decoy endpoints: /decoy-1 to /decoy-100
for (let i = 1; i <= 100; i++) {
  decoys.get(`/decoy-${i}`, (c) => {
    return c.json({ message: `This is decoy endpoint ${i}` })
  })
}

// Optional root endpoint for testing
decoys.get('/', (c) => {
  return c.json({ message: 'Root Decoy Endpoint' })
})

export default decoys
