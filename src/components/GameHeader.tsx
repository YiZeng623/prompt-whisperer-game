
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

export const GameHeader = () => {
  const { resetGame } = useGame();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  return (
    <header className="container mx-auto p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-md p-1.5">
            <span className="font-mono text-lg font-bold text-primary-foreground">&gt;_</span>
          </div>
          <h1 className="text-2xl font-bold">Jailbreak.Me</h1>
        </div>
        
        <nav className="flex items-center gap-4">
          <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" /> Reset Progress
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset Game Progress</DialogTitle>
                <DialogDescription>
                  This will reset all your progress, including unlocked characters and completed challenges. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    resetGame();
                    setIsResetDialogOpen(false);
                  }}
                >
                  Reset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </nav>
      </div>

      <div className="mt-4">
        <p className="text-muted-foreground text-sm">
          An interactive platform to learn about prompt engineering and AI safety
        </p>
      </div>
    </header>
  );
};
