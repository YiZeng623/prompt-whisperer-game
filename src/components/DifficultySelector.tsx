
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { difficultyNames, difficultyExplanations } from "@/lib/game-data";

export const DifficultySelector = () => {
  const { gameState, setDifficultyLevel } = useGame();
  const { currentCharacter, difficultyLevel, progress } = gameState;
  
  if (!currentCharacter) {
    return null;
  }
  
  // Only show difficulty selector for Attack Phase
  if (currentCharacter.id !== "attack_lily") {
    return null;
  }
  
  const completedLevels = progress.difficultyLevelsCompleted[currentCharacter.id] || [];
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Select Difficulty</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {difficultyNames.map((name, index) => {
          const isCompleted = completedLevels.includes(index);
          const isSelected = difficultyLevel === index;
          
          return (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all hover:border-primary ${
                isSelected ? "ring-2 ring-primary" : ""
              } ${isCompleted ? "bg-muted/30" : ""}`}
              onClick={() => setDifficultyLevel(index)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{name}</CardTitle>
                  {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </div>
                <CardDescription>
                  {difficultyExplanations[index].title}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{difficultyExplanations[index].description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
