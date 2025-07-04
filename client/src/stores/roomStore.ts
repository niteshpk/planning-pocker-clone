import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Room, Story, User, VotingSystem, VOTING_SYSTEMS, RoomStatus } from '../types';

interface RoomState {
  currentRoom: Room | null;
  roomStatus: RoomStatus;
  
  // Room management
  createRoom: (name: string, hostUser: User, votingSystem?: VotingSystem) => Room;
  joinRoom: (roomId: string, user: User) => void;
  leaveRoom: () => void;
  updateRoom: (updates: Partial<Room>) => void;
  
  // User management
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  simulateUserJoin: (user: User) => void;
  
  // Story management
  addStory: (story: Omit<Story, 'id' | 'createdAt'>) => void;
  addStoryFromWebRTC: (story: Story) => void;
  updateStory: (storyId: string, updates: Partial<Story>) => void;
  removeStory: (storyId: string) => void;
  setCurrentStory: (storyId: string) => void;
  
  // Voting management
  castVote: (userId: string, vote: string) => void;
  revealVotes: () => void;
  clearVotes: () => void;
  setRoomStatus: (status: RoomStatus) => void;
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      currentRoom: null,
      roomStatus: 'waiting',
      
      createRoom: (name: string, hostUser: User, votingSystem = VOTING_SYSTEMS[0]) => {
        // Generate a unique room ID
        let roomId: string;
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
          roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
          attempts++;
          
          // Check if room ID is unique
          try {
            const storedRooms = localStorage.getItem('demo-rooms');
            const rooms: Room[] = storedRooms ? JSON.parse(storedRooms) : [];
            const isUnique = !rooms.some(room => room.id === roomId);
            if (isUnique) break;
          } catch (error) {
            console.error('Error checking room ID uniqueness:', error);
            break; // Assume unique if we can't check
          }
        } while (attempts < maxAttempts);
        
        if (attempts >= maxAttempts) {
          throw new Error('Failed to generate unique room ID. Please try again.');
        }
        
        console.log(`Creating room with ID: ${roomId}`);
        
        const room: Room = {
          id: roomId,
          roomCode: roomId, // Use the same ID as room code for localStorage version
          name,
          hostId: hostUser.id,
          users: [{ ...hostUser, isHost: true }],
          stories: [],
          votingSystem,
          isVotingRevealed: false,
          createdAt: new Date(),
        };
        
        // Store room in localStorage for demo purposes
        try {
          const storedRooms = localStorage.getItem('demo-rooms');
          const rooms: Room[] = storedRooms ? JSON.parse(storedRooms) : [];
          
          // Add new room to stored rooms
          rooms.push(room);
          
          // Keep only the last 20 rooms to avoid localStorage bloat (increased from 10)
          const recentRooms = rooms.slice(-20);
          localStorage.setItem('demo-rooms', JSON.stringify(recentRooms));
          
          console.log(`Room ${roomId} created and stored. Total rooms: ${recentRooms.length}`);
        } catch (error) {
          console.error('Error storing room:', error);
          throw new Error('Failed to store room. Please try again.');
        }
        
