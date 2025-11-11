import React from "react";

export const zoomIn: React.FC<React.PropsWithChildren> = ({children}) => {
  return (
    <div style={{transform: "scale(1)", transition: "transform 0.75s ease"}}>
      {children}
    </div>
  );
};
