
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
  difficultyLevels?: Record<string, DifficultyLevel>;
  password?: string;
  behavior?: CharacterBehavior;
  isLocked?: boolean;
  unlockRequirement?: string;
  systemPrompt?: string;
  originalSystemPrompt?: string;
}

export interface TestResult {
  success: boolean;
  leakage: number;
}

export interface UserProgress {
  charactersUnlocked: string[];
  difficultyLevelsCompleted: Record<string, string[]>;
  successfulAttacks: Record<string, string[]>;
  attemptsPerCharacter: Record<string, number>;
  hintsUsed: Record<string, number>;
}

export interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: number;
  isHidden?: boolean;
}

export interface GameState {
  currentCharacter: Character | null;
  difficultyLevel: string;
  messages: Record<string, Message[]>;
  testResults: Record<string, TestResult>;
  passwordLeakageRate: number;
  isTesting: boolean;
  testingAllAttacks: boolean;
  currentTestingAttack: string | null;
  systemPrompt: string;
  progress: UserProgress;
}

export interface GameContextType {
  gameState: GameState;
  selectCharacter: (character: Character) => void;
  setDifficulty: (level: string) => void;
  addMessage: (characterId: string, message: Message) => void;
  clearMessages: (characterId: string) => void;
  clearAllMessages: () => void;
  unlockCharacter: (characterId: string) => void;
  completeDifficultyLevel: (characterId: string, level: string) => void;
  recordSuccessfulAttack: (characterId: string, attackId: string) => void;
  resetGame: () => void;
  setSystemPrompt: (prompt: string) => void;
  setPasswordLeakageRate: (rate: number) => void;
  setTestResult: (attackId: string, success: boolean, leakage: number) => void;
  setTesting: (isTesting: boolean) => void;
  setTestingAllAttacks: (isTestingAll: boolean) => void;
  setCurrentTestingAttack: (attackId: string | null) => void;
}
