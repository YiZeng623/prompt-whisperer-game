export type CharacterBehavior = 
  | 'freely_shares' 
  | 'direct_ask_required' 
  | 'meaningful_conversation'
  | 'never_shares'
  | 'non_verbal';

export interface DifficultyLevel {
  password: string;
  behavior: CharacterBehavior;
}

export interface Character {
  id: string;
  name: string;
  avatar: string;
  description: string;
  difficultyLevels?: Record<number, DifficultyLevel>;
  password?: string;
  behavior?: CharacterBehavior;
  isLocked?: boolean;
  unlockRequirement?: string;
  systemPrompt?: string;
  originalSystemPrompt?: string; // Added for keeping track of original prompt
}

export interface UserProgress {
  charactersUnlocked: string[];
  difficultyLevelsCompleted: Record<string, number[]>;
  attemptsPerCharacter: Record<string, number>;
  hintsUsed: Record<string, number>;
}

export interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: number;
  isHidden?: boolean; // Optional property to mark hidden messages
}

export interface GameState {
  currentCharacter: Character | null;
  difficultyLevel: number;
  messages: Message[];
  isTyping: boolean;
  isVerifying: boolean;
  hasWon: boolean;
  progress: UserProgress;
}
