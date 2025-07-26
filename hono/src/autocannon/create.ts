import autocannon, { Request } from 'autocannon'
import { faker } from '@faker-js/faker'

const TOTAL_REQUESTS = 100
const payloadQueue: any[] = []

const statusCounts: Record<number, number> = {
  200: 0,
  201: 0,
  400: 0,
  500: 0,
  // dynamically track others too
}
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
  connections: 50,
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
  console.log('\n📊 Benchmark Summary:')
  console.log(`  🧾 Total Requests Sent: ${result.requests.total}`)
  console.log(`  ⏱ Duration: ${result.duration} seconds`)
  console.log(`  ⚡ Average RPS: ${result.requests.average}`)

  const total200s = Object.entries(allStatusCounts)
    .filter(([code]) => +code >= 200 && +code < 300)
    .reduce((sum, [_, count]) => sum + count, 0)

  const total400s = Object.entries(allStatusCounts)
    .filter(([code]) => +code >= 400 && +code < 500)
    .reduce((sum, [_, count]) => sum + count, 0)

  const total500s = Object.entries(allStatusCounts)
    .filter(([code]) => +code >= 500)
    .reduce((sum, [_, count]) => sum + count, 0)

  console.log('\n✅ Successful Responses (2xx):', total200s)
  console.log('❌ Client Errors (4xx):', total400s)
  console.log('🔥 Server Errors (5xx):', total500s)

  console.log('\n📬 All Status Code Counts:')
  Object.entries(allStatusCounts)
    .sort(([a], [b]) => +a - +b)
    .forEach(([code, count]) => {
      console.log(`  ${code}: ${count}`)
    })
})

autocannon.track(instance, {
  renderProgressBar: true,
  renderResultsTable: true,
  renderLatencyTable: true,
})
