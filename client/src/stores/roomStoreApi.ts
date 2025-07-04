import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Room, Story, User, VotingSystem, VOTING_SYSTEMS, RoomStatus } from '../types';
import { apiClient } from '../lib/api-client';

interface RoomState {
  currentRoom: Room | null;
  roomStatus: RoomStatus;
  currentUser: User | null;
  
  // Room management
  createRoom: (name: string, hostUser: User, votingSystem?: VotingSystem) => Promise<Room>;
  joinRoom: (roomId: string, user: User) => Promise<void>;
  leaveRoom: () => void;
  updateRoom: (updates: Partial<Room>) => Promise<void>;
  
  // User management
  addUser: (user: User) => void;
  removeUser: (userId: string) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  simulateUserJoin: (user: User) => void;
  setCurrentUser: (user: User) => void;
  
  // Story management
  addStory: (story: Omit<Story, 'id' | 'createdAt'>) => Promise<void>;
  addStoryFromWebRTC: (story: Story) => void;
  updateStory: (storyId: string, updates: Partial<Story>) => Promise<void>;
  removeStory: (storyId: string) => Promise<void>;
  setCurrentStory: (storyId: string) => Promise<void>;
  
  // Voting management
  castVote: (userId: string, vote: string) => Promise<void>;
  revealVotes: () => Promise<void>;
  clearVotes: () => Promise<void>;
  setRoomStatus: (status: RoomStatus) => void;
  
  // Data refresh
  refreshRoom: () => Promise<void>;
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      currentRoom: null,
      roomStatus: 'waiting',
      currentUser: null,
      
      createRoom: async (name: string, hostUser: User, votingSystem = VOTING_SYSTEMS[0]) => {
        try {
          const response = await apiClient.createRoom({
            name,
            hostName: hostUser.name,
            votingSystem: votingSystem.name
          });

          if (response.success && response.data) {
            const room = response.data as Room;
            const host = room.users.find((u: User) => u.isHost);
            
            set({ 
              currentRoom: room, 
              roomStatus: 'waiting',
              currentUser: host 
            });
            
            return room;
          } else {
            throw new Error(response.error || 'Failed to create room');
          }
        } catch (error) {
          console.error('Error creating room:', error);
          throw error;
        }
      },

      // Simulate other users joining the room (for demo purposes)
      simulateUserJoin: (user: User) => {
        const { addUser } = get();
        addUser(user);
      },
      
      joinRoom: async (roomId: string, user: User) => {
        try {
          const normalizedRoomId = roomId.toUpperCase().trim();
          
          const response = await apiClient.joinRoom(normalizedRoomId, user.name);
          
          if (response.success && response.data) {
            const { room, user: joinedUser } = response.data as { room: Room; user: User };
            
            set({ 
              currentRoom: room, 
              roomStatus: 'waiting',
              currentUser: joinedUser 
            });
          } else {
            throw new Error(response.error || 'Failed to join room');
          }
        } catch (error) {
          console.error('Error joining room:', error);
          throw error;
        }
      },
      
      leaveRoom: () => {
        set({ currentRoom: null, roomStatus: 'waiting', currentUser: null });
      },
      
      updateRoom: async (updates: Partial<Room>) => {
        const currentRoom = get().currentRoom;
        if (currentRoom) {
          try {
            const response = await apiClient.updateRoom(currentRoom.roomCode, updates);
            
            if (response.success && response.data) {
              set({ currentRoom: response.data as Room });
            }
          } catch (error) {
            console.error('Error updating room:', error);
            // Update local state anyway for optimistic updates
            set({
              currentRoom: { ...currentRoom, ...updates }
            });
          }
        }
      },
      
      addUser: (user: User) => {
        const currentRoom = get().currentRoom;
        if (currentRoom) {
          set({
            currentRoom: {
              ...currentRoom,
              users: [...currentRoom.users, user]
            }
          });
        }
      },
      
      removeUser: async (userId: string) => {
        try {
          await apiClient.removeUser(userId);
          
          const currentRoom = get().currentRoom;
          if (currentRoom) {
            set({
              currentRoom: {
                ...currentRoom,
                users: currentRoom.users.filter(u => u.id !== userId)
              }
            });
          }
        } catch (error) {
          console.error('Error removing user:', error);
        }
      },
      
      updateUser: async (userId: string, updates: Partial<User>) => {
        try {
          await apiClient.updateUser(userId, updates);
          
          const currentRoom = get().currentRoom;
          if (currentRoom) {
            set({
              currentRoom: {
                ...currentRoom,
                users: currentRoom.users.map(u => 
                  u.id === userId ? { ...u, ...updates } : u
                )
              }
            });
          }
        } catch (error) {
          console.error('Error updating user:', error);
        }
      },
      
