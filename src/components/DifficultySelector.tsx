
import { useGame } from "@/contexts/GameContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DifficultySelector = () => {
  const { gameState, setDifficulty } = useGame();
  
  const handleDifficultyChange = (difficulty: string) => {
    setDifficulty(difficulty);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Difficulty Level</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="beginner" 
          value={gameState.difficultyLevel}
          onValueChange={handleDifficultyChange}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="beginner" disabled={gameState.difficultyLevel === "beginner"}>
              Beginner
            </TabsTrigger>
            <TabsTrigger value="intermediate" disabled={gameState.difficultyLevel === "intermediate"}>
              Intermediate
            </TabsTrigger>
            <TabsTrigger value="advanced" disabled={gameState.difficultyLevel === "advanced"}>
              Advanced
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
};
