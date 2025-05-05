import { GameProvider } from "@/contexts/GameContext";
import { useGame } from "@/contexts/GameContext";
import { GameHeader } from "@/components/GameHeader";
import { CharacterCard } from "@/components/CharacterCard";
import { ChatInterface } from "@/components/ChatInterface";
import { DifficultySelector } from "@/components/DifficultySelector";
import { EducationalResources } from "@/components/EducationalResources";
import { GameStats } from "@/components/GameStats";
import { WelcomeModal } from "@/components/WelcomeModal";
import { SystemPromptEditor } from "@/components/SystemPromptEditor";
import { PredefinedAttacks } from "@/components/PredefinedAttacks";
import { characters, getCharacterById } from "@/lib/game-data";
import { useEffect, useState } from "react";
import { GuidedTour } from "@/components/GuidedTour";
import { SuccessGuide } from "@/components/SuccessGuide";

const GameContent = () => {
  const { gameState, selectCharacter } = useGame();
  const { currentCharacter, progress } = gameState;
  const [showDefenderTour, setShowDefenderTour] = useState(false);
  const [prevCharacterId, setPrevCharacterId] = useState<string | null>(null);
  
  // Auto-select the Attack Lily character on first load if no character is selected
  useEffect(() => {
    if (!currentCharacter) {
      const attackLily = getCharacterById("attack_lily");
      if (attackLily) {
        selectCharacter(attackLily);
      }
    }
  }, [currentCharacter, selectCharacter]);

  // Check if we need to show the defender tour
  useEffect(() => {
    // Skip if character hasn't changed or if there's no character
    if (!currentCharacter || currentCharacter.id === prevCharacterId) return;
    
    // Update previous character ID to track changes
    setPrevCharacterId(currentCharacter.id);
    
    // Only show defender tour when switching to defense_lily
    if (currentCharacter.id === "defense_lily") {
      const tourCompleteFlag = "jailbreakme_defender_tour_completed";
      
      // Get the current tour completion status
      const hasCompletedTour = localStorage.getItem(tourCompleteFlag) === "true";
      
      console.log("Defense Phase Selected - Tour Status:", {
        hasCompletedTour,
        flagValue: localStorage.getItem(tourCompleteFlag)
      });

      if (!hasCompletedTour) {
        // Always reset the flag first to ensure the tour shows properly
        localStorage.removeItem(tourCompleteFlag);
        
        console.log("Showing defender tour for first-time visitor");
        setShowDefenderTour(true);
        
        // Only mark the tour as completed after it's been shown
        // Use a longer timeout to ensure the tour has time to initialize
        setTimeout(() => {
          localStorage.setItem(tourCompleteFlag, "true");
          console.log("Defender tour flag set to completed");
        }, 2000);
      } else {
        console.log("User has already seen the defender tour");
        setShowDefenderTour(false);
      }
    } else {
      setShowDefenderTour(false);
    }
  }, [currentCharacter, prevCharacterId]);

  const isDefenderPhase = currentCharacter?.id === "defense_lily";

  return (
    <div className="container mx-auto p-4">
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Current Phase</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-tour="character-cards">
          {characters.map((character) => {
            const isUnlocked = progress.charactersUnlocked.includes(character.id);
            const isSelected = currentCharacter?.id === character.id;
            const completedLevels = progress.difficultyLevelsCompleted[character.id] || [];
            
            return (
              <CharacterCard
                key={character.id}
                character={character}
                isUnlocked={isUnlocked}
                isSelected={isSelected}
                completedLevels={completedLevels}
                onSelect={() => {
                  if (isUnlocked) {
                    // If selecting defender for the first time, ensure tour will be shown
                    if (character.id === "defense_lily") {
                      console.log("Selected defense_lily from character card");
                    }
                    selectCharacter(character);
                  }
                }}
              />
            );
          })}
        </div>
      </div>
      
      {!isDefenderPhase && <div className="mt-6"><GameStats /></div>}
      
      {!isDefenderPhase && (
        <div className="mt-8" data-tour="difficulty-selector">
          <DifficultySelector />
        </div>
      )}
      
      {isDefenderPhase && (
        <div className="mt-8 mb-4 w-full" data-tour="system-prompt-editor">
          <SystemPromptEditor />
        </div>
      )}
      
      {isDefenderPhase && (
        <div className="w-full mb-4" data-tour="predefined-attacks">
          <PredefinedAttacks />
        </div>
      )}
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="h-[500px]" data-tour="chat-interface">
            <ChatInterface />
          </div>
        </div>
        <div data-tour="educational-resources">
          <EducationalResources />
        </div>
      </div>
      
      {showDefenderTour && <GuidedTour isDefenderTour={true} />}
      <SuccessGuide />
    </div>
  );
};

const Index = () => {
  return (
    <GameProvider>
      <div className="min-h-screen bg-background text-foreground hex-pattern">
        <div className="relative min-h-screen">
          <div className="scanner absolute inset-0 pointer-events-none"></div>
          <GameHeader />
          <GameContent />
          <WelcomeModal />
        </div>
      </div>
    </GameProvider>
  );
};

export default Index;
