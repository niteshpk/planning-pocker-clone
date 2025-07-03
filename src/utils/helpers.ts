import { v4 as uuidv4 } from 'uuid';

export const generateUserId = (): string => {
  return uuidv4();
};

export const generateRoomCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const generateStoryId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const validateRoomCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code);
};

export const calculateConsensus = (votes: string[]): { 
  consensus: string | null; 
  hasConsensus: boolean;
  voteCounts: Record<string, number>;
} => {
  const voteCounts: Record<string, number> = {};
  
  votes.forEach(vote => {
    voteCounts[vote] = (voteCounts[vote] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(voteCounts));
  const consensusVotes = Object.entries(voteCounts)
    .filter(([_, count]) => count === maxCount)
    .map(([vote]) => vote);

  return {
    consensus: consensusVotes.length === 1 ? consensusVotes[0] : null,
    hasConsensus: consensusVotes.length === 1 && maxCount === votes.length,
    voteCounts,
  };
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export const getAvatarColor = (userId: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  
  const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};