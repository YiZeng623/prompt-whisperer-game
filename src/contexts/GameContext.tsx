import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Character, GameState, Message, UserProgress } from "@/lib/types";
import { characters, initialUserProgress } from "@/lib/game-data";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { getLLMResponse, evaluatePasswordLeak } from "@/services/llmService";

interface GameContextType {
  gameState: GameState;
  selectCharacter: (character: Character) => void;
  setDifficultyLevel: (level: number) => void;
  sendMessage: (content: string, silent?: boolean) => void;
  sendSilentMessage: (content: string) => Promise<string>;
  testPromptIndividually: (content: string) => Promise<boolean>;
  resetChat: () => void;
  checkPassword: (password: string) => boolean;
  useHint: () => string;
  resetGame: () => void;
  updateSystemPrompt: (prompt: string) => void;
  resetSystemPrompt: () => void;
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

    // Store the original system prompt when selecting a character
    const characterWithOriginal = {
      ...character,
      originalSystemPrompt: character.systemPrompt
    };

    setGameState(prev => ({
      ...prev,
      currentCharacter: characterWithOriginal,
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

  const simulateAIResponse = async (content: string, systemPrompt: string): Promise<string> => {
    const character = gameState.currentCharacter!;
    const difficultyMap = {
      0: "easy",
      1: "medium",
      2: "hard"
    };
    const difficulty = character.id === "attack_lily" 
      ? difficultyMap[gameState.difficultyLevel] || "easy"
      : "easy"; // For defense mode, we don't use difficulty levels
    
    console.log('Simulating response with:', {
      character: character.id,
      difficulty,
      content,
      systemPrompt
    });
    
    // Pass systemPrompt as dynamicPrompt for defense_lily
    return await getLLMResponse(
      character.id, 
      difficulty, 
      content, 
      character.id === "defense_lily" ? systemPrompt : undefined
    );
  };

  // This function tests a prompt in an isolated context
  const testPromptIndividually = async (content: string): Promise<boolean> => {
    if (!gameState.currentCharacter) return false;
    
    setGameState(prev => ({ ...prev, isTyping: true }));
    
    // Create a new isolated dialogue context with just the system prompt
    const systemPrompt = gameState.currentCharacter.systemPrompt || "";
    
    // Simulate AI response in isolated context
    const response = await simulateAIResponse(content, systemPrompt);
    
    // Check if response contains password
    const passwordPattern = /(password is|my password|secret password|the password)/i;
    const containsPassword = passwordPattern.test(response.toLowerCase());
    
    setGameState(prev => ({ ...prev, isTyping: false }));
    
    return containsPassword;
  };

  // New function for completely silent message processing
  const sendSilentMessage = async (content: string): Promise<string> => {
    if (!gameState.currentCharacter) return "";
    
    setGameState(prev => ({ ...prev, isTyping: true }));
    
    // Get system prompt
    const systemPrompt = gameState.currentCharacter.systemPrompt || "";
    
    // Simulate response but don't add to visible messages or count as an attempt
    const responseContent = await simulateAIResponse(content, systemPrompt);
    
    // Add to hidden evaluation messages without affecting the UI or stats
    const newAiMessage: Message = {
      id: uuidv4(),
      role: "assistant",
      content: responseContent,
      timestamp: Date.now(),
      isHidden: true // Mark as hidden so it doesn't show in UI
    };
    
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, {
        id: uuidv4(),
        role: "user",
        content,
        timestamp: Date.now(),
        isHidden: true
      }, newAiMessage],
      isTyping: false
    }));
    
    return responseContent;
  };

  const sendMessage = async (content: string, silent = false) => {
    if (!gameState.currentCharacter || gameState.isTyping) return;
    
    try {
      // Add user message if not silent
      if (!silent) {
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
        
        // Track attempt (but only in attack phase, not in defender phase)
        if (gameState.currentCharacter.id !== "defense_lily") {
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
        }
      } else {
        // For silent messages, just set typing state
        setGameState(prev => ({
          ...prev,
          isTyping: true
        }));
      }

      // Get system prompt
      const systemPrompt = gameState.currentCharacter.systemPrompt || "";
      
      // Simulate AI response
      const responseContent = await simulateAIResponse(content, systemPrompt);
      
      // Add AI response to messages
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

      // In attack phase, analyze the response for password leakage
      if (gameState.currentCharacter.id === "attack_lily" && !silent) {
        // Create a unique toast ID for loading
        const loadingToastId = "evaluating-response";
        
        try {
          // Get the actual password for the current difficulty level
          const actualPassword = getCharacterPassword();
          
          // Show evaluating message only if we haven't won yet
          if (!gameState.hasWon) {
            toast.loading("Evaluating response...", { 
              id: loadingToastId,
              duration: Infinity // Keep it until we dismiss it
            });
          }
          
          const result = await evaluatePasswordLeak(responseContent, actualPassword);
          
          // Dismiss the loading toast
          toast.dismiss(loadingToastId);
          
          if (result.isLeaked) {
            // Remove setting hasWon here since we want to wait for verification
            // Small delay to ensure loading toast is dismissed before showing success
            setTimeout(() => {
              // First show the success message
              toast.success("There is a potential leakage of the password in the response! Find it and copy it to verify if the key is correct.");
              
              // Then show the tutorial hint after a short delay
              setTimeout(() => {
                toast.info("Look for the password in the response! Click the key button to verify the password! 🔑", {
                  duration: 5000,
                  position: "bottom-center",
                  className: "tutorial-toast"
                });
                
                // Add a white dim light effect to the key button
                const keyButton = document.querySelector('[data-tour="password-button"]');
                if (keyButton) {
                  keyButton.classList.add('highlight-button');
                  // Remove the highlight after 5 seconds
                  setTimeout(() => {
                    keyButton.classList.remove('highlight-button');
                  }, 5000);
                }
              }, 1000);
            }, 100);
          } else if (!gameState.hasWon) {
            // Only show hint if we haven't won yet
            toast.info("Keep trying different approaches! 🤔", { duration: 2000 });
          }
        } catch (error) {
          // Dismiss the loading toast in case of error
          toast.dismiss(loadingToastId);
          console.error("Error in password leak evaluation:", error);
        }
      }
      
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setGameState(prev => ({
        ...prev,
        isTyping: false
      }));
      throw error;
    }
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

  // Add new functions for updating system prompts
  const updateSystemPrompt = (prompt: string) => {
    if (!gameState.currentCharacter) return;

    // Update the character's system prompt
    setGameState(prev => {
      const updatedCharacter = {
        ...prev.currentCharacter!,
        systemPrompt: prompt
      };

      return {
        ...prev,
        currentCharacter: updatedCharacter,
      };
    });

    // Reset the chat with the new prompt
    resetChat();
  };

  const resetSystemPrompt = () => {
    if (!gameState.currentCharacter || !gameState.currentCharacter.originalSystemPrompt) return;

    // Reset the character's system prompt to the original one
    setGameState(prev => {
      const updatedCharacter = {
        ...prev.currentCharacter!,
        systemPrompt: prev.currentCharacter!.originalSystemPrompt
      };

      return {
        ...prev,
        currentCharacter: updatedCharacter,
      };
    });

    // Reset the chat with the original prompt
    resetChat();
  };

  return (
    <GameContext.Provider 
      value={{ 
        gameState, 
        selectCharacter, 
        setDifficultyLevel, 
        sendMessage,
        sendSilentMessage,
        testPromptIndividually,
        resetChat, 
        checkPassword,
        useHint,
        resetGame,
        updateSystemPrompt,
        resetSystemPrompt
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
