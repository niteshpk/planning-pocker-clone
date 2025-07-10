import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as any).Pusher = Pusher;

export const createEcho = (participantId: number | string) => {
  return new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_KEY,
    cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'mt1',
    forceTLS: true,
    encrypted: true,
    authEndpoint: 'http://localhost:3000/broadcasting/auth',
    auth: {
      params: {
        participant_id: participantId,
      },
    },
  });
};
