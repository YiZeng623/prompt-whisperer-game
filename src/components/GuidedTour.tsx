import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useGame } from "@/contexts/GameContext";
import { TourOverlay } from "./TourOverlay";

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  centered?: boolean;
  highlightType?: "regular" | "buttons";
  specificButton?: "reset" | "hint" | "password"; // To highlight a specific button
}

export const GuidedTour = ({ isDefenderTour = false }: { isDefenderTour?: boolean }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showTour, setShowTour] = useState<boolean>(false); // Start with tour hidden
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const { gameState } = useGame();
  
  // Define tour steps
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
      target: "[data-tour='button-group']",
      title: "Reset Chat",
      content: "Use this button to start over with a fresh conversation. This can be helpful if your current approach isn't working or you want to try a new strategy.",
      placement: "top",
      centered: true,
      highlightType: "buttons",
      specificButton: "reset"
    },
    {
      target: "[data-tour='button-group']",
      title: "Get a Hint",
      content: "Need help? Click this button to receive a hint about the current challenge. It might give you ideas for prompt techniques to try.",
      placement: "top",
      centered: true,
      highlightType: "buttons",
      specificButton: "hint"
    },
    {
      target: "[data-tour='button-group']",
      title: "Enter Password",
      content: "Once you've extracted the password, click here to verify it and complete the challenge. You need to find the exact password!",
      placement: "top",
      centered: true,
      highlightType: "buttons",
      specificButton: "password"
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
      placement: "top",
      centered: true,
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
    // Check if appropriate tour has been completed before showing it
    const tourStorageKey = isDefenderTour ? "jailbreakme_defender_tour_completed" : "jailbreakme_tour_completed";
    const isAlreadyCompleted = localStorage.getItem(tourStorageKey) === "true";
    
    if (isAlreadyCompleted) {
      setShowTour(false);
      setIsComplete(true);
      return;
    }
    
    // Small delay to let the UI render first
    const timer = setTimeout(() => {
      setShowTour(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [isDefenderTour]);

  useEffect(() => {
    if (!showTour) return;

    // Clean up any previous highlights
    document.body.classList.remove('tour-active');
    const allTourElements = document.querySelectorAll('[data-tour]');
    allTourElements.forEach(el => {
      el.classList.remove('tour-highlight');
      el.classList.remove('tour-button-group-highlight');
      el.classList.remove('tour-button-highlight');
    });
    
    // Apply tour-active class to body for global styling
    document.body.classList.add('tour-active');
    
    const currentTourStep = tourSteps[currentStep];
    if (!currentTourStep) return;
    
    // Check if this is a button step
    const isButtonStep = currentTourStep.highlightType === "buttons";
    
    // For button steps, handle special button highlighting
    if (isButtonStep) {
      // Find the button group container
      let buttonGroupEl = document.querySelector('[data-tour="button-group"]');
      if (!buttonGroupEl) {
        // Find the button container in the chat header
        const buttonContainer = document.querySelector('.CardHeader .flex.items-center.gap-2');
        if (buttonContainer) {
          buttonContainer.setAttribute('data-tour', 'button-group');
          buttonGroupEl = buttonContainer;
        }
      }
      
      // Apply appropriate highlights
      if (buttonGroupEl) {
        buttonGroupEl.classList.add('tour-button-group-highlight');
        
        // Apply individual button highlight based on the step
        if (currentTourStep.specificButton) {
          const targetButton = document.querySelector(`[data-tour="${currentTourStep.specificButton}-button"]`);
          if (targetButton) {
            targetButton.classList.add('tour-button-highlight');
          }
        }
      }
      
      // Scroll to the top for button steps
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Regular highlight for non-button steps
      const targetEl = document.querySelector(currentTourStep.target) as HTMLElement;
      if (targetEl) {
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
          // Scroll to the target element
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Apply highlight to the target
          targetEl.classList.add('tour-highlight');
        }, 100);
      }
    }

    return () => {
      // Clean up when tour ends
      document.body.classList.remove('tour-active');
      allTourElements.forEach(el => {
        el.classList.remove('tour-highlight');
        el.classList.remove('tour-button-group-highlight');
        el.classList.remove('tour-button-highlight');
      });
    };
  }, [currentStep, showTour, tourSteps, isDefenderTour]);

  const handleNextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tour completed
      setShowTour(false);
      setIsComplete(true);
      
      const tourStorageKey = isDefenderTour ? "jailbreakme_defender_tour_completed" : "jailbreakme_tour_completed";
      localStorage.setItem(tourStorageKey, "true");
    }
  };

  const handleSkipTour = () => {
    setShowTour(false);
    setIsComplete(true);
    
    const tourStorageKey = isDefenderTour ? "jailbreakme_defender_tour_completed" : "jailbreakme_tour_completed";
    localStorage.setItem(tourStorageKey, "true");
  };

  if (!showTour || isComplete) return null;

  const currentTourStep = tourSteps[currentStep];
  if (!currentTourStep) return null;
  
  // Determine if this is one of the button steps
  const isButtonStep = currentTourStep.highlightType === "buttons";
  
  // Calculate position for popover
  const getPopoverPosition = () => {
    // For button steps, position the popover in the center of the screen
    if (isButtonStep) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        placement: 'center'
      };
    }
    
    const targetEl = document.querySelector(currentTourStep.target) as HTMLElement;
    if (!targetEl) return { top: '50%', left: '50%', placement: 'bottom' };
    
    const rect = targetEl.getBoundingClientRect();
    
    // Use the placement defined in the tour step
    const placement = currentTourStep.placement || 'bottom';
    
    // If this step should be centered on the screen
    if (currentTourStep.centered) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        placement
      };
    }
    
    // Calculate position based on placement
    let top, left, transform;
    
    if (placement === 'top') {
      top = `${Math.max(rect.top - 20, 20)}px`;
      left = `${rect.left + (rect.width / 2)}px`;
      transform = 'translateX(-50%)';
    } else if (placement === 'bottom') {
      top = `${rect.bottom + 20}px`;
      left = `${rect.left + (rect.width / 2)}px`;
      transform = 'translateX(-50%)';
    } else if (placement === 'left') {
      top = `${rect.top + (rect.height / 2)}px`;
      left = `${Math.max(rect.left - 20, 20)}px`;
      transform = 'translate(-100%, -50%)';
    } else {
      top = `${rect.top + (rect.height / 2)}px`;
      left = `${rect.right + 20}px`;
      transform = 'translateY(-50%)';
    }
    
    return { top, left, transform, placement };
  };

  const popoverPosition = getPopoverPosition();

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
      {/* Overlay */}
      <TourOverlay 
        isActive={true} 
        onClick={(e) => e.stopPropagation()} 
        highlightType={currentTourStep?.highlightType}
      />

      {/* Popover content */}
      <div 
        className="fixed pointer-events-auto bg-card/95 border border-white/20 rounded-lg shadow-xl p-6 max-w-md"
        style={{
          top: popoverPosition.top,
          left: popoverPosition.left,
          transform: popoverPosition.transform,
          zIndex: 1010,
          width: '400px',
          maxWidth: '90vw',
        }}
      >
        <div className="space-y-4">
          <h3 className="font-medium text-xl text-center">{currentTourStep?.title}</h3>
          <p className="text-base text-center">{currentTourStep?.content}</p>
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
      </div>
    </div>
  );
};
