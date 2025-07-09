import { useCallback } from 'react';

// Simplified WebRTC hook without broadcasting functionality
export const useWebRTC = () => {
  // Placeholder functions that don't actually broadcast
  const broadcastVote = useCallback((_vote: string) => {
    console.log('Broadcasting disabled - vote not sent');
  }, []);

  const broadcastRevealVotes = useCallback(() => {
    console.log('Broadcasting disabled - reveal votes not sent');
  }, []);

  const broadcastUserJoined = useCallback((_user: any) => {
    console.log('Broadcasting disabled - user joined not sent');
  }, []);

  const broadcastStoryAdded = useCallback((_story: any) => {
    console.log('Broadcasting disabled - story added not sent');
  }, []);

  const sendMessage = useCallback((_message: any) => {
    console.log('Broadcasting disabled - message not sent');
  }, []);

  return {
    sendMessage,
    broadcastVote,
    broadcastRevealVotes,
    broadcastUserJoined,
    broadcastStoryAdded,
    isConnected: false, // Always false since we're not connecting
  };
};