import { Hono } from "hono"
import { showRoutes} from 'hono/dev'
import { HTTPException } from 'hono/http-exception'
import book from "./rotues/books";
import decoys from "./rotues/decoys";
const app = new Hono();

app.get("/", (c) => c.json({ hello: "World!" }));
app.route('/v1', decoys);
app.route('/book', book)

// showRoutes(app, {
//   verbose: false,
// })

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }

  console.error('Unhandled error:', err)
  return c.text('Internal Server Error', 500)
})

export default app;
