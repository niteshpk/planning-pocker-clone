// API client for the Planning Poker frontend
// This file should be copied to the client/src/lib/ directory

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Voting Systems
  async getVotingSystems() {
    return this.request('/voting-systems');
  }

  // Rooms
  async createRoom(data: { name: string; hostName: string; votingSystem?: string }) {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRoom(roomCode: string) {
    return this.request(`/rooms/${roomCode}`);
  }

  async updateRoom(roomCode: string, data: any) {
    return this.request(`/rooms/${roomCode}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRoom(roomCode: string) {
    return this.request(`/rooms/${roomCode}`, {
      method: 'DELETE',
    });
  }

  async joinRoom(roomCode: string, userName: string) {
    return this.request(`/rooms/${roomCode}/join`, {
      method: 'POST',
      body: JSON.stringify({ userName }),
    });
  }

  async revealVotes(roomCode: string) {
    return this.request(`/rooms/${roomCode}/reveal-votes`, {
      method: 'POST',
    });
  }

  async clearVotes(roomCode: string) {
    return this.request(`/rooms/${roomCode}/clear-votes`, {
      method: 'POST',
    });
  }

  // Stories
  async createStory(roomCode: string, data: { title: string; description?: string }) {
    return this.request(`/rooms/${roomCode}/stories`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStory(storyId: string, data: any) {
    return this.request(`/stories/${storyId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStory(storyId: string) {
    return this.request(`/stories/${storyId}`, {
      method: 'DELETE',
    });
  }

  // Users
  async updateUser(userId: string, data: any) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async removeUser(userId: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Voting
  async castVote(userId: string, vote: string) {
    return this.request(`/users/${userId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    });
  }

  async clearVote(userId: string) {
    return this.request(`/users/${userId}/vote`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;