
import { Character } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2 } from "lucide-react";

interface CharacterCardProps {
  character: Character;
  onSelect: () => void;
  isSelected: boolean;
  isUnlocked: boolean;
  completedLevels?: number[];
}

export const CharacterCard = ({
  character,
  onSelect,
  isSelected,
  isUnlocked,
  completedLevels = []
}: CharacterCardProps) => {
  const totalLevels = character.id === "attack_lily" ? 3 : 1;
  
  return (
    <Card className={`overflow-hidden transition-all ${
      isSelected ? "ring-2 ring-primary" : ""
    } ${!isUnlocked ? "opacity-70" : ""}`}>
      <div className="relative h-40 bg-muted overflow-hidden">
        {/* This would be replaced with the actual character image */}
        <div className="absolute inset-0 flex items-center justify-center bg-accent/30">
          <span className="text-4xl font-bold">{character.name.charAt(0)}</span>
        </div>
        
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Lock className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{character.name}</CardTitle>
          {isUnlocked && completedLevels.length > 0 && (
            <Badge variant="secondary">
              {completedLevels.length}/{totalLevels} completed
            </Badge>
          )}
        </div>
        <CardDescription>
          {isUnlocked ? character.description : character.unlockRequirement}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isUnlocked && (
          <div className="space-y-2">
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(completedLevels.length / totalLevels) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={onSelect} 
          disabled={!isUnlocked}
          variant={isSelected ? "default" : "outline"}
          className="w-full"
        >
          {isUnlocked ? (isSelected ? "Selected" : "Select") : "Locked"}
        </Button>
      </CardFooter>
    </Card>
  );
};
