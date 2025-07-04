// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Room types
export interface CreateRoomRequest {
  name: string;
  hostName: string;
  votingSystem?: string;
}

export interface JoinRoomRequest {
  roomCode: string;
  userName: string;
}

export interface UpdateRoomRequest {
  name?: string;
  isVotingRevealed?: boolean;
  currentStoryId?: string;
  votingSystemName?: string;
}

// User types
export interface UpdateUserRequest {
  name?: string;
  isConnected?: boolean;
  vote?: string;
  hasVoted?: boolean;
}

// Story types
export interface CreateStoryRequest {
  title: string;
  description?: string;
}

export interface UpdateStoryRequest {
  title?: string;
  description?: string;
  estimate?: string;
  isActive?: boolean;
}

// Vote types
export interface CastVoteRequest {
  vote: string;
}

// Voting System types
export interface VotingSystemData {
  name: string;
  values: string[];
}

// Room status type
export type RoomStatus = 'waiting' | 'voting' | 'revealed' | 'discussion';