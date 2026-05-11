const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL }); // Using Direct URL for seed script
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'admin@globalconstruction.se';
  const password = 'GlobalAdmin2026!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  console.log('Admin user created successfully:', admin.email);
  console.log('Temporary password:', password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
