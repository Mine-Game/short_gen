const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('Setting up database...')
    
    // Push the schema to the database
    const { execSync } = require('child_process')
    execSync('npx prisma db push', { stdio: 'inherit' })
    
    console.log('Database setup completed successfully!')
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()
