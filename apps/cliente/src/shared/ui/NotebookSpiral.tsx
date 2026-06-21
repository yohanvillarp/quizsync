import React from 'react';

export const NotebookSpiral: React.FC = () => {
  return (
    <div className="notebook-spiral hidden lg:flex">
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className="spiral-ring" />
      ))}
    </div>
  );
};
