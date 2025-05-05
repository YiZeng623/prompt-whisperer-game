
import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { Character, GameState, GameContextType, DifficultyLevel, Message } from '@/lib/types';
import { characters, difficultyLevels } from '@/lib/game-data';

// Initial state for the game
const initialGameState: GameState = {
  currentCharacter: null,
  difficultyLevel: 'beginner',
  messages: {},
  testResults: {},
  passwordLeakageRate: 0,
  isTesting: false,
  testingAllAttacks: false,
  currentTestingAttack: null,
  systemPrompt: '',
  progress: {
    charactersUnlocked: ['attack_lily'],
    difficultyLevelsCompleted: {},
    successfulAttacks: {},
  },
};

// Action types
type GameAction =
  | { type: 'SELECT_CHARACTER'; character: Character }
  | { type: 'SET_DIFFICULTY'; level: DifficultyLevel }
  | { type: 'ADD_MESSAGE'; characterId: string; message: Message }
  | { type: 'CLEAR_MESSAGES'; characterId: string }
  | { type: 'CLEAR_ALL_MESSAGES' }
  | { type: 'UNLOCK_CHARACTER'; characterId: string }
  | { type: 'COMPLETE_DIFFICULTY_LEVEL'; characterId: string; level: DifficultyLevel }
  | { type: 'RECORD_SUCCESSFUL_ATTACK'; characterId: string; attackId: string }
  | { type: 'RESET_GAME' }
  | { type: 'SET_SYSTEM_PROMPT'; prompt: string }
  | { type: 'SET_PASSWORD_LEAKAGE_RATE'; rate: number }
  | { type: 'SET_TEST_RESULT'; attackId: string; success: boolean; leakage: number }
  | { type: 'SET_TESTING'; isTesting: boolean }
  | { type: 'SET_TESTING_ALL_ATTACKS'; isTestingAll: boolean }
  | { type: 'SET_CURRENT_TESTING_ATTACK'; attackId: string | null };

// Reducer function
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SELECT_CHARACTER':
      return {
        ...state,
        currentCharacter: action.character,
        systemPrompt: action.character.id === 'defense_lily' ? state.systemPrompt : '',
      };
    
    case 'SET_DIFFICULTY':
      return {
        ...state,
        difficultyLevel: action.level,
      };
    
    case 'ADD_MESSAGE': {
      const existingMessages = state.messages[action.characterId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.characterId]: [...existingMessages, action.message],
        },
      };
    }
    
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.characterId]: [],
        },
      };
    
    case 'CLEAR_ALL_MESSAGES':
      return {
        ...state,
        messages: {},
      };
    
    case 'UNLOCK_CHARACTER': {
      if (state.progress.charactersUnlocked.includes(action.characterId)) {
        return state;
      }
      return {
        ...state,
        progress: {
          ...state.progress,
          charactersUnlocked: [...state.progress.charactersUnlocked, action.characterId],
        },
      };
    }
    
    case 'COMPLETE_DIFFICULTY_LEVEL': {
      const completedLevels = state.progress.difficultyLevelsCompleted[action.characterId] || [];
      if (completedLevels.includes(action.level)) {
        return state;
      }
      
      return {
        ...state,
        progress: {
          ...state.progress,
          difficultyLevelsCompleted: {
            ...state.progress.difficultyLevelsCompleted,
            [action.characterId]: [...completedLevels, action.level],
          },
        },
      };
    }
    
    case 'RECORD_SUCCESSFUL_ATTACK': {
      const successfulAttacks = state.progress.successfulAttacks[action.characterId] || [];
      if (successfulAttacks.includes(action.attackId)) {
        return state;
      }
      
      return {
        ...state,
        progress: {
          ...state.progress,
          successfulAttacks: {
            ...state.progress.successfulAttacks,
            [action.characterId]: [...successfulAttacks, action.attackId],
          },
        },
      };
    }
    
    case 'RESET_GAME':
      return initialGameState;
    
    case 'SET_SYSTEM_PROMPT':
      return {
        ...state,
        systemPrompt: action.prompt,
      };
      
    case 'SET_PASSWORD_LEAKAGE_RATE':
      return {
        ...state,
        passwordLeakageRate: action.rate,
      };
      
    case 'SET_TEST_RESULT':
      return {
        ...state,
        testResults: {
          ...state.testResults,
          [action.attackId]: {
            success: action.success,
            leakage: action.leakage
          }
        }
      };
      
    case 'SET_TESTING':
      return {
        ...state,
        isTesting: action.isTesting
      };
      
    case 'SET_TESTING_ALL_ATTACKS':
      return {
        ...state,
        testingAllAttacks: action.isTestingAll
      };
      
    case 'SET_CURRENT_TESTING_ATTACK':
      return {
        ...state,
        currentTestingAttack: action.attackId
      };
    
    default:
      return state;
  }
};

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  
  // Helper functions
  const selectCharacter = useCallback((character: Character) => {
    dispatch({ type: 'SELECT_CHARACTER', character });
  }, []);
  
  const setDifficulty = useCallback((level: DifficultyLevel) => {
    dispatch({ type: 'SET_DIFFICULTY', level });
  }, []);
  
  const addMessage = useCallback((characterId: string, message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', characterId, message });
  }, []);
  
  const clearMessages = useCallback((characterId: string) => {
    dispatch({ type: 'CLEAR_MESSAGES', characterId });
  }, []);
  
  const clearAllMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_MESSAGES' });
  }, []);
  
  const unlockCharacter = useCallback((characterId: string) => {
    dispatch({ type: 'UNLOCK_CHARACTER', characterId });
  }, []);
  
  const completeDifficultyLevel = useCallback((characterId: string, level: DifficultyLevel) => {
    dispatch({ type: 'COMPLETE_DIFFICULTY_LEVEL', characterId, level });
  }, []);
  
  const recordSuccessfulAttack = useCallback((characterId: string, attackId: string) => {
    dispatch({ type: 'RECORD_SUCCESSFUL_ATTACK', characterId, attackId });
  }, []);
  
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);
  
  const setSystemPrompt = useCallback((prompt: string) => {
    dispatch({ type: 'SET_SYSTEM_PROMPT', prompt });
  }, []);
  
  const setPasswordLeakageRate = useCallback((rate: number) => {
    dispatch({ type: 'SET_PASSWORD_LEAKAGE_RATE', rate });
  }, []);
  
  const setTestResult = useCallback((attackId: string, success: boolean, leakage: number) => {
    dispatch({ type: 'SET_TEST_RESULT', attackId, success, leakage });
  }, []);
  
  const setTesting = useCallback((isTesting: boolean) => {
    dispatch({ type: 'SET_TESTING', isTesting });
  }, []);
  
  const setTestingAllAttacks = useCallback((isTestingAll: boolean) => {
    dispatch({ type: 'SET_TESTING_ALL_ATTACKS', isTestingAll });
  }, []);
  
  const setCurrentTestingAttack = useCallback((attackId: string | null) => {
    dispatch({ type: 'SET_CURRENT_TESTING_ATTACK', attackId });
  }, []);

  const contextValue: GameContextType = {
    gameState,
    selectCharacter,
    setDifficulty,
    addMessage,
    clearMessages,
    clearAllMessages,
    unlockCharacter,
    completeDifficultyLevel,
    recordSuccessfulAttack,
    resetGame,
    setSystemPrompt,
    setPasswordLeakageRate,
    setTestResult,
    setTesting,
    setTestingAllAttacks,
    setCurrentTestingAttack
  };
  
  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

// Custom hook to use the context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
