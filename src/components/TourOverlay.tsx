
import React from "react";

interface TourOverlayProps {
  isActive: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const TourOverlay: React.FC<TourOverlayProps> = ({ 
  isActive, 
  onClick 
}) => {
  if (!isActive) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/40" 
      style={{ 
        pointerEvents: "auto",
        zIndex: 40 
      }} 
      onClick={onClick}
    />
  );
};
