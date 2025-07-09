export interface User {
  id: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
  vote?: string;
  hasVoted: boolean;
}

export interface Story {
  id: string;
  title: string;
  description?: string;
  estimate?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Room {
  id: string;
  roomCode: string; // Added roomCode property
  name: string;
  hostId: string;
  users: User[];
  stories: Story[];
  currentStoryId?: string;
  votingSystem: VotingSystem;
  votingSystemName?: string; // Added for API compatibility
  isVotingRevealed: boolean;
  createdAt: Date;
}

export interface VotingSystem {
  name: string;
  values: string[];
}

export interface VoteResult {
  userId: string;
  vote: string;
  timestamp: Date;
}





export const VOTING_SYSTEMS: VotingSystem[] = [
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

export type RoomStatus = 'waiting' | 'voting' | 'revealed' | 'discussion';