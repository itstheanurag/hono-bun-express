import autocannon, { Request } from 'autocannon'

const VALID_IDS = [
//   'a331bfba-bc6b-4f71-92a1-3733a05fc22e',
//   'faf4b463-ad90-4030-b326-cecad2096521',
//   '91013c4e-5539-43c5-9c2e-99a3d1c37f4b',
//   '8701fc7a-0228-48f5-b549-839236835ffc',
//   '4a81cc07-ec41-40f9-b740-bbf77e4609e9',
//   'fb022046-c29b-4989-b50f-6d398d2574b8',
//   '5e43c3a2-035b-42d8-b37b-8051ca73ae4f',
//   '9fc1d8c3-b41e-46a6-9b92-9b82b227dd66',
//   'a2032c83-70e7-4052-8ed7-ce7812f9d08c',
  '09db95e2-3a73-4d82-9cce-086444e1294c',
]

// const FAKE_IDS = Array.from({ length: 10 }).map(() => crypto.randomUUID())

const ALL_IDS = [...VALID_IDS]

const requests: Request[] = ALL_IDS.map((id) => ({
  method: 'GET',
  path: `/book/${id}`,
}))

const statusCounts: Record<number, number> = {}

const instance = autocannon({
  url: 'http://localhost:3000',
  connections: 20,
  duration: 10,
  requests,
}) as any

instance.on('response', (_client: any, statusCode: number) => {
  statusCounts[statusCode] = (statusCounts[statusCode] || 0) + 1
})

instance.on('done', () => {
  console.log('\n📬 Status Code Breakdown:')
  Object.entries(statusCounts)
    .sort(([a], [b]) => +a - +b)
    .forEach(([code, count]) => {
      console.log(`  ${code}: ${count}`)
    })
})

autocannon.track(instance, {
  renderProgressBar: true,
})
