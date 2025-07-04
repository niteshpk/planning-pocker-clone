#!/usr/bin/env node

/**
 * Manual seeding script for voting systems
 * Run this script manually: node scripts/seed.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEFAULT_VOTING_SYSTEMS = [
  {
    name: 'Fibonacci',
    values: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?']
  },
  {
    name: 'T-Shirt Sizes',
    values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?']
  },
  {
    name: 'Powers of 2',
    values: ['1', '2', '4', '8', '16', '32', '64', '?']
  },
  {
    name: 'Modified Fibonacci',
    values: ['0', '0.5', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?']
  }
];

async function seedVotingSystems() {
  try {
    console.log('🌱 Starting voting systems seeding...');
    
    for (const system of DEFAULT_VOTING_SYSTEMS) {
      // Check if voting system already exists
      const existing = await prisma.votingSystem.findUnique({
        where: { name: system.name }
      });
      
      if (!existing) {
        await prisma.votingSystem.create({
          data: system
        });
        console.log(`✅ Created voting system: ${system.name}`);
      } else {
        console.log(`⏭️  Voting system already exists: ${system.name}`);
      }
    }
    
    console.log('🎉 Voting systems seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding voting systems:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedVotingSystems();