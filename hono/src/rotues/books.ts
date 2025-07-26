import { Hono } from "hono"
import { validator } from "hono/validator"
import {
  searchQuerySchema,
  bookCreateSchema,
  updateBookSchema,
  findByIdSchema,
} from "../validations/book-schema"
import { errorFormatter } from "../error/formatiter"

const book = new Hono()

// GET /books — list books with query validation
book.get(
  '/',
  validator('query', (value, c) => {
    const normalized = Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
    )

    const result = searchQuerySchema.safeParse(normalized)
    if (!result.success) {
      return c.json(errorFormatter(result.error), 400)
    }

    return result.data
  }),
  (c) => {
    const query = c.req.valid('query')
    return c.json({ message: 'List Books', query })
  }
)

// GET /books/:id — fetch by ID
book.get(
  '/:id',
  validator('param', (value, c) => {
    const result = findByIdSchema.safeParse(value)
    if (!result.success) {
      return c.json(errorFormatter(result.error), 400)
    }
    return result.data
  }),
  (c) => {
    const { id } = c.req.valid('param')
    return c.json({ message: 'Get Book by ID', id })
  }
)

// POST /books — create a book
book.post(
  '/',
  validator('json', (value, c) => {
    const result = bookCreateSchema.safeParse(value)
    if (!result.success) {
      return c.json(errorFormatter(result.error), 400)
    }
    return result.data
  }),
  async (c) => {
    const data = c.req.valid('json')
    return c.json({ message: 'Book Created', data })
  }
)

// PUT /books/:id — update book
book.put(
  '/:id',
  validator('param', (value, c) => {
    const result = findByIdSchema.safeParse(value)
    if (!result.success) {
      return c.json(errorFormatter(result.error), 400)
    }
    return result.data
  }),
  validator('json', (value, c) => {
    const result = updateBookSchema.safeParse(value)
    if (!result.success) {
      return c.json(errorFormatter(result.error), 400)
    }
    return result.data
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    const data = c.req.valid('json')
    return c.json({ message: 'Book Updated', id, data })
  }
)

// DELETE /books/:id — delete book
book.delete(
  '/:id',
  validator('param', (value, c) => {
    const result = findByIdSchema.safeParse(value)
    if (!result.success) {
      return c.json(errorFormatter(result.error), 400)
    }
    return result.data
  }),
  (c) => {
    const { id } = c.req.valid('param')
    return c.json({ message: 'Book Deleted', id })
  }
)

export default book
