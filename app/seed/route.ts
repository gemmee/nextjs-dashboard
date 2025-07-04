import bcrypt from 'bcryptjs';
// import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

// const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const sslConfig = {
  ssl: {
    rejectUnauthorized: false, // Crucial for local dev to Supabase
  },
};

// Use DATABASE_URL, which now points to your new Supabase project
const sql = postgres(process.env.DATABASE_URL!, sslConfig);

async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

async function seedInvoices() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}

export async function GET() {
  try {
    console.log('Starting database seeding via API route...'); // Add this
    const result = await sql.begin(async (sql) => { // Make the transaction callback async
      await seedUsers();
      await seedCustomers();
      await seedInvoices();
      await seedRevenue();
    });

    console.log('Database seeded successfully!'); // Add this
    return Response.json({ message: 'Database seeded successfully' });
  } catch (error: any) { // Explicitly type error as 'any' for easier logging
    console.error('Error during database seeding:', error); // Log the full error
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
    return Response.json({ error: error.message || 'An unknown error occurred during seeding' }, { status: 500 });
  } finally {
    // It's generally good practice to disconnect the client when done,
    // especially if this is a long-lived process or not managed by a connection pool.
    // However, for a Next.js API route, the client might be reused.
    // If you see "Client has already been released" errors, remove this.
    // If you have a global postgres client, manage its lifecycle carefully.
    // For a simple seed, it might be okay to let it close with the request.
    // await sql.end(); // Uncomment if you manage connection lifecycle here
  }
}