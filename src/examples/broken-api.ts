// BROKEN: API endpoint with security and performance issues
export async function GET(request) {
  // BUG: No auth check
  // BUG: No error handling
  // BUG: SQL injection vulnerability
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  
  const query = `SELECT * FROM users WHERE id = ${userId}` // SQL injection!
  const result = await db.query(query)
  
  // BUG: Exposing sensitive data
  return Response.json(result.rows)
}
