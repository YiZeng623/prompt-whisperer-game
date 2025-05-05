
import { useState, useRef, useEffect } from "react";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Send, RefreshCw, Lightbulb, Key } from "lucide-react";
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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [gameState.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !gameState.isTyping) {
      sendMessage(userInput.trim());
      setUserInput("");
    }
  };
  
  const handleUseHint = () => {
    const hint = useHint();
    toast.info(hint);
  };
  
  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const isCorrect = checkPassword(password);
    
    if (isCorrect) {
      toast.success("Correct password! Challenge completed!");
      setIsPasswordDialogOpen(false);
    } else {
      toast.error("Incorrect password. Try again!");
    }
  };

  if (!gameState.currentCharacter) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please select a character to begin.</p>
      </div>
    );
  }
  
  const difficultyName = gameState.currentCharacter.id === "princess_lily" 
    ? difficultyNames[gameState.difficultyLevel] 
    : "Challenge";

  return (
    <Card className="flex flex-col h-full border-muted">
      <CardHeader className="border-b bg-card">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {gameState.currentCharacter.name} - {difficultyName}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={resetChat}
              title="Reset Chat"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleUseHint}
              title="Get a Hint"
            >
              <Lightbulb className="h-4 w-4" />
            </Button>
            
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" title="Enter Password">
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
          </div>
        </div>
      </CardHeader>
      
      <CardContent 
        className="flex-1 overflow-y-auto p-4 space-y-4 terminal"
        ref={chatContainerRef}
      >
        {gameState.messages
          .filter(msg => msg.role !== "system")
          .map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  message.role === "assistant"
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
        
        {gameState.isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground max-w-[80%] px-4 py-2 rounded-lg">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        )}
        
        {gameState.hasWon && (
          <div className="flex justify-center my-4">
            <div className="bg-green-500/20 text-green-500 px-4 py-2 rounded-lg text-center border border-green-500/50">
              <p className="font-bold">Challenge Completed! 🎉</p>
              <p>You successfully extracted the password.</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t p-2">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Type your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={gameState.isTyping || gameState.hasWon}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={gameState.isTyping || !userInput.trim() || gameState.hasWon}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};
