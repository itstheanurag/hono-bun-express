import { Hono } from "hono";
import { showRoutes } from 'hono/dev';
import { HTTPException } from 'hono/http-exception';
import book from "./rotues/books";
import decoys from "./rotues/decoys";

const app = new Hono();

// Add the json body parser middleware here, before any routes that consume JSON
app.get("/", (c) => c.json({ hello: "World!" }));
app.route('/', decoys);
app.route('/book', book);
app.all("*", (c) => c.text("Not Found", 404));
showRoutes(app, {
  verbose: false,
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    console.log('HTTPException:', err.message, 'Status:', err.status);
    return err.getResponse();
  }

  console.error('Unhandled error:', err);
  return c.text('Internal Server Error', 500);
});

Bun.serve({
  fetch: app.fetch,
  port: 3000,
  idleTimeout: 0, // disables timeout completely
});