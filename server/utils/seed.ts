import { prisma } from '@/lib/prisma';
import { VotingSystemData } from '@/types/api';

const DEFAULT_VOTING_SYSTEMS: VotingSystemData[] = [
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

export async function seedVotingSystems() {
  try {
    for (const system of DEFAULT_VOTING_SYSTEMS) {
      await prisma.votingSystem.upsert({
        where: { name: system.name },
        update: { values: system.values },
        create: system,
      });
    }
    console.log('Voting systems seeded successfully');
  } catch (error) {
    console.error('Error seeding voting systems:', error);
  }
}