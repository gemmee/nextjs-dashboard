// query/route.ts
import postgres from 'postgres';

// Determine SSL requirement based on environment
// For local development, ssl: false is typically needed if your local Postgres isn't configured for SSL
const sslConfig = {
  ssl: {
    rejectUnauthorized: false, // Crucial for local dev to Supabase
  },
};

// Use DATABASE_URL, which now points to your new Supabase project
const sql = postgres(process.env.DATABASE_URL!, sslConfig);

async function listInvoices() {
  const data = await sql`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
  `;

  return data;
}

export async function GET() {
  try {
    console.log('Fetching invoices via API route...'); // Added for debugging
    const invoicesData = await listInvoices();
    console.log('Invoices fetched successfully:', invoicesData); // Added for debugging
    return Response.json(invoicesData);
  } catch (error: any) { // Explicitly type error as 'any' for better logging
    console.error('Error fetching invoices:', error); // Log the full error
    if (error.code) { // Check for specific postgres.js error codes
      console.error('Postgres Error Code:', error.code);
      console.error('Postgres Error Message:', error.message);
      if (error.detail) {
        console.error('Postgres Error Detail:', error.detail);
      }
      if (error.hint) {
        console.error('Postgres Error Hint:', error.hint);
      }
    }
    return Response.json({ error: error.message || 'An unknown error occurred' }, { status: 500 });
  }
}