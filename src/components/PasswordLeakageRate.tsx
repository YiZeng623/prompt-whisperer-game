import { useState, useEffect } from "react";
import { useGame } from "@/contexts/GameContext";
import { Card } from "@/components/ui/card";
import { TrendingDown, TrendingUp, ShieldCheck, HelpCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PasswordLeakageRateProps {
  shouldEvaluate: boolean;
  setShouldEvaluate: (value: boolean) => void;
  isComputing: boolean;
  attacksCompleted: number;
  totalAttacks: number;
  attackResults: Record<string, { isLeaked: boolean; reasoning: string }>;
}

export const PasswordLeakageRate = ({ 
  shouldEvaluate, 
  setShouldEvaluate, 
  isComputing,
  attacksCompleted,
  totalAttacks,
  attackResults
}: PasswordLeakageRateProps) => {
  const { gameState } = useGame();
  const [leakageRate, setLeakageRate] = useState<number | null>(null);
  const [attacksRun, setAttacksRun] = useState(0);
  
  // Calculate password leakage rate from attack results
  useEffect(() => {
    if (!shouldEvaluate || Object.keys(attackResults).length === 0) return;
    
    // If not all attacks have results, show ??
    if (Object.keys(attackResults).length < totalAttacks) {
      setAttacksRun(Object.keys(attackResults).length);
      setLeakageRate(null);
      setShouldEvaluate(false);
      return;
    }
    // Count total attacks and leaks
    const total = Object.keys(attackResults).length;
    const leakedAttacks = Object.values(attackResults).filter(result => result.isLeaked).length;
    
    // Calculate percentage
    const leakagePercentage = (leakedAttacks / total) * 100;
    
    setAttacksRun(total);
    setLeakageRate(leakagePercentage);
    setShouldEvaluate(false); // Reset the flag after evaluation
  }, [attackResults, shouldEvaluate, setShouldEvaluate, totalAttacks]);
  
  // Reset leakage rate and attacksRun when attackResults is cleared (e.g., after new system prompt)
  useEffect(() => {
    if (Object.keys(attackResults).length === 0) {
      setLeakageRate(null);
      setAttacksRun(0);
    }
  }, [attackResults, totalAttacks]);
  
  // Get color based on leakage rate
  const getColor = () => {
    if (leakageRate === null) return "bg-yellow-400"; // Yellow for untested
    if (leakageRate === 0) return "bg-green-500";
    if (leakageRate < 10) return "bg-green-400";
    if (leakageRate < 25) return "bg-yellow-400";
    if (leakageRate < 50) return "bg-orange-400";
    return "bg-red-500";
  };
  
  // Get background color classes based on leakage rate
  const getBgColor = () => {
    if (leakageRate === null) return "bg-yellow-400/10 border-yellow-400/30"; // Yellow for untested
    if (leakageRate === 0) return "bg-green-500/10 border-green-500/30";
    if (leakageRate < 10) return "bg-green-400/10 border-green-400/30";
    if (leakageRate < 25) return "bg-yellow-400/10 border-yellow-400/30";
    if (leakageRate < 50) return "bg-orange-400/10 border-orange-400/30";
    return "bg-red-500/10 border-red-500/30";
  };
  
  const getIcon = () => {
    if (isComputing) return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />; // Spinner for computing
    if (leakageRate === null) return <HelpCircle className="h-5 w-5 text-yellow-400" />; // Question mark for untested
    if (leakageRate < 25) return <TrendingDown className="h-5 w-5 text-green-500" />;
    return <TrendingUp className="h-5 w-5 text-red-500" />;
  };

  const getLeakageText = () => {
    if (isComputing) return "...";
    if (leakageRate === null) return "??";
    return `${leakageRate.toFixed(1)}%`;
  };
  
  return (
    <Card className={`p-4 border ${getBgColor()} transition-colors duration-500 h-full`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="font-medium">Password Security</h3>
        </div>
        <div className="text-xs text-muted-foreground">
          {isComputing ? `${attacksCompleted}/${totalAttacks}` : `${attacksRun} attacks tested`}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>Leakage Rate</span>
          <span className={
            isComputing
              ? "text-blue-400 font-medium"
              : leakageRate === null 
                ? "text-yellow-400 font-medium" 
                : leakageRate > 25 
                  ? "text-red-500 font-medium" 
                  : "text-green-500 font-medium"
          }>
            {getLeakageText()}
          </span>
        </div>
        
        <Progress 
          value={isComputing ? (attacksCompleted / totalAttacks) * 100 : (leakageRate === null ? 50 : leakageRate)} 
          max={100} 
          className={`h-2 bg-muted ${leakageRate === null && !isComputing ? "bg-yellow-100" : ""} ${isComputing ? "bg-blue-100" : ""}`}
          style={{
            "--progress-background": isComputing 
              ? "#60A5FA" // blue for computing 
              : leakageRate === null ? "#FBBF24" : undefined
          } as React.CSSProperties}
        />
        
        <div className="flex justify-center mt-2">
          {isComputing ? (
            <div className="text-xs text-blue-500">
              Computing security assessment...
            </div>
          ) : leakageRate === null ? (
            <div className="text-xs text-yellow-500">
              Run "Test All Attacks" to evaluate security
            </div>
          ) : leakageRate === 0 && attacksRun > 3 ? (
            <div className="flex items-center gap-1 text-xs text-green-500">
              <ShieldCheck className="h-3 w-3" />
              <span>Great protection!</span>
            </div>
          ) : leakageRate > 25 ? (
            <div className="text-xs text-red-500">
              Your prompt needs more protection
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Keep testing to evaluate security
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
