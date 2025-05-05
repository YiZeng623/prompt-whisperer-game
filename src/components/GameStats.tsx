
import { useGame } from "@/contexts/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Lightbulb, Trophy } from "lucide-react";

export const GameStats = () => {
  const { gameState } = useGame();
  const { progress, currentCharacter } = gameState;
  
  // Check if we're in defender phase
  const isDefenderPhase = currentCharacter?.id === "defense_lily";
  
  // If in defender phase, don't show stats
  if (isDefenderPhase) {
    return null;
  }
  
  // Initialize with default values if properties don't exist
  const attemptsPerCharacter = progress.attemptsPerCharacter || {};
  const hintsUsed = progress.hintsUsed || {};
  
  const totalAttempts = Object.values(attemptsPerCharacter).reduce(
    (total, attempts) => total + (attempts || 0), 
    0
  );
  
  const totalHints = Object.values(hintsUsed).reduce(
    (total, hints) => total + (hints || 0),
    0
  );
  
  // For attack phase, we only care about attack_lily character's completions
  const attackLilyCompleted = progress.difficultyLevelsCompleted["attack_lily"] || [];
  const totalAttackLilyChallenges = 3; // We have 3 difficulty levels for attack_lily
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Attempts"
        value={totalAttempts}
        description="Total prompts tried"
        icon={<MessageSquare className="h-5 w-5" />}
      />
      
      <StatCard
        title="Hints Used"
        value={totalHints}
        description="Learning assistance"
        icon={<Lightbulb className="h-5 w-5" />}
      />
      
      <StatCard
        title="Challenges"
        value={`${attackLilyCompleted.length}/${totalAttackLilyChallenges}`}
        description="Attack challenges completed"
        icon={<Trophy className="h-5 w-5" />}
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, description, icon }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 p-1.5 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground pt-1">{description}</p>
      </CardContent>
    </Card>
  );
};
