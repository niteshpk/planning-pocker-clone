import React from 'react';
import { Crown, Wifi, WifiOff } from 'lucide-react';
import { User } from '../types';
import { getAvatarColor, getInitials } from '../utils/helpers';

interface UserAvatarProps {
  user: User;
  showVoteStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  showVoteStatus = false,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} 
          ${getAvatarColor(user.id)}
          rounded-full flex items-center justify-center text-white font-medium
          ${!user.isConnected ? 'opacity-50' : ''}
        `}
      >
        {getInitials(user.name)}
      </div>
      
      {/* Host crown */}
      {user.isHost && (
        <Crown 
          className={`absolute -top-1 -right-1 ${iconSizes[size]} text-yellow-500 fill-current`}
        />
      )}
      
      {/* Connection status */}
      <div className="absolute -bottom-1 -right-1">
        {user.isConnected ? (
          <Wifi className={`${iconSizes[size]} text-green-500`} />
        ) : (
          <WifiOff className={`${iconSizes[size]} text-red-500`} />
        )}
      </div>
      
      {/* Vote status indicator */}
      {showVoteStatus && (
        <div className="absolute -top-1 -left-1">
          {user.hasVoted ? (
            <div className={`w-3 h-3 bg-green-500 rounded-full border-2 border-white`} />
          ) : (
            <div className={`w-3 h-3 bg-gray-300 rounded-full border-2 border-white`} />
          )}
        </div>
      )}
    </div>
  );
};

interface UserListProps {
  users: User[];
  showVoteStatus?: boolean;
  className?: string;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  showVoteStatus = false,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {users.map((user) => (
        <div key={user.id} className="flex items-center space-x-3">
          <UserAvatar user={user} showVoteStatus={showVoteStatus} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name}
              {user.isHost && (
                <span className="ml-2 text-xs text-yellow-600 font-normal">
                  (Host)
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              {user.isConnected ? 'Connected' : 'Disconnected'}
              {showVoteStatus && (
                <>
                  {' • '}
                  {user.hasVoted ? 'Voted' : 'Not voted'}
                </>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};