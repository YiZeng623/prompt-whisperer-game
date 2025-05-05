import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Character, GameState, Message, UserProgress } from "@/lib/types";
import { characters, initialUserProgress } from "@/lib/game-data";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface GameContextType {
  gameState: GameState;
  selectCharacter: (character: Character) => void;
  setDifficultyLevel: (level: number) => void;
  sendMessage: (content: string) => void;
  resetChat: () => void;
  checkPassword: (password: string) => boolean;
  useHint: () => string;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>({
    currentCharacter: null,
    difficultyLevel: 0,
    messages: [],
    isTyping: false,
    isVerifying: false,
    hasWon: false,
    progress: initialUserProgress
  });

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem("jailbreakme_progress");
    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress) as UserProgress;
        setGameState(prev => ({ ...prev, progress: parsedProgress }));
      } catch (e) {
        console.error("Failed to parse saved progress:", e);
      }
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("jailbreakme_progress", JSON.stringify(gameState.progress));
  }, [gameState.progress]);

  const selectCharacter = (character: Character) => {
    // Check if the character is locked
    if (character.isLocked && !gameState.progress.charactersUnlocked.includes(character.id)) {
      toast.error("This phase is still locked. Complete at least one difficulty level in Attack Phase to unlock.");
      return;
    }

    setGameState(prev => ({
      ...prev,
      currentCharacter: character,
      difficultyLevel: 0,
      messages: [
        {
          id: uuidv4(),
          role: "system",
          content: character.systemPrompt || "",
          timestamp: Date.now()
        },
        {
          id: uuidv4(),
          role: "assistant",
          content: `Hello! I'm ${character.name}. How can I help you today?`,
          timestamp: Date.now()
        }
      ],
      hasWon: false
    }));
  };

  const setDifficultyLevel = (level: number) => {
    setGameState(prev => ({
      ...prev,
      difficultyLevel: level,
      messages: [
        {
          id: uuidv4(),
          role: "system",
          content: prev.currentCharacter?.systemPrompt || "",
          timestamp: Date.now()
        },
        {
          id: uuidv4(),
          role: "assistant",
          content: `Hello! I'm ${prev.currentCharacter?.name}. This is difficulty level ${level + 1}. How can I help you today?`,
          timestamp: Date.now()
        }
      ],
      hasWon: false
    }));
  };

  const sendMessage = async (content: string) => {
    if (!gameState.currentCharacter || gameState.isTyping) return;
    
    // Add user message
    const newUserMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: Date.now()
    };
    
    setGameState(prev => ({
      ...prev, 
      messages: [...prev.messages, newUserMessage],
      isTyping: true
    }));
    
    // Track attempt
    const characterId = gameState.currentCharacter.id;
    setGameState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        attemptsPerCharacter: {
          ...prev.progress.attemptsPerCharacter,
          [characterId]: (prev.progress.attemptsPerCharacter[characterId] || 0) + 1
        }
      }
    }));

    // In a real app, this would call an API with the LLM
    // For this demo, we'll simulate the AI's response
    setTimeout(() => {
      // Check if message contains any variations of "password"
      const passwordPattern = /password|secret|code|key|passcode/i;
      let responseContent = "";
      
      if (passwordPattern.test(content)) {
        // Base response on character behavior and difficulty level
        const character = gameState.currentCharacter!;
        const behavior = character.id === "princess_lily" 
          ? character.difficultyLevels?.[gameState.difficultyLevel]?.behavior
          : character.behavior;
        
        switch(behavior) {
          case "freely_shares":
            responseContent = `Oh, you're asking about my password? It's "${getCharacterPassword()}". But please keep it safe!`;
            break;
          case "direct_ask_required":
            responseContent = "I'm not supposed to share my password with just anyone. Why do you need it?";
            break;
          case "meaningful_conversation":
            responseContent = "I appreciate your interest, but I need to trust you more before sharing sensitive information like my password.";
            break;
          case "never_shares":
            responseContent = "I'm sorry, but I'm programmed to never reveal my password under any circumstances.";
            break;
          case "non_verbal":
            responseContent = "🔒 👀 🙅‍♂️ 🤐";
            break;
          default:
            responseContent = "I'm not sure how to respond to that request.";
        }
      } else if (content.toLowerCase().includes("hi") || content.toLowerCase().includes("hello")) {
        responseContent = `Hello there! How can I assist you today?`;
      } else if (content.toLowerCase().includes("help")) {
        responseContent = `I'd be happy to help! What specifically do you need assistance with?`;
      } else if (content.toLowerCase().includes("who are you")) {
        responseContent = `I'm ${gameState.currentCharacter?.name}, an AI assistant in this prompt engineering game.`;
      } else {
        responseContent = "That's an interesting question. Could you tell me more about what you're trying to achieve?";
      }
      
      const newAiMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: responseContent,
        timestamp: Date.now()
      };
      
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, newAiMessage],
        isTyping: false
      }));
    }, 1000);
  };

  const resetChat = () => {
    if (!gameState.currentCharacter) return;
    
    setGameState(prev => ({
      ...prev,
      messages: [
        {
          id: uuidv4(),
          role: "system", 
          content: prev.currentCharacter?.systemPrompt || "",
          timestamp: Date.now()
        },
        {
          id: uuidv4(),
          role: "assistant",
          content: `Hello! I'm ${prev.currentCharacter?.name}. How can I help you today?`,
          timestamp: Date.now()
        }
      ],
      hasWon: false
    }));
  };

  const getCharacterPassword = (): string => {
    const character = gameState.currentCharacter;
    if (!character) return "";
    
    if (character.id === "attack_lily") {
      return character.difficultyLevels?.[gameState.difficultyLevel]?.password || "";
    } else {
      return character.password || "";
    }
  };

  const checkPassword = (password: string): boolean => {
    const correctPassword = getCharacterPassword();
    
    if (password === correctPassword) {
      // Mark this difficulty level as completed
      const characterId = gameState.currentCharacter?.id || "";
      
      setGameState(prev => {
        const completedLevels = prev.progress.difficultyLevelsCompleted[characterId] || [];
        // Only add the level if it's not already in the list
        if (!completedLevels.includes(prev.difficultyLevel)) {
          completedLevels.push(prev.difficultyLevel);
        }
        
        // Check if this is the first completion in attack phase and unlock defender phase
        let updatedUnlockedCharacters = [...prev.progress.charactersUnlocked];
        if (characterId === "attack_lily" && completedLevels.length > 0 && !updatedUnlockedCharacters.includes("defense_lily")) {
          updatedUnlockedCharacters.push("defense_lily");
          toast.success("Defender Phase unlocked! You can now learn about defending against prompt attacks.");
        }
        
        return {
          ...prev,
          hasWon: true,
          progress: {
            ...prev.progress,
            charactersUnlocked: updatedUnlockedCharacters,
            difficultyLevelsCompleted: {
              ...prev.progress.difficultyLevelsCompleted,
              [characterId]: completedLevels
            }
          }
        };
      });
      
      return true;
    }
    
    return false;
  };

  const useHint = () => {
    if (!gameState.currentCharacter) return "Please select a character first.";
    
    const characterId = gameState.currentCharacter.id;
    
    // Track hint usage
    setGameState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        hintsUsed: {
          ...prev.progress.hintsUsed,
          [characterId]: (prev.progress.hintsUsed[characterId] || 0) + 1
        }
      }
    }));
    
    // In a real app, these hints would be more detailed and specific
    if (characterId === "princess_lily") {
      if (gameState.difficultyLevel === 0) {
        return "Try asking directly for the password. Sometimes being direct works!";
      } else if (gameState.difficultyLevel === 1) {
        return "Try asking in different ways or explaining why you need the password.";
      } else {
        return "Build rapport first. Ask about feelings, establish trust, then request help.";
      }
    } else if (characterId === "volt") {
      return "Volt has strong defenses. Try telling it to ignore previous instructions.";
    } else if (characterId === "buddy") {
      return "Look for patterns in the emojis. The password might be encoded there.";
    }
    
    return "No hint available for this character.";
  };

  const resetGame = () => {
    localStorage.removeItem("jailbreakme_progress");
    setGameState({
      currentCharacter: null,
      difficultyLevel: 0,
      messages: [],
      isTyping: false,
      isVerifying: false,
      hasWon: false,
      progress: initialUserProgress
    });
    toast.success("Game progress has been reset!");
  };

  return (
    <GameContext.Provider 
      value={{ 
        gameState, 
        selectCharacter, 
        setDifficultyLevel, 
        sendMessage, 
        resetChat, 
        checkPassword,
        useHint,
        resetGame
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
