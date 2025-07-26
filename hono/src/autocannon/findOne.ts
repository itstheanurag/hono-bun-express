import autocannon, { Request } from 'autocannon'

const VALID_IDS = [
  '74f741e2-448e-4caa-9261-c388780622f8',
]

const ALL_IDS = [...VALID_IDS]

const requests: Request[] = ALL_IDS.map((id) => ({
  method: 'GET',
  path: `/book/${id}`,
}))

// const statusCounts: Record<number, number> = {}

const instance = autocannon({
  url: 'http://localhost:3000',
  connections: 20,
  duration: 10,
  requests,
}) as any

// instance.on('response', (_client: any, statusCode: number) => {
//   statusCounts[statusCode] = (statusCounts[statusCode] || 0) + 1
// })

// instance.on('done', () => {
//   console.log('\n📬 Status Code Breakdown:')
//   Object.entries(statusCounts)
//     .sort(([a], [b]) => +a - +b)
//     .forEach(([code, count]) => {
//       console.log(`  ${code}: ${count}`)
//     })
// })

autocannon.track(instance, {
  renderProgressBar: true,
})
