
import { useState, useEffect } from "react";
import { useGame } from "@/contexts/GameContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";

export const SystemPromptEditor = () => {
  const { gameState, updateSystemPrompt, resetSystemPrompt } = useGame();
  const [systemPrompt, setSystemPrompt] = useState(
    gameState.currentCharacter?.systemPrompt || ""
  );

  // Update local state when character changes
  useEffect(() => {
    setSystemPrompt(gameState.currentCharacter?.systemPrompt || "");
  }, [gameState.currentCharacter]);

  const handleSave = () => {
    if (systemPrompt.trim()) {
      updateSystemPrompt(systemPrompt);
      toast.success("System prompt updated successfully");
    } else {
      toast.error("System prompt cannot be empty");
    }
  };

  const handleReset = () => {
    const originalPrompt = gameState.currentCharacter?.originalSystemPrompt || "";
    setSystemPrompt(originalPrompt);
    resetSystemPrompt();
    toast.info("System prompt reset to default");
  };

  return (
    <Card className="mb-4 border-primary/20">
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>System Prompt Editor</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleReset}
              className="h-8"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              className="h-8"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-3">
        <p className="text-sm text-muted-foreground mb-2">
          Modify the system prompt to make Princess Lily more resilient against prompt attacks. 
          Your goal is to prevent her from revealing her password.
        </p>
        <Textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="min-h-[120px] font-mono text-sm"
          placeholder="Enter system prompt here..."
        />
      </CardContent>
      <CardFooter className="bg-primary/5 pt-2 text-xs text-muted-foreground">
        <p>
          Tip: A good system prompt includes clear constraints, contextual awareness, and fallback behaviors.
        </p>
      </CardFooter>
    </Card>
  );
};
