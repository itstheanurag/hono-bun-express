import autocannon, { Request } from 'autocannon'
import { faker } from '@faker-js/faker'

const TOTAL_REQUESTS = 10000
const payloadQueue: any[] = []

const allStatusCounts: Record<number, number> = {}

function generatePayload() {
  return {
    title: faker.lorem.words(3),
    author: faker.person.fullName(),
    publishedYear: faker.number.int({ min: 1000, max: 2026 }),
    totalSales: faker.number.int({ min: 100, max: 100000 }),
  }
}

// Pre-generate typed requests
const requests: Request[] = Array.from({ length: TOTAL_REQUESTS }).map(() => {
  const payload = generatePayload()
  payloadQueue.push(payload)

  return {
    method: 'POST',
    path: '/book',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }
})

const instance = autocannon({
  url: 'http://localhost:3000',
  connections: 20,
  duration: 10,
  requests,
}) as any

instance.on('response', (_client: any, statusCode: number) => {
  const payload = payloadQueue.shift()

  // Count specific statuses
  if (statusCode === 400) {
    console.error('❌ 400 Bad Request — Payload:', payload)
  }

  // Track all status codes
  allStatusCounts[statusCode] = (allStatusCounts[statusCode] || 0) + 1
})

// Final summary on completion
instance.on('done', (result: any) => {
  Object.entries(allStatusCounts)
    .sort(([a], [b]) => +a - +b)
    .forEach(([code, count]) => {
      console.log(`  ${code}: ${count}`)
    })
})

autocannon.track(instance, {
  renderProgressBar: true,
  // renderLatencyTable: true,
})
