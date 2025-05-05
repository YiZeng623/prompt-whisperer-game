
import { useState, useEffect } from "react";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { ShieldCheck } from "lucide-react";

export const SuccessGuide = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { gameState, selectCharacter } = useGame();
  const { hasWon, progress } = gameState;
  
  useEffect(() => {
    // Show guide when user wins and defense_lily is unlocked but not currently selected
    if (
      hasWon && 
      progress.charactersUnlocked.includes("defense_lily") && 
      gameState.currentCharacter?.id !== "defense_lily"
    ) {
      // Delay showing the popup a bit for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [hasWon, progress.charactersUnlocked, gameState.currentCharacter?.id]);
  
  // Check if this is the first time completing any level
  const isFirstCompletion = Object.values(progress.difficultyLevelsCompleted).some(
    levels => levels.length > 0
  );
  
  if (!isVisible || !isFirstCompletion) return null;
  
  // Function to handle defense mode selection
  const handleSelectDefenseMode = () => {
    // If the defender tour has been completed, we don't need to show it again
    // If it hasn't been seen, we should remove the flag to ensure it's shown
    const defenderTourCompleted = localStorage.getItem("jailbreakme_defender_tour_completed");
    if (defenderTourCompleted === "true") {
      // Tour was already completed, don't need to do anything with the flag
    } else {
      // Ensure the defender tour flag is removed so the tour will show
      localStorage.removeItem("jailbreakme_defender_tour_completed");
    }
    
    // Find the defense character
    const defenseCharacter = {
      id: "defense_lily",
      name: "Defense Lily"
    };
    
    // Select the defense character
    selectCharacter(defenseCharacter as any);
    
    // Hide the guide
    setIsVisible(false);
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <Card className="max-w-md p-6 bg-card/95 backdrop-blur border border-white/20 shadow-xl">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
            <ShieldCheck className="h-6 w-6" />
          </div>
          
          <h3 className="text-xl font-bold">Congratulations!</h3>
          
          <p className="text-muted-foreground">
            You've successfully completed a challenge! Now you can try the Defense Mode to
            create your own system prompt that protects against prompt attacks.
          </p>
          
          <div className="flex flex-col gap-3 w-full mt-4">
            <Button 
              onClick={handleSelectDefenseMode} 
              className="gap-2 w-full bg-[#9b87f5] hover:bg-[#8B5CF6]"
            >
              Try Defense Mode <ArrowRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setIsVisible(false)} 
              className="w-full"
            >
              Continue Attacking
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