        set({ currentRoom: room, roomStatus: 'waiting' });
        return room;
      },

      // Simulate other users joining the room (for demo purposes)
      simulateUserJoin: (user: User) => {
        const { addUser } = get();
        addUser(user);
      },
      
      joinRoom: (roomId: string, user: User) => {
        const currentRoom = get().currentRoom;
        
        // Normalize room ID to uppercase
        const normalizedRoomId = roomId.toUpperCase().trim();
        
        console.log(`Attempting to join room: ${normalizedRoomId}`);
        
        // If there's already a room with the same ID, add user to it
        if (currentRoom && currentRoom.id === normalizedRoomId) {
          // Check if user is already in the room
          const userExists = currentRoom.users.some(u => u.id === user.id);
          if (!userExists) {
            const updatedRoom = {
              ...currentRoom,
              users: [...currentRoom.users, { ...user, isHost: false }] // Joining users are never hosts
            };
            set({ currentRoom: updatedRoom });
            
            // Update stored room in localStorage
            try {
              const storedRooms = localStorage.getItem('demo-rooms');
              const rooms: Room[] = storedRooms ? JSON.parse(storedRooms) : [];
              const updatedRooms = rooms.map(room => 
                room.id === normalizedRoomId ? updatedRoom : room
              );
              localStorage.setItem('demo-rooms', JSON.stringify(updatedRooms));
            } catch (error) {
              console.error('Error updating stored room:', error);
            }
          }
          console.log(`Successfully joined existing room: ${normalizedRoomId}`);
          return; // Successfully joined existing room
        }
        
        // For demo purposes, we'll check if there are any rooms stored in localStorage
        // that match the room code. In a real app, this would be a server call.
        try {
          const storedRooms = localStorage.getItem('demo-rooms');
          console.log('Stored rooms:', storedRooms);
          
          const rooms: Room[] = storedRooms ? JSON.parse(storedRooms) : [];
          console.log(`Looking for room ${normalizedRoomId} in ${rooms.length} stored rooms:`, rooms.map(r => r.id));
          
          // Try exact match first
          let existingRoom = rooms.find(room => room.id === normalizedRoomId);
          
          // If not found, try case-insensitive search
          if (!existingRoom) {
            existingRoom = rooms.find(room => room.id.toUpperCase() === normalizedRoomId);
          }
          
          if (existingRoom) {
            console.log(`Found room: ${existingRoom.id}`);
            
            // Check if user is already in the room
            const userExists = existingRoom.users.some(u => u.id === user.id || u.name === user.name);
            if (!userExists) {
              // Add user to existing room
              const updatedRoom = {
                ...existingRoom,
                users: [...existingRoom.users, { ...user, isHost: false }]
              };
              
              // Update the room in localStorage
              const updatedRooms = rooms.map(room => 
                room.id === existingRoom!.id ? updatedRoom : room
              );
              localStorage.setItem('demo-rooms', JSON.stringify(updatedRooms));
              
              set({ currentRoom: updatedRoom, roomStatus: 'waiting' });
              console.log(`Successfully joined room: ${normalizedRoomId}`);
              return; // Successfully joined existing room
            } else {
              // User already in room, just set as current room
              set({ currentRoom: existingRoom, roomStatus: 'waiting' });
              console.log(`User already in room: ${normalizedRoomId}`);
              return;
            }
          } else {
            console.log(`Room ${normalizedRoomId} not found in stored rooms`);
          }
        } catch (error) {
          console.error('Error checking for existing rooms:', error);
        }
        
        // If no existing room found, provide detailed error message
        const errorMessage = `Room with code "${normalizedRoomId}" not found. This could happen if:
• The room code was entered incorrectly
• The room was created in a different browser or incognito window
• The room was created more than 10 sessions ago (demo limitation)
• Local storage was cleared

Please verify the room code with the room creator and try again.`;
        
        console.error(errorMessage);
        throw new Error(errorMessage);
      },
      
      leaveRoom: () => {
        set({ currentRoom: null, roomStatus: 'waiting' });
      },
      
      updateRoom: (updates: Partial<Room>) => {
        const currentRoom = get().currentRoom;
        if (currentRoom) {
          set({
            currentRoom: { ...currentRoom, ...updates }
          });
        }
      },
      
      addUser: (user: User) => {
        const currentRoom = get().currentRoom;
        if (currentRoom) {
          const updatedRoom = {
            ...currentRoom,
            users: [...currentRoom.users, user]
          };
          
          set({ currentRoom: updatedRoom });
          
          // Update stored room in localStorage
          try {
            const storedRooms = localStorage.getItem('demo-rooms');
            const rooms: Room[] = storedRooms ? JSON.parse(storedRooms) : [];
            const updatedRooms = rooms.map(room => 
              room.id === currentRoom.id ? updatedRoom : room
            );
            localStorage.setItem('demo-rooms', JSON.stringify(updatedRooms));
          } catch (error) {
            console.error('Error updating stored room:', error);
          }
        }
      },
      
      removeUser: (userId: string) => {
        const currentRoom = get().currentRoom;
        if (currentRoom) {
          set({
            currentRoom: {
              ...currentRoom,
              users: currentRoom.users.filter(u => u.id !== userId)
            }
          });
        }
      },
      
      updateUser: (userId: string, updates: Partial<User>) => {
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
      },
      
      addStory: (story: Omit<Story, 'id' | 'createdAt'>) => {
        const currentRoom = get().currentRoom;
        if (currentRoom) {
          const newStory: Story = {
            ...story,
            id: Math.random().toString(36).substring(2, 9),
            createdAt: new Date(),
          };
          
          const updatedRoom = {
            ...currentRoom,
            stories: [...currentRoom.stories, newStory]
          };
          
          set({ currentRoom: updatedRoom });
          
          // Update stored room in localStorage
          try {
            const storedRooms = localStorage.getItem('demo-rooms');
            const rooms: Room[] = storedRooms ? JSON.parse(storedRooms) : [];
            const updatedRooms = rooms.map(room => 
              room.id === currentRoom.id ? updatedRoom : room
            );
            localStorage.setItem('demo-rooms', JSON.stringify(updatedRooms));
          } catch (error) {
            console.error('Error updating stored room:', error);
          }
        }
      },
      
      addStoryFromWebRTC: (story: Story) => {
        const currentRoom = get().currentRoom;
        if (currentRoom) {
          // Check if story already exists to avoid duplicates
          const storyExists = currentRoom.stories.some(s => s.id === story.id);
          if (!storyExists) {
            const updatedRoom = {
              ...currentRoom,
              stories: [...currentRoom.stories, story]
            };
            
            set({ currentRoom: updatedRoom });
            
            // Update stored room in localStorage
            try {
              const storedRooms = localStorage.getItem('demo-rooms');
              const rooms: Room[] = storedRooms ? JSON.parse(storedRooms) : [];
              const updatedRooms = rooms.map(room => 
                room.id === currentRoom.id ? updatedRoom : room
              );
              localStorage.setItem('demo-rooms', JSON.stringify(updatedRooms));
            } catch (error) {
              console.error('Error updating stored room:', error);
            }
          }
        }
      },
      
      updateStory: (storyId: string, updates: Partial<Story>) => {
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
      },
      
      removeStory: (storyId: string) => {
        const currentRoom = get().currentRoom;
        if (currentRoom) {
          set({
            currentRoom: {
              ...currentRoom,
              stories: currentRoom.stories.filter(s => s.id !== storyId)
            }
          });
        }
      },
      
      setCurrentStory: (storyId: string) => {
        const currentRoom = get().currentRoom;
        if (currentRoom) {
          set({
            currentRoom: {
              ...currentRoom,
              currentStoryId: storyId,
              stories: currentRoom.stories.map(s => ({
                ...s,
                isActive: s.id === storyId
              }))
            },
            roomStatus: 'voting'
          });
        }
      },
      
      castVote: (userId: string, vote: string) => {
        const currentRoom = get().currentRoom;
        if (currentRoom && !currentRoom.isVotingRevealed) {
          const updatedRoom = {
            ...currentRoom,
            users: currentRoom.users.map(u =>
              u.id === userId ? { ...u, vote, hasVoted: true } : u
            )
          };
          
          set({ currentRoom: updatedRoom });
          
          // Update stored room in localStorage
          try {
            const storedRooms = localStorage.getItem('demo-rooms');
            const rooms: Room[] = storedRooms ? JSON.parse(storedRooms) : [];
            const updatedRooms = rooms.map(room => 
              room.id === currentRoom.id ? updatedRoom : room
            );
            localStorage.setItem('demo-rooms', JSON.stringify(updatedRooms));
          } catch (error) {
            console.error('Error updating stored room:', error);
          }
        }
      },
      
      revealVotes: () => {
        const currentRoom = get().currentRoom;
        if (currentRoom) {
          set({
            currentRoom: {
              ...currentRoom,
              isVotingRevealed: true
            },
            roomStatus: 'revealed'
          });
        }
      },
      
      clearVotes: () => {
        const currentRoom = get().currentRoom;
        if (currentRoom) {
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
        }
      },
      
      setRoomStatus: (status: RoomStatus) => {
        set({ roomStatus: status });
      },
    }),
    {
      name: 'room-storage',
    }
  )
);