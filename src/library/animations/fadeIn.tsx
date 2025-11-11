import React from "react";

export const fadeIn: React.FC<React.PropsWithChildren> = ({children}) => {
  return (
    <div style={{opacity: 1, transition: "opacity 0.75s ease"}}>
      {children}
    </div>
  );
};
