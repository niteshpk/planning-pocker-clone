import React, { useState } from 'react';
import { Plus, Users, Zap, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useRoomStore } from '../stores/roomStore';
import { generateUserId, validateRoomCode } from '../utils/helpers';

import { VOTING_SYSTEMS } from '../types';

interface LandingPageProps {
  onRoomCreated: () => void;
  onRoomJoined: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onRoomCreated,
  onRoomJoined,
}) => {
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [formData, setFormData] = useState({
    userName: '',
    roomName: '',
    roomCode: '',
    votingSystem: VOTING_SYSTEMS[0].name,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { setCurrentUser } = useRoomStore();
  const { createRoom, joinRoom } = useRoomStore();



  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'Name is required';
    }

    if (mode === 'create' && !formData.roomName.trim()) {
      newErrors.roomName = 'Room name is required';
    }

    if (mode === 'join') {
      if (!formData.roomCode.trim()) {
        newErrors.roomCode = 'Room code is required';
      } else if (!validateRoomCode(formData.roomCode.toUpperCase())) {
        newErrors.roomCode = 'Invalid room code format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const user = {
        id: generateUserId(),
        name: formData.userName.trim(),
        isHost: mode === 'create',
        isConnected: true,
        hasVoted: false,
      };

      setCurrentUser(user);

      if (mode === 'create') {
        const selectedVotingSystem = VOTING_SYSTEMS.find(
          vs => vs.name === formData.votingSystem
        ) || VOTING_SYSTEMS[0];
        
        await createRoom(formData.roomName.trim(), user, selectedVotingSystem);
        onRoomCreated();
      } else {
        try {
          await joinRoom(formData.roomCode.toUpperCase(), user);
          onRoomJoined();
        } catch (joinError: any) {
          console.error('Room join error:', joinError);
          
          // Extract just the first line of the error message for better UX
          const errorLines = joinError.message.split('\n');
          const shortError = errorLines[0] || 'Failed to join room. Please check the room code.';
          
          setErrors({ roomCode: shortError });
          setLoading(false);
          return;
        }

      }
    } catch (error) {
      console.error('Error creating/joining room:', error);
      setErrors({ general: 'Failed to create/join room. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMode(null);
    setFormData({
      userName: '',
      roomName: '',
      roomCode: '',
      votingSystem: VOTING_SYSTEMS[0].name,
    });
    setErrors({});
  };

  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Planning Poker
            </h1>
            <p className="text-gray-600">
              Estimate user stories with your team in real-time
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => setMode('create')}
              className="w-full"
              size="lg"
              icon={Plus}
            >
              Create New Room
            </Button>
            
            <Button
              onClick={() => setMode('join')}
              variant="secondary"
              className="w-full"
              size="lg"
              icon={Users}
            >
              Join Existing Room
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Real-time collaboration • Persistent data storage • Team estimation
            </p>
            

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Create Room' : 'Join Room'}
            </h2>
            <p className="text-gray-600 mt-1">
              {mode === 'create' 
                ? 'Set up a new planning session'
                : 'Enter room details to join'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your Name"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              placeholder="Enter your name"
              error={errors.userName}
              required
            />

            {mode === 'create' ? (
              <>
                <Input
                  label="Room Name"
                  value={formData.roomName}
                  onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                  placeholder="Enter room name"
                  error={errors.roomName}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voting System
                  </label>
                  <select
                    value={formData.votingSystem}
                    onChange={(e) => setFormData({ ...formData, votingSystem: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {VOTING_SYSTEMS.map((system) => (
                      <option key={system.name} value={system.name}>
                        {system.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <Input
                label="Room Code"
                value={formData.roomCode}
                onChange={(e) => setFormData({ ...formData, roomCode: e.target.value.toUpperCase() })}
                placeholder="Enter room code"
                error={errors.roomCode}
                required
              />
            )}

            {errors.general && (
              <div className="text-sm text-red-600 text-center">
                {errors.general}
              </div>
            )}

            {mode === 'join' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Can't find the room?</p>
                    <ul className="mt-1 text-xs space-y-1">
                      <li>• Make sure the room code is correct</li>
                      <li>• Ask the room creator for the correct code</li>
                      <li>• The room must be active and accessible</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
              >
                {mode === 'create' ? 'Create Room' : 'Join Room'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};