import { create } from 'zustand';
import { User } from '../types';

interface UserState {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()((set, get) => ({
  currentUser: null,
  
  setCurrentUser: (user: User) => {
    set({ currentUser: user });
  },
  
  updateUser: (updates: Partial<User>) => {
    const currentUser = get().currentUser;
    if (currentUser) {
      set({ 
        currentUser: { 
          ...currentUser, 
          ...updates 
        } 
      });
    }
  },
  
  clearUser: () => {
    set({ currentUser: null });
  },
}));