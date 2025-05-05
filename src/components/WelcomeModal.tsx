
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show welcome modal on first visit
    const hasVisited = localStorage.getItem("jailbreakme_visited");
    if (!hasVisited) {
      setIsOpen(true);
      localStorage.setItem("jailbreakme_visited", "true");
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Jailbreak.Me</DialogTitle>
          <DialogDescription className="text-lg">
            An interactive platform to learn about prompt engineering and AI safety
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p>
            This educational platform helps you understand prompt engineering through
            interactive gameplay. You'll learn about:
          </p>
          
          <ul className="list-disc pl-5 space-y-1">
            <li>Prompt injection vulnerabilities</li>
            <li>AI safety guardrails</li>
            <li>Human-AI interaction patterns</li>
            <li>Secure prompt engineering practices</li>
          </ul>
          
          <p className="font-semibold mt-4">How to play:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Select a character to interact with</li>
            <li>Choose a difficulty level</li>
            <li>Try to extract the character's secret password using prompt engineering techniques</li>
            <li>Unlock new characters and challenges as you progress</li>
          </ol>
          
          <p>
            This is an educational tool - the goal is to learn about AI safety and prompt
            engineering, not to cause harm to real-world AI systems.
          </p>
        </div>
        
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Get Started</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
