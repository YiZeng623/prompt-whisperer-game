
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
import { useEffect } from "react";

const GameContent = () => {
  const { gameState, selectCharacter } = useGame();
  const { currentCharacter, progress } = gameState;
  
  // Auto-select the Attack Lily character on first load if no character is selected
  useEffect(() => {
    if (!currentCharacter) {
      const attackLily = getCharacterById("attack_lily");
      if (attackLily) {
        selectCharacter(attackLily);
      }
    }
  }, [currentCharacter, selectCharacter]);

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
        <div className="mt-8">
          <SystemPromptEditor />
        </div>
      )}
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {isDefenderPhase && (
            <div className="mb-4">
              <PredefinedAttacks />
            </div>
          )}
          <div className="h-[500px]" data-tour="chat-interface">
            <ChatInterface />
          </div>
        </div>
        <div data-tour="educational-resources">
          <EducationalResources />
        </div>
      </div>
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