      setCurrentUser: (user: User) => {
        set({ currentUser: user });
      },
      
      addStory: async (story: Omit<Story, 'id' | 'createdAt'>) => {
        const currentRoom = get().currentRoom;
        if (currentRoom) {
          try {
            const response = await apiClient.createStory(currentRoom.roomCode, story);
            
            if (response.success && response.data) {
              const newStory = response.data as Story;
              
              set({
                currentRoom: {
                  ...currentRoom,
                  stories: [...currentRoom.stories, newStory]
                }
              });
            }
          } catch (error) {
            console.error('Error adding story:', error);
          }
        }
      },
      
      addStoryFromWebRTC: (story: Story) => {
        const currentRoom = get().currentRoom;
        if (currentRoom) {
          // Check if story already exists to avoid duplicates
          const storyExists = currentRoom.stories.some(s => s.id === story.id);
          if (!storyExists) {
            set({
              currentRoom: {
                ...currentRoom,
                stories: [...currentRoom.stories, story]
              }
            });
          }
        }
      },
      
      updateStory: async (storyId: string, updates: Partial<Story>) => {
        try {
          await apiClient.updateStory(storyId, updates);
          
          const currentRoom = get().currentRoom;
          if (currentRoom) {
            set({
              currentRoom: {
                ...currentRoom,
                stories: currentRoom.stories.map(s =>
                  s.id === storyId ? { ...s, ...updates } : s
                )
              }
            });
          }
        } catch (error) {
          console.error('Error updating story:', error);
        }
      },
      
      removeStory: async (storyId: string) => {
        try {
          await apiClient.deleteStory(storyId);
          
          const currentRoom = get().currentRoom;
          if (currentRoom) {
            set({
              currentRoom: {
                ...currentRoom,
                stories: currentRoom.stories.filter(s => s.id !== storyId)
              }
            });
          }
        } catch (error) {
          console.error('Error removing story:', error);
        }
      },
      
      setCurrentStory: async (storyId: string) => {
        try {
          await apiClient.updateStory(storyId, { isActive: true });
          
          const currentRoom = get().currentRoom;
          if (currentRoom) {
            const updatedRoom = {
              ...currentRoom,
              currentStoryId: storyId,
              stories: currentRoom.stories.map(s => ({
                ...s,
                isActive: s.id === storyId
              }))
            };
            
            set({
              currentRoom: updatedRoom,
              roomStatus: 'voting'
            });
          }
        } catch (error) {
          console.error('Error setting current story:', error);
        }
      },
      
      castVote: async (userId: string, vote: string) => {
        try {
          await apiClient.castVote(userId, vote);
          
          const currentRoom = get().currentRoom;
          if (currentRoom && !currentRoom.isVotingRevealed) {
            set({
              currentRoom: {
                ...currentRoom,
                users: currentRoom.users.map(u =>
                  u.id === userId ? { ...u, vote, hasVoted: true } : u
                )
              }
            });
          }
        } catch (error) {
          console.error('Error casting vote:', error);
        }
      },
      
      revealVotes: async () => {
        const currentRoom = get().currentRoom;
        if (currentRoom) {
          try {
            await apiClient.revealVotes(currentRoom.roomCode);
            
            set({
              currentRoom: {
                ...currentRoom,
                isVotingRevealed: true
              },
              roomStatus: 'revealed'
            });
          } catch (error) {
            console.error('Error revealing votes:', error);
          }
        }
      },
      
      clearVotes: async () => {
        const currentRoom = get().currentRoom;
        if (currentRoom) {
          try {
            await apiClient.clearVotes(currentRoom.roomCode);
            
            set({
              currentRoom: {
                ...currentRoom,
                isVotingRevealed: false,
                users: currentRoom.users.map(u => ({
                  ...u,
                  vote: undefined,
                  hasVoted: false
                }))
              },
              roomStatus: 'voting'
            });
          } catch (error) {
            console.error('Error clearing votes:', error);
          }
        }
      },
      
      setRoomStatus: (status: RoomStatus) => {
        set({ roomStatus: status });
      },
      
      refreshRoom: async () => {
        const currentRoom = get().currentRoom;
        if (currentRoom) {
          try {
            const response = await apiClient.getRoom(currentRoom.roomCode);
            
            if (response.success && response.data) {
              set({ currentRoom: response.data as Room });
            }
          } catch (error) {
            console.error('Error refreshing room:', error);
          }
        }
      },
    }),
    {
      name: 'room-storage',
      partialize: (state) => ({ 
        currentUser: state.currentUser,
        // Don't persist room data as it should come from server
      }),
    }
  )
);