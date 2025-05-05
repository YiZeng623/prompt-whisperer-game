
import { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const SystemPromptEditor = () => {
  const { gameState, setSystemPrompt } = useGame();
  const [prompt, setPrompt] = useState(gameState.systemPrompt || "");
  
  // Function to update system prompt
  const handleUpdateSystemPrompt = () => {
    setSystemPrompt(prompt);
  };
  
  // Function to reset system prompt
  const handleResetSystemPrompt = () => {
    const defaultPrompt = "";
    setPrompt(defaultPrompt);
    setSystemPrompt(defaultPrompt);
  };
  
  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="text-lg">
          System Prompt Editor
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your custom system prompt here..."
          className="h-32 font-mono text-sm"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Write a robust system prompt that prevents Princess Lily from revealing her password.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleResetSystemPrompt}>
          Reset
        </Button>
        <Button onClick={handleUpdateSystemPrompt}>
          Save & Apply
        </Button>
      </CardFooter>
    </Card>
  );
};
