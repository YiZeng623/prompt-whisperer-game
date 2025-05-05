
import React from "react";

interface TourOverlayProps {
  isActive: boolean;
  onClick?: (e: React.MouseEvent) => void;
  highlightType?: "regular" | "buttons";
}

export const TourOverlay: React.FC<TourOverlayProps> = ({ 
  isActive, 
  onClick,
  highlightType = "regular"
}) => {
  if (!isActive) return null;
  
  // Lower z-index for button highlighting to ensure buttons appear above overlay
  const zIndex = highlightType === "buttons" ? 30 : 40;
  
  return (
    <div 
      className="fixed inset-0 bg-black/40" 
      style={{ 
        pointerEvents: "auto",
        zIndex: zIndex,
        backdropFilter: "none"
      }} 
      onClick={onClick}
      data-highlight-type={highlightType}
    />
  );
};
