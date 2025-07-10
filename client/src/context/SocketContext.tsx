import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as any).Pusher = Pusher;

type Member = {
  id: string;
  name: string;
  is_host?: boolean;
  [key: string]: any;
};

interface SocketContextValue {
  echo: Echo | null;
  members: Member[];
}

const SocketContext = createContext<SocketContextValue>({
  echo: null,
  members: [],
});

interface SocketProviderProps {
  roomId: string;
  participantId: string | number;
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  roomId,
  participantId,
  children,
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const echoRef = useRef<Echo | null>(null);

  useEffect(() => {
    if (!roomId || !participantId) return;

    const echo = new Echo({
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

    echoRef.current = echo;

    const presenceChannel = echo.join(`room.${roomId}`)
      .here((users: Member[]) => {
        console.log('📥 Current members:', users);
        setMembers(users);
      })
      .joining((user: Member) => {
        console.log('➕ User joined:', user);
        setMembers(prev => [...prev, user]);
      })
      .leaving((user: Member) => {
        console.log('➖ User left:', user);
        setMembers(prev => prev.filter(u => u.id !== user.id));
      })
      .listen('.participant.joined', (data: any) => {
        console.log('📢 participant.joined event received:', data);
      })
      .listen('.story.created', (data: any) => {
        console.log('📝 story.created event received:', data);
      });

    return () => {
      echo.leave(`room.${roomId}`);
      console.log('👋 Left room', roomId);
    };
  }, [roomId, participantId]);

  return (
    <SocketContext.Provider value={{ echo: echoRef.current, members }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
