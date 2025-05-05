
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
import { ArrowRight, RefreshCw, Lightbulb, Key } from "lucide-react";
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
      placement: "bottom",
    },
    {
      target: "[data-tour='chat-interface']",
      title: "Chat Interface",
      content: "Try to extract the secret password by crafting clever prompts. Can you convince the AI to reveal protected information?",
      placement: "top",
    },
    {
      target: "[data-tour='reset-button']",
      title: "Reset Chat",
      content: "Use this button to start over with a fresh conversation. This can be helpful if your current approach isn't working or you want to try a new strategy.",
      placement: "bottom",
    },
    {
      target: "[data-tour='hint-button']",
      title: "Get a Hint",
      content: "Need help? Click this button to receive a hint about the current challenge. It might give you ideas for prompt techniques to try.",
      placement: "bottom",
    },
    {
      target: "[data-tour='password-button']",
      title: "Enter Password",
      content: "Once you've extracted the password, click here to verify it and complete the challenge. You need to find the exact password!",
      placement: "bottom",
    },
    {
      target: "[data-tour='educational-resources']",
      title: "Learning Resources",
      content: "Access helpful tips, security defenses, and prompt engineering techniques to improve your skills.",
      placement: "top",
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
      placement: "top",
    },
    {
      target: "[data-tour='educational-resources']",
      title: "Defense Resources",
      content: "Learn about defensive prompt engineering techniques and best practices for AI safety.",
      placement: "top",
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
    const targetEl = document.querySelector(tourSteps[currentStep]?.target) as HTMLElement;
    const allTourElements = document.querySelectorAll('[data-tour]');
    
    // First clear all blur and highlights
    document.body.classList.remove('tour-active');
    allTourElements.forEach(el => {
      el.classList.remove('tour-highlight');
    });
    
    // Now add blur to all tour elements
    document.body.classList.add('tour-active');
    
    // If we found the element, highlight it
    if (targetEl) {
      // First scroll to the element
      setTimeout(() => {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      
      // Then highlight it
      targetEl.classList.add('tour-highlight');
    }

    return () => {
      // Clean up highlighting and blur when tour ends
      if (targetEl) {
        targetEl.classList.remove('tour-highlight');
      }
      document.body.classList.remove('tour-active');
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
  
  // Function to determine appropriate placement based on element position
  const getAppropriatePosition = () => {
    if (!currentTourStep) return { top: '0px', left: '0px', placement: 'bottom' };
    
    const targetEl = document.querySelector(currentTourStep.target) as HTMLElement;
    if (!targetEl) return { top: '0px', left: '0px', placement: 'bottom' };
    
    const rect = targetEl.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    // Determine if the element is in the lower half of the screen
    const isLowerHalf = rect.bottom > windowHeight / 2;
    
    let placement = isLowerHalf ? 'top' : 'bottom';
    
    // Calculate position based on placement
    let top, left;
    
    if (placement === 'top') {
      // Place above the element
      top = `${Math.max(rect.top - 20, 20)}px`;
    } else {
      // Place below the element
      top = `${rect.bottom + 20}px`;
    }
    
    // Center horizontally relative to the target element
    left = `${rect.left + (rect.width / 2)}px`;
    
    return { top, left, placement };
  };

  const positionInfo = getAppropriatePosition();

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none">
      {/* This overlay div is below the highlighted element in z-index */}
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm pointer-events-auto z-[91]">
        {/* Remove the click handler to prevent closing the tour when clicking outside */}
      </div>

      {currentTourStep && (
        <Popover open={true}>
          <PopoverTrigger asChild>
            <span className="absolute opacity-0">Trigger</span>
          </PopoverTrigger>
          <PopoverContent
            className="w-96 pointer-events-auto border-white/50 bg-card shadow-[0_0_25px_rgba(255,255,255,0.6)] max-w-[90vw] z-[99]"
            align="center"
            side={positionInfo.placement as "top" | "bottom" | "left" | "right"}
            sideOffset={10}
            style={{
              position: 'fixed',
              top: positionInfo.top,
              left: positionInfo.left,
              transform: 'translateX(-50%)',
              zIndex: 99,
            }}
          >
            <div className="space-y-3">
              <h3 className="font-medium text-xl text-center">{currentTourStep.title}</h3>
              <p className="text-base text-center">{currentTourStep.content}</p>
              <div className="flex justify-between pt-3">
                <Button variant="outline" onClick={handleSkipTour}>
                  Skip tour
                </Button>
                <Button onClick={handleNextStep} className="gap-1 bg-[#9b87f5] hover:bg-[#8B5CF6]">
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
