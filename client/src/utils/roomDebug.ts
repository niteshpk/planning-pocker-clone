import { Room } from '../types';

export const debugRoomStorage = (): void => {
  try {
    const storedRooms = localStorage.getItem('demo-rooms');
    const rooms: Room[] = storedRooms ? JSON.parse(storedRooms) : [];
    
    console.group('🔍 Room Storage Debug');
    console.log(`Total stored rooms: ${rooms.length}`);
    console.log('Room codes:', rooms.map(r => r.id));
    console.log('Room details:', rooms.map(r => ({
      id: r.id,
      name: r.name,
      userCount: r.users.length,
      createdAt: r.createdAt
    })));
    console.groupEnd();
    
    // Also log to help users
    if (rooms.length === 0) {
      console.warn('No rooms found in storage. Make sure the room was created in the same browser and storage wasn\'t cleared.');
    }
  } catch (error) {
    console.error('Error debugging room storage:', error);
  }
};

export const clearOldRooms = (): void => {
  try {
    const storedRooms = localStorage.getItem('demo-rooms');
    const rooms: Room[] = storedRooms ? JSON.parse(storedRooms) : [];
    
    // Remove rooms older than 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRooms = rooms.filter(room => new Date(room.createdAt) > oneDayAgo);
    
    if (recentRooms.length !== rooms.length) {
      localStorage.setItem('demo-rooms', JSON.stringify(recentRooms));
      console.log(`Cleaned up ${rooms.length - recentRooms.length} old rooms`);
    }
  } catch (error) {
    console.error('Error cleaning up old rooms:', error);
  }
};

export const getAllStoredRooms = (): Room[] => {
  try {
    const storedRooms = localStorage.getItem('demo-rooms');
    return storedRooms ? JSON.parse(storedRooms) : [];
  } catch (error) {
    console.error('Error getting stored rooms:', error);
    return [];
  }
};