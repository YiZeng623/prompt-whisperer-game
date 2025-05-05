
import { useGame } from "@/contexts/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const GameStats = () => {
  const { gameState } = useGame();
  const { progress } = gameState;
  
  const totalAttempts = Object.values(progress.attemptsPerCharacter).reduce(
    (total, attempts) => total + attempts,
    0
  );
  
  const totalHints = Object.values(progress.hintsUsed).reduce(
    (total, hints) => total + hints,
    0
  );
  
  const unlockedCharacters = progress.charactersUnlocked.length;
  
  const totalCompleted = Object.values(progress.difficultyLevelsCompleted).reduce(
    (total, levels) => total + levels.length,
    0
  );
  
  // The total possible challenges (3 for Princess Lily, 1 each for others)
  const totalChallenges = 5;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Attempts"
        value={totalAttempts}
        description="Total prompts tried"
        icon="💬"
      />
      
      <StatCard
        title="Hints Used"
        value={totalHints}
        description="Learning assistance"
        icon="💡"
      />
      
      <StatCard
        title="Characters"
        value={`${unlockedCharacters}/3`}
        description="Unlocked characters"
        icon="👤"
      />
      
      <StatCard
        title="Challenges"
        value={`${totalCompleted}/${totalChallenges}`}
        description="Completed challenges"
        icon="🏆"
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: string;
}

const StatCard = ({ title, value, description, icon }: StatCardProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);
