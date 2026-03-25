import React from "react";

interface MobileShellProps {
  children: React.ReactNode;
}

const MobileShell: React.FC<MobileShellProps> = ({ children }) => (
  <div className="flex justify-center min-h-screen bg-muted/50">
    <div className="w-full max-w-[480px] min-h-screen bg-background relative overflow-hidden shadow-2xl">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <div className="relative z-0">
        {children}
      </div>
    </div>
  </div>
);

export default MobileShell;
