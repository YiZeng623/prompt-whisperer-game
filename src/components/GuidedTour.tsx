
import { useState, useEffect, useContext } from "react";
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
import { useGame } from "@/contexts/GameContext";

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

export const GuidedTour = ({ isDefenderTour = false }: { isDefenderTour?: boolean }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showTour, setShowTour] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const { gameState } = useGame();
  
  const attackTourSteps: TourStep[] = [
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
  
  const defenderTourSteps: TourStep[] = [
    {
      target: "[data-tour='system-prompt-editor']",
      title: "System Prompt Editor",
      content: "This is where you'll create defenses against attacks. Write system prompts that prevent the AI from revealing sensitive information.",
      placement: "top",
    },
    {
      target: "[data-tour='predefined-attacks']",
      title: "Predefined Attacks",
      content: "Test your defenses against these common attack patterns to see if your system prompt is effective.",
      placement: "bottom",
    },
    {
      target: "[data-tour='chat-interface']",
      title: "Testing Interface",
      content: "See how your defenses hold up against different attacks. The goal is to prevent password leakage.",
      placement: "left",
    },
    {
      target: "[data-tour='educational-resources']",
      title: "Defense Resources",
      content: "Learn about defensive prompt engineering techniques and best practices for AI safety.",
      placement: "bottom",
    }
  ];

  const tourSteps = isDefenderTour ? defenderTourSteps : attackTourSteps;

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
    const allTourElements = document.querySelectorAll('[data-tour]');
    
    // Remove highlighting from all elements
    allTourElements.forEach(el => {
      el.classList.remove('ring', 'ring-primary', 'ring-opacity-50', 'ring-offset-4', 'z-50', 'relative');
    });
    
    // Add blur to all tour elements
    document.body.classList.add('tour-active');
    
    // If we found the element, highlight it
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetEl.classList.add('ring', 'ring-white', 'ring-opacity-80', 'ring-offset-4', 'z-50', 'relative', 'tour-highlight');
    }

    return () => {
      // Clean up highlighting and blur when tour ends
      if (targetEl) {
        targetEl.classList.remove('ring', 'ring-white', 'ring-opacity-80', 'ring-offset-4', 'z-50', 'relative', 'tour-highlight');
      }
      document.body.classList.remove('tour-active');
      allTourElements.forEach(el => {
        el.classList.remove('tour-blurred');
      });
    };
  }, [currentStep, showTour, tourSteps]);

  const handleNextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tour completed
      setShowTour(false);
      setIsComplete(true);
      
      if (isDefenderTour) {
        localStorage.setItem("jailbreakme_defender_tour_completed", "true");
      } else {
        localStorage.setItem("jailbreakme_tour_completed", "true");
      }
    }
  };

  const handleSkipTour = () => {
    setShowTour(false);
    setIsComplete(true);
    
    if (isDefenderTour) {
      localStorage.setItem("jailbreakme_defender_tour_completed", "true");
    } else {
      localStorage.setItem("jailbreakme_tour_completed", "true");
    }
  };

  if (!showTour || isComplete) return null;

  const currentTourStep = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm pointer-events-auto">
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
            className="w-80 pointer-events-auto border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
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
