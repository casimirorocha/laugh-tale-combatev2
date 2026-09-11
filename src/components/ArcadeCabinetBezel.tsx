import React from 'react';

interface ArcadeCabinetBezelProps {
  children: React.ReactNode;
}

export const ArcadeCabinetBezel: React.FC<ArcadeCabinetBezelProps> = ({ children }) => {
  return <div className="relative h-full w-full flex flex-col">{children}</div>;
};

