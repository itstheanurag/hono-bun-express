import autocannon from "autocannon";
import { faker } from "@faker-js/faker";

const payloadQueue: any[] = [];

// Track how many responses per status code
const statusCounts: Record<number, number> = {};

function generateSearchParams(): Record<string, string> {
  const params: Record<string, string> = {};
    params.minYear = faker.number.int({ min: 1000, max: 2020 }).toString();
    params.maxYear = faker.number.int({ min: 2021, max: 2026 }).toString();
    params.minSales = faker.number.int({ min: 100, max: 50000 }).toString();
    params.maxSales = faker.number.int({ min: 50001, max: 100000 }).toString();

  return params;
}

function buildQueryString(params: Record<string, string>) {
  const query = new URLSearchParams(params);
  return query.toString();
}

// const requests: Request[] = () => {
//   return [
//     {
//       path: `/book?${buildQueryString(generateSearchParams())}`,
//       method: "GET",
//       headers: {
//         Accept: "application/json",
//       },
//     },
//   ];
// };

const instance = autocannon({
  url: "http://localhost:3000",
  connections: 20,
  duration: 10,
  requests: [
    {
      path: `/book?${buildQueryString(generateSearchParams())}`,
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  ],
}) as any;

instance.on("response", (_client: any, statusCode: number) => {
  const query = payloadQueue.shift();

  statusCounts[statusCode] = (statusCounts[statusCode] || 0) + 1;
});

instance.on("done", () => {
  console.log("\n📊 Status Code Summary:");
  Object.entries(statusCounts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([status, count]) => {
      console.log(`  ${status}: ${count} responses`);
    });
});

autocannon.track(instance, {
  renderProgressBar: true,
  renderResultsTable: true,
});

// Print status summary after test completes
