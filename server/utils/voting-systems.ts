import { VotingSystemData } from '@/types/api';

export const VOTING_SYSTEMS: VotingSystemData[] = [
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

export function getVotingSystemByName(name: string): VotingSystemData | undefined {
  return VOTING_SYSTEMS.find(system => system.name === name);
}

export function getDefaultVotingSystem(): VotingSystemData {
  return VOTING_SYSTEMS[0]; // Fibonacci
}