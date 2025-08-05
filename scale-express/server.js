// import express from 'express'
import http from 'http';
import cluster from 'cluster';
import os from 'os';
const numberOfCpus = os.cpus().length;

// if (cluster.isPrimary) {
//   console.log(`Master ${process.pid} is running`);
//   for (let i = 0; i < numberOfCpus; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//     cluster.fork();
//   });
// } else {
//   const app = express();

//   app.get('/', (req, res) => {
//     res.send(`Hello from worker ${process.pid}!`);
//   });

//   app.listen(3000, () => {
//     console.log(`Worker ${process.pid} started`);
//   });
// }


if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);
  for (let i = 0; i < numberOfCpus; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello');
}).listen(3000, () => {
  console.log(`Worker ${process.pid} started`)      
});
}



