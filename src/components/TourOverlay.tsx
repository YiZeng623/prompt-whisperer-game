
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
  
  return (
    <div 
      className="fixed inset-0 bg-black/70" 
      style={{ 
        pointerEvents: "auto",
        zIndex: 40,
        backdropFilter: "blur(1px)"
      }} 
      onClick={onClick}
      data-highlight-type={highlightType}
    />
  );
};
