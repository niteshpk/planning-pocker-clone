import React from 'react';

interface VotingCardProps {
  value: string;
  isSelected?: boolean;
  isRevealed?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const VotingCard: React.FC<VotingCardProps> = ({
  value,
  isSelected = false,
  isRevealed = false,
  onClick,
  disabled = false,
  className = '',
}) => {
  const handleClick = () => {
    if (!disabled && !isRevealed && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`
        card-voting
        w-16 h-24 flex items-center justify-center text-lg font-bold
        ${isSelected ? 'selected' : ''}
        ${isRevealed ? 'revealed' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      {value}
    </div>
  );
};

interface VotingDeckProps {
  values: string[];
  selectedValue?: string;
  onVote: (value: string) => void;
  disabled?: boolean;
  isRevealed?: boolean;
}

export const VotingDeck: React.FC<VotingDeckProps> = ({
  values,
  selectedValue,
  onVote,
  disabled = false,
  isRevealed = false,
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center p-4">
      {values.map((value) => (
        <VotingCard
          key={value}
          value={value}
          isSelected={selectedValue === value}
          isRevealed={isRevealed}
          onClick={() => onVote(value)}
          disabled={disabled}
        />
      ))}
    </div>
  );
};