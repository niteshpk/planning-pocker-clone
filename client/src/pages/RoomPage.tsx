import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Plus, 
  Eye, 
  RotateCcw, 
  LogOut,
  Users,
  Clock
} from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { VotingDeck } from '../components/VotingCard';
import { UserList } from '../components/UserAvatar';
import { useRoomStore } from '../stores/roomStore';
import { useWebRTC } from '../hooks/useWebRTC';
import { copyToClipboard, calculateConsensus } from '../utils/helpers';
import { Story } from '../types';

interface RoomPageProps {
  onLeaveRoom: () => void;
}

export const RoomPage: React.FC<RoomPageProps> = ({ onLeaveRoom }) => {
  const [showAddStory, setShowAddStory] = useState(false);
  const [newStory, setNewStory] = useState({ title: '', description: '' });
  const [copySuccess, setCopySuccess] = useState(false);

  const { 
    currentRoom, 
    roomStatus,
    currentUser: roomCurrentUser,
    addStory, 
    setCurrentStory, 
    castVote, 
    revealVotes, 
    clearVotes,
    leaveRoom,
    simulateUserJoin
  } = useRoomStore();

  const { 
    broadcastVote, 
    broadcastRevealVotes, 
    broadcastStoryAdded 
  } = useWebRTC();

  const isHost = roomCurrentUser?.isHost || false;
  const currentStory = currentRoom?.stories.find(s => s.isActive);
  const hasVoted = roomCurrentUser?.hasVoted || false;
  const allVoted = currentRoom?.users.every(u => u.hasVoted) || false;

  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const handleCopyRoomCode = async () => {
    if (currentRoom?.id) {
      const success = await copyToClipboard(currentRoom.id);
      setCopySuccess(success);
    }
  };

  const handleAddStory = () => {
    if (newStory.title.trim()) {
      const storyData = {
        title: newStory.title.trim(),
        description: newStory.description.trim(),
        isActive: false,
      };
      
      // Add story locally first
      addStory(storyData);
      
      // Only the host broadcasts new stories
      if (roomCurrentUser?.isHost) {
        // Create the story object for broadcast (this should match what the store creates)
        const newStoryForBroadcast: Story = {
          ...storyData,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date(),
        };
        broadcastStoryAdded(newStoryForBroadcast);
      }
      
      setNewStory({ title: '', description: '' });
      setShowAddStory(false);
    }
  };

  const handleVote = (vote: string) => {
    if (roomCurrentUser && !currentRoom?.isVotingRevealed) {
      castVote(roomCurrentUser.id, vote);
      // Broadcast the vote to all participants
      broadcastVote(vote);
    }
  };

  const handleRevealVotes = () => {
    if (isHost) {
      revealVotes();
      // Broadcast vote reveal to all participants
      broadcastRevealVotes();
    }
  };

  const handleClearVotes = () => {
    if (isHost) {
      clearVotes();
    }
  };

  const handleStartStory = (story: Story) => {
    if (isHost) {
      setCurrentStory(story.id);
    }
  };

  const handleLeaveRoom = async () => {
    await leaveRoom();
    onLeaveRoom();
  };

  const handleSimulateUserJoin = () => {
    const demoUsers = [
      { id: 'demo-user-1', name: 'Alice Johnson', isHost: false, isConnected: true, hasVoted: false },
      { id: 'demo-user-2', name: 'Bob Smith', isHost: false, isConnected: true, hasVoted: false },
      { id: 'demo-user-3', name: 'Carol Davis', isHost: false, isConnected: true, hasVoted: false },
      { id: 'demo-user-4', name: 'David Wilson', isHost: false, isConnected: true, hasVoted: false },
    ];
    
    // Find a user that hasn't joined yet
    const existingUserIds = currentRoom?.users.map(u => u.id) || [];
    const newUser = demoUsers.find(user => !existingUserIds.includes(user.id));
    
    if (newUser) {
      simulateUserJoin(newUser);
    }
  };

  const getVoteResults = () => {
    if (!currentRoom?.isVotingRevealed) return null;
    
    const votes = currentRoom.users
      .filter(u => u.hasVoted && u.vote)
      .map(u => u.vote!);
    
    return calculateConsensus(votes);
  };

  const voteResults = getVoteResults();

  if (!currentRoom || !roomCurrentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Room not found</p>
          <Button onClick={onLeaveRoom}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {currentRoom.name}
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Room:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {currentRoom.roomCode}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Copy}
                  onClick={handleCopyRoomCode}
                  className={copySuccess ? 'text-green-600' : ''}
                >
                  {copySuccess ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* <Button
                variant="ghost"
                size="sm"
                icon={Settings}
                onClick={() => setShowSettings(!showSettings)}
              >
                Settings
              </Button> */}
              <Button
                variant="ghost"
                size="sm"
                icon={LogOut}
                onClick={handleLeaveRoom}
              >
                Leave
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Story */}
            {currentStory ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      {currentStory.title}
                    </h2>
                    {currentStory.description && (
                      <p className="text-gray-600">{currentStory.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Status: {roomStatus}
                    </span>
                  </div>
                </div>

                {/* Voting Results */}
                {currentRoom.isVotingRevealed && voteResults && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Vote Results</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(voteResults.voteCounts).map(([vote, count]) => (
                        <div key={vote} className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{vote}</div>
                          <div className="text-sm text-gray-500">{count} vote{count !== 1 ? 's' : ''}</div>
                        </div>
                      ))}
                    </div>
                    {voteResults.hasConsensus && (
                      <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
                        <span className="text-green-800 font-medium">
                          Consensus reached: {voteResults.consensus}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Host Controls */}
                {isHost && (
                  <div className="flex space-x-2 mb-4">
                    {!currentRoom.isVotingRevealed && allVoted && (
                      <Button onClick={handleRevealVotes} icon={Eye}>
                        Reveal Votes
                      </Button>
                    )}
                    {currentRoom.isVotingRevealed && (
                      <Button onClick={handleClearVotes} icon={RotateCcw}>
                        New Round
                      </Button>
                    )}
                  </div>
                )}

                {/* Voting Status */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Voting Progress</span>
                    <span>{currentRoom.users.filter(u => u.hasVoted).length} / {currentRoom.users.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(currentRoom.users.filter(u => u.hasVoted).length / currentRoom.users.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  No Active Story
                </h2>
                <p className="text-gray-600 mb-4">
                  {isHost ? 'Select a story to start voting' : 'Waiting for host to select a story'}
                </p>
              </div>
            )}

            {/* Voting Cards */}
            {currentStory && !currentRoom.isVotingRevealed && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cast Your Vote
                </h3>
                <VotingDeck
                  values={currentRoom.votingSystem.values}
                  selectedValue={roomCurrentUser.vote}
                  onVote={handleVote}
                  disabled={hasVoted}
                  isRevealed={currentRoom.isVotingRevealed}
                />
                {hasVoted && (
                  <p className="text-center text-green-600 mt-4">
                    ✓ Vote cast! Waiting for others...
                  </p>
                )}
              </div>
            )}

            {/* Stories List */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Stories</h3>
                {isHost && (
                  <Button
                    onClick={() => setShowAddStory(true)}
                    size="sm"
                    icon={Plus}
                  >
                    Add Story
                  </Button>
                )}
              </div>

              {showAddStory && (
                <div className="mb-4 p-4 border rounded-lg">
                  <div className="space-y-3">
                    <Input
                      label="Story Title"
                      value={newStory.title}
                      onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                      placeholder="Enter story title"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (optional)
                      </label>
                      <textarea
                        value={newStory.description}
                        onChange={(e) => setNewStory({ ...newStory, description: e.target.value })}
                        placeholder="Enter story description"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleAddStory} size="sm">
                        Add Story
                      </Button>
                      <Button
                        onClick={() => setShowAddStory(false)}
                        variant="secondary"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {currentRoom.stories.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No stories yet. {isHost ? 'Add some stories to get started!' : ''}
                  </p>
                ) : (
                  currentRoom.stories.map((story) => (
                    <div
                      key={story.id}
                      className={`p-4 border rounded-lg ${
                        story.isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{story.title}</h4>
                          {story.description && (
                            <p className="text-sm text-gray-600 mt-1">{story.description}</p>
                          )}
                          {story.estimate && (
                            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              Estimate: {story.estimate}
                            </span>
                          )}
                        </div>
                        {isHost && !story.isActive && (
                          <Button
                            onClick={() => handleStartStory(story)}
                            size="sm"
                            variant="secondary"
                          >
                            Start Voting
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Participants ({currentRoom.users.length})
                  </h3>
                </div>
                {isHost && currentRoom.users.length < 5 && (
                  <Button
                    onClick={handleSimulateUserJoin}
                    size="sm"
                    variant="secondary"
                    className="text-xs"
                  >
                    + Demo User
                  </Button>
                )}
              </div>
              <UserList 
                users={currentRoom.users} 
                showVoteStatus={!!currentStory && !currentRoom.isVotingRevealed}
              />
            </div>

            {/* Room Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Voting System:</span>
                  <span className="ml-2 font-medium">{currentRoom.votingSystem.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2">{new Date(currentRoom.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2 capitalize">{roomStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};