import { getConnection, query } from '../lib/db';

const votingSystems = [
  {
    name: 'Fibonacci',
    values: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?']
  },
  {
    name: 'Modified Fibonacci',
    values: ['0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?']
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
    name: 'Linear',
    values: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '?']
  }
];

async function seedVotingSystems() {
  try {
    console.log('🌱 Starting MySQL database seeding...');
    
    // Ensure connection
    await getConnection();
    console.log('✅ Connected to MySQL database');

    // Check if voting systems already exist
    const existingCount = await query('SELECT COUNT(*) as count FROM voting_systems');
    const count = existingCount[0]?.count || 0;

    if (count > 0) {
      console.log(`ℹ️  Found ${count} existing voting systems. Skipping seed.`);
      return;
    }

    console.log('📝 Seeding voting systems...');

    // Insert voting systems
    for (const system of votingSystems) {
      await query(
        'INSERT INTO voting_systems (name, values) VALUES (?, ?)',
        [system.name, JSON.stringify(system.values)]
      );
      console.log(`   ✓ Added ${system.name}`);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Seeded ${votingSystems.length} voting systems`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedVotingSystems()
    .then(() => {
      console.log('🎉 Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

export { seedVotingSystems };