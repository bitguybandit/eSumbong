/** Validates request data against a Zod schema, throwing a 400 on failure. */
export function parse(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(' ');
    const err = new Error(message);
    err.status = 400;
    throw err;
  }
  return result.data;
}
