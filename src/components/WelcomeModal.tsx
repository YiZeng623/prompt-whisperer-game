
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
import { GuidedTour } from "./GuidedTour";

export const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Only show welcome modal on first visit
    const hasVisited = localStorage.getItem("jailbreakme_visited");
    if (!hasVisited) {
      setIsOpen(true);
      localStorage.setItem("jailbreakme_visited", "true");
    }
  }, []);

  const handleTourStart = () => {
    setIsOpen(false);
    setShowTour(true);
  };

  return (
    <>
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
              <li>Start with the Attack Phase and choose a difficulty level</li>
              <li>Try to extract the character's secret password using prompt engineering techniques</li>
              <li>Then try the Defender Phase to learn how to prevent password leakage</li>
              <li>Complete challenges to learn about AI safety</li>
            </ol>
            
            <p>
              This is an educational tool - the goal is to learn about AI safety and prompt
              engineering, not to cause harm to real-world AI systems.
            </p>
          </div>
          
          <DialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Skip Tour</Button>
            <Button onClick={handleTourStart}>Take a guided tour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {showTour && <GuidedTour />}
    </>
  );
};
