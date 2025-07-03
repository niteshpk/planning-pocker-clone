import SimplePeer from 'simple-peer';
import { WebRTCMessage, PeerConnection } from '../types';

export class WebRTCManager {
  private peers: Map<string, PeerConnection> = new Map();
  private userId: string = '';
  private onMessage: ((message: WebRTCMessage) => void) | null = null;
  private onPeerConnected: ((peerId: string) => void) | null = null;
  private onPeerDisconnected: ((peerId: string) => void) | null = null;

  constructor(userId: string, _isHost: boolean = false) {
    this.userId = userId;
  }

  setMessageHandler(handler: (message: WebRTCMessage) => void) {
    this.onMessage = handler;
  }

  setPeerConnectedHandler(handler: (peerId: string) => void) {
    this.onPeerConnected = handler;
  }

  setPeerDisconnectedHandler(handler: (peerId: string) => void) {
    this.onPeerDisconnected = handler;
  }

  async createRoom(roomId: string): Promise<void> {
    // Host doesn't need to connect to anyone initially
    console.log(`Created room ${roomId} as host`);
  }

  async joinRoom(roomId: string, hostSignal?: any): Promise<void> {
    console.log(`Joining room ${roomId}`);
    
    if (hostSignal) {
      await this.connectToPeer('host', hostSignal, false);
    }
  }

  async connectToPeer(peerId: string, signal?: any, initiator: boolean = true): Promise<SimplePeer.SignalData | void> {
    return new Promise((resolve, reject) => {
      try {
        const peer = new SimplePeer({
          initiator,
          trickle: false,
        });

        const peerConnection: PeerConnection = {
          id: peerId,
          peer,
          isConnected: false,
        };

        peer.on('signal', (data) => {
          console.log(`Signal generated for peer ${peerId}:`, data);
          resolve(data);
        });

        peer.on('connect', () => {
          console.log(`Connected to peer ${peerId}`);
          peerConnection.isConnected = true;
          this.peers.set(peerId, peerConnection);
          this.onPeerConnected?.(peerId);
        });

        peer.on('data', (data) => {
          try {
            const message: WebRTCMessage = JSON.parse(data.toString());
            console.log(`Received message from ${peerId}:`, message);
            this.onMessage?.(message);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });

        peer.on('close', () => {
          console.log(`Peer ${peerId} disconnected`);
          this.peers.delete(peerId);
          this.onPeerDisconnected?.(peerId);
        });

        peer.on('error', (error) => {
          console.error(`Peer ${peerId} error:`, error);
          reject(error);
        });

        if (signal) {
          peer.signal(signal);
        }

        this.peers.set(peerId, peerConnection);
      } catch (error) {
        reject(error);
      }
    });
  }

  sendMessage(message: Omit<WebRTCMessage, 'timestamp' | 'senderId'>): void {
    const fullMessage: WebRTCMessage = {
      ...message,
      timestamp: new Date(),
      senderId: this.userId,
    };

    const messageString = JSON.stringify(fullMessage);

    this.peers.forEach((peerConnection, peerId) => {
      if (peerConnection.isConnected) {
        try {
          peerConnection.peer.send(messageString);
        } catch (error) {
          console.error(`Error sending message to peer ${peerId}:`, error);
        }
      }
    });
  }

  broadcastToRoom(message: Omit<WebRTCMessage, 'timestamp' | 'senderId'>): void {
    this.sendMessage(message);
  }

  getConnectedPeers(): string[] {
    return Array.from(this.peers.entries())
      .filter(([_, connection]) => connection.isConnected)
      .map(([peerId]) => peerId);
  }

  disconnect(): void {
    this.peers.forEach((peerConnection) => {
      if (peerConnection.peer) {
        peerConnection.peer.destroy();
      }
    });
    this.peers.clear();
  }

  // Simplified signaling for demo purposes
  // In a real app, you'd use a signaling server
  generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

// Singleton instance for the app
let webRTCManager: WebRTCManager | null = null;

export const getWebRTCManager = (userId?: string, isHost?: boolean): WebRTCManager => {
  if (!webRTCManager && userId) {
    webRTCManager = new WebRTCManager(userId, isHost);
  }
  return webRTCManager!;
};

export const resetWebRTCManager = (): void => {
  if (webRTCManager) {
    webRTCManager.disconnect();
    webRTCManager = null;
  }
};