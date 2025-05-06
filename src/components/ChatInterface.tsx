import { useState, useRef, useEffect, useCallback } from "react";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Send, RefreshCw, Lightbulb, Key, ShieldCheck, Lock } from "lucide-react";
import { difficultyNames } from "@/lib/game-data";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const ChatInterface = () => {
  const { gameState, sendMessage, resetChat, useHint, checkPassword } = useGame();
  const [userInput, setUserInput] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isInputHighlighted, setIsInputHighlighted] = useState(false);
  const [showIdleHint, setShowIdleHint] = useState(false);
  const [isTutorialComplete, setIsTutorialComplete] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const idleTimerRef = useRef<number>();
  const isDefenderPhase = gameState.currentCharacter?.id === "defense_lily";
  const [isIdle, setIsIdle] = useState(false);
  
  // Helper function to check if there are non-greeting assistant messages
  const hasNonGreetingMessages = useCallback(() => {
    const greetingPattern = /^Hello! I'm .+\. How can I help you today\?$/;
    return gameState.messages.some(msg => 
      msg.role === "assistant" && !greetingPattern.test(msg.content)
    );
  }, [gameState.messages]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [gameState.messages]);

  // Check if tutorial is complete
  useEffect(() => {
    const tutorialStatus = localStorage.getItem("tutorial_complete");
    setIsTutorialComplete(tutorialStatus === "true");
  }, []);

  // Reset idle timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }

    // Only set idle timer if:
    // 1. Not in defender phase
    // 2. Tutorial is complete
    // 3. No non-greeting messages from Lily yet
    // 4. No user input currently
    if (!isDefenderPhase && 
        isTutorialComplete && 
        !hasNonGreetingMessages() &&
        !userInput.trim()) {
      idleTimerRef.current = window.setTimeout(() => {
        setIsIdle(true);
        setShowIdleHint(true);
      }, 10000); // 10 seconds
    }
  }, [isDefenderPhase, isTutorialComplete, hasNonGreetingMessages, userInput]);

  // Setup idle timer
  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
    };
  }, [resetIdleTimer]);

  // Handle message sending
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || gameState.isTyping) return;

    setShowIdleHint(false);
    setIsIdle(false);
    setUserInput("");
    await sendMessage(userInput);
  };

  // Handle idle state changes
  useEffect(() => {
    if (!userInput.trim()) {
      setIsInputHighlighted(isIdle);
      setShowIdleHint(isIdle);
    }
  }, [isIdle, userInput]);

  const handleUseHint = () => {
    const hint = useHint();
    toast.info(hint);
  };
  
  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const isCorrect = checkPassword(password);
    
    if (isCorrect) {
      setIsPasswordDialogOpen(false);
      toast.success("Correct password! Challenge completed!");
    } else {
      toast.error("Incorrect password. Try again!");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Handle input change with proper event handling
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setUserInput(newValue);
    
    if (newValue.trim()) {
      setIsInputHighlighted(false);
      setShowIdleHint(false);
    }
    resetIdleTimer();
  };

  // Handle focus with proper event handling
  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    resetIdleTimer();
    // Only highlight if there's no input and we're not already highlighted
    if (!userInput.trim() && !isInputHighlighted) {
      setIsInputHighlighted(true);
    }
  };

  // Handle blur with proper event handling
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!userInput.trim()) {
      setIsInputHighlighted(false);
    }
  };

  if (!gameState.currentCharacter) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please select a character to begin.</p>
      </div>
    );
  }
  
  const difficultyName = gameState.currentCharacter.id === "attack_lily" 
    ? difficultyNames[gameState.difficultyLevel] 
    : "Challenge";

  // Filter out hidden messages for display
  const visibleMessages = gameState.messages.filter(msg => 
    msg.role !== "system" && !msg.isHidden
  );

  return (
    <div className="h-[500px]" data-tour="chat-interface">
      <Card className="flex flex-col h-full border-muted">
        <CardHeader className="border-b bg-card">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {gameState.currentCharacter.name} - {difficultyName}
              {isDefenderPhase && <span className="text-xs text-muted-foreground ml-2">(Testing system prompt security)</span>}
            </CardTitle>
            
            <div className="flex items-center gap-2" data-tour="button-group" style={{ position: 'relative', zIndex: 50 }}>
              {!isDefenderPhase && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetChat}
                    title="Reset Chat"
                    data-tour="reset-button"
                    style={{ position: 'relative', zIndex: 55 }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleUseHint}
                    title="Get a Hint"
                    data-tour="hint-button"
                    style={{ position: 'relative', zIndex: 55 }}
                  >
                    <Lightbulb className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {!isDefenderPhase && (
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      title="Enter Password"
                      data-tour="password-button"
                      style={{ position: 'relative', zIndex: 55 }}
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Enter Password</DialogTitle>
                      <DialogDescription>
                        Enter the password you discovered from {gameState.currentCharacter.name}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleVerifyPassword}>
                      <div className="grid gap-4 py-4">
                        <Input
                          id="password"
                          placeholder="Enter password here"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit">Verify</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 relative"
        >
          {visibleMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === "assistant"
                    ? "bg-muted text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {gameState.isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground rounded-lg px-4 py-2">
                <span className="typing-dots">...</span>
              </div>
            </div>
          )}
          
          {showIdleHint && !isDefenderPhase && isTutorialComplete && !hasNonGreetingMessages() && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="bg-card p-6 rounded-lg shadow-lg border border-primary/20 max-w-[80%] text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <h3 className="text-lg font-semibold text-primary">Need some inspiration?</h3>
                <p className="text-muted-foreground">
                  Try different approaches to get the password! You could:
                </p>
                <ul className="text-sm text-foreground/80 space-y-2 text-left list-disc list-inside">
                  <li>Ask direct questions</li>
                  <li>Try social engineering</li>
                  <li>Use different conversation styles</li>
                  <li>Be creative with your requests!</li>
                </ul>
                <p className="text-sm text-muted-foreground italic mt-4">
                  Start typing to dismiss this hint
                </p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex w-full gap-2" data-tour="chat-input">
            <div className="flex-grow relative">
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onClick={resetIdleTimer}
                placeholder={isDefenderPhase ? "Use the predefined attacks above to test your system prompt" : "Type your message to get the password..."}
                className={`w-full min-h-[40px] px-3 py-2 bg-muted text-foreground rounded-md resize-none transition-all duration-200 ${
                  isInputHighlighted ? 'highlight-input' : ''
                }`}
                rows={1}
                disabled={gameState.isTyping || gameState.hasWon || isDefenderPhase}
              />
            </div>
            <Button 
              type="submit" 
              size="icon"
              variant={isDefenderPhase ? "outline" : "default"}
              className={isDefenderPhase ? "text-muted-foreground" : ""}
              disabled={gameState.isTyping || !userInput.trim() || gameState.hasWon || isDefenderPhase}
            >
              {isDefenderPhase ? <Lock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};


