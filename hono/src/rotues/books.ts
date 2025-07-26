import { Hono } from "hono";
import { validator } from "hono/validator";
import {
  searchQuerySchema,
  bookCreateSchema,
  updateBookSchema,
  findByIdSchema,
} from "../validations/book-schema";
import { errorFormatter } from "../error/formatiter";
import { injectDb } from "../middlewares/db";
import { Env } from "../types";
import { faker } from "@faker-js/faker";

const book = new Hono<Env>();

book.use("*", injectDb);

book.get(
  "/",
  validator("query", (value, c) => {
    const normalized = Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
    );
    const result = searchQuerySchema.safeParse(normalized);
    if (!result.success) return c.json(errorFormatter(result.error), 400);
    return result.data;
  }),
  async (c) => {
    const q = c.req.valid("query");
    const db = c.get("db");

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (q.title) {
      conditions.push(`title ILIKE $${idx++}`);
      values.push(`%${q.title}%`);
    }
    if (q.author) {
      conditions.push(`author ILIKE $${idx++}`);
      values.push(`%${q.author}%`);
    }
    if (q.minYear) {
      conditions.push(`published_year >= $${idx++}`);
      values.push(Number(q.minYear));
    }
    if (q.maxYear) {
      conditions.push(`published_year <= $${idx++}`);
      values.push(Number(q.maxYear));
    }
    if (q.minSales) {
      conditions.push(`total_sales >= $${idx++}`);
      values.push(Number(q.minSales));
    }
    if (q.maxSales) {
      conditions.push(`total_sales <= $${idx++}`);
      values.push(Number(q.maxSales));
    }

    const query = `SELECT count(*) FROM books ${
      conditions.length ? "WHERE " + conditions.join(" AND ") : ""
    }`;
    const result = await db.query(query, values);
    const count = result.rows[0]?.count ?? 0;

    return c.json({ message: "Total Books Found", count: Number(count) });
  }
);

book.get(
  "/:id",
  validator("param", (value, c) => {
    const result = findByIdSchema.safeParse(value);
    if (!result.success) return c.json(errorFormatter(result.error), 400);
    return result.data;
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const db = c.get("db");
    // console.log("Fetching book with ID:", id);
    const result = await db.query("SELECT id, title FROM books WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return c.json({ message: "Book not found" }, 404);
    }

    return c.json({ message: "Get Book by ID", book: result.rows[0] });
  }
);

book.post(
  "/",
  validator("json", (value, c) => {
    const result = bookCreateSchema.safeParse(value);
    if (!result.success) {
      // If validation fails, return a 400 response with error details
      // console.error("Validation error:", result.error);
      return c.json(errorFormatter(result.error), 400);}
    return result.data;
  }),
  async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");
    const result = await db.query(
      `INSERT INTO books (title, author, published_year, total_sales)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        data.title,
        data.author,
        data.publishedYear ?? null,
        data.totalSales ?? 0,
      ]
    );

    return c.json({ message: "Book Created", book: result.rows[0] });
  }
);

book.put(
  "/:id",
  validator("param", (value, c) => {
    const result = findByIdSchema.safeParse(value);
    if (!result.success) return c.json(errorFormatter(result.error), 400);
    return result.data;
  }),
  validator("json", (value, c) => {
    const result = updateBookSchema.safeParse(value);
    if (!result.success) return c.json(errorFormatter(result.error), 400);
    return result.data;
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    const db = c.get("db");

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      fields.push(
        `${key.replace(/([A-Z])/g, "_$1").toLowerCase()} = $${idx++}`
      );
      values.push(value);
    }

    if (fields.length === 0)
      return c.json({ message: "Nothing to update" }, 400);

    values.push(id);
    const query = `UPDATE books SET ${fields.join(
      ", "
    )} WHERE id = $${idx} RETURNING *`;
    const result = await db.query(query, values);

    if (result.rowCount === 0)
      return c.json({ message: "Book not found" }, 404);

    return c.json({ message: "Book Updated", book: result.rows[0] });
  }
);

book.delete(
  "/:id",
  validator("param", (value, c) => {
    const result = findByIdSchema.safeParse(value);
    if (!result.success) return c.json(errorFormatter(result.error), 400);
    return result.data;
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const db = c.get("db");

    const result = await db.query(
      "DELETE FROM books WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0)
      return c.json({ message: "Book not found" }, 404);

    return c.json({ message: "Book Deleted", book: result.rows[0] });
  }
);

book.post("/bulk-create", async (c) => {
  const db = c.get("db");

  const books = Array.from({ length: 1000 }, () => ({
    title: faker.lorem.sentence(3),
    author: faker.person.fullName(),
    published_year: faker.date.past({ years: 50 }).getFullYear(),
    total_sales: faker.number.int({ min: 0, max: 100000 }),
  }));

  const values = books
    .map(
      (b, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
    )
    .join(",");

  const flatValues = books.flatMap((b) => [
    b.title,
    b.author,
    b.published_year,
    b.total_sales,
  ]);

  const query = `
    INSERT INTO books (title, author, published_year, total_sales)
    VALUES ${values}
    RETURNING id
  `;

  try {
    const result = await db.query(query, flatValues);
    return c.json({
      message: `✅ Successfully inserted ${result.rowCount} fake books.`,
    });
  } catch (error) {
    console.error("❌ Error inserting fake books:", error);
    return c.json({ message: "Failed to insert fake books" }, 500);
  }
});

export default book;
