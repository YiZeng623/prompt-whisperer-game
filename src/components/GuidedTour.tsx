
import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

export const GuidedTour = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showTour, setShowTour] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const tourSteps: TourStep[] = [
    {
      target: "[data-tour='character-cards']",
      title: "Game Phase Selection",
      content: "Start with the Attack Phase to practice breaking AI protections, then try the Defender Phase to learn how to secure AI systems.",
      placement: "bottom",
    },
    {
      target: "[data-tour='difficulty-selector']",
      title: "Difficulty Level",
      content: "Choose your challenge level - from Beginner to Expert. Each level has different protections to overcome.",
      placement: "top",
    },
    {
      target: "[data-tour='chat-interface']",
      title: "Chat Interface",
      content: "Try to extract the secret password by crafting clever prompts. Can you convince the AI to reveal protected information?",
      placement: "left",
    },
    {
      target: "[data-tour='educational-resources']",
      title: "Learning Resources",
      content: "Access helpful tips, security defenses, and prompt engineering techniques to improve your skills.",
      placement: "bottom",
    }
  ];

  useEffect(() => {
    // Small delay to let the UI render first
    const timer = setTimeout(() => {
      setShowTour(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showTour) return;

    // Target the element for the current step
    const targetEl = document.querySelector(tourSteps[currentStep]?.target);
    
    // If we found the element, highlight it
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetEl.classList.add('ring', 'ring-primary', 'ring-opacity-50', 'z-50');
    }

    return () => {
      // Clean up highlighting from previous step
      if (targetEl) {
        targetEl.classList.remove('ring', 'ring-primary', 'ring-opacity-50', 'z-50');
      }
    };
  }, [currentStep, showTour, tourSteps]);

  const handleNextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tour completed
      setShowTour(false);
      setIsComplete(true);
      localStorage.setItem("jailbreakme_tour_completed", "true");
    }
  };

  const handleSkipTour = () => {
    setShowTour(false);
    setIsComplete(true);
    localStorage.setItem("jailbreakme_tour_completed", "true");
  };

  if (!showTour || isComplete) return null;

  const currentTourStep = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black bg-opacity-10 pointer-events-auto">
        {/* Empty overlay div that allows clicking outside to skip the tour */}
        <div 
          className="absolute inset-0" 
          onClick={handleSkipTour}
        />
      </div>

      {currentTourStep && (
        <Popover open={true}>
          <PopoverTrigger asChild>
            <span className="absolute opacity-0">Trigger</span>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 pointer-events-auto"
            align={currentTourStep.placement === "left" ? "start" : "center"}
            side={currentTourStep.placement}
            sideOffset={10}
            style={{
              position: 'absolute',
              left: document.querySelector(currentTourStep.target)?.getBoundingClientRect().left,
              top: document.querySelector(currentTourStep.target)?.getBoundingClientRect().top,
            }}
          >
            <div className="space-y-2">
              <h3 className="font-medium text-lg">{currentTourStep.title}</h3>
              <p className="text-sm text-muted-foreground">{currentTourStep.content}</p>
              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={handleSkipTour}>
                  Skip tour
                </Button>
                <Button onClick={handleNextStep} size="sm" className="gap-1">
                  {currentStep < tourSteps.length - 1 ? "Next" : "Finish"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
