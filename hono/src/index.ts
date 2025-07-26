import { Hono } from "hono"
import book from "./rotues/books";

const app = new Hono();

app.get("/", (c) => c.json({ hello: "World!" }));
app.route('/book', book)

export default app;
