import React from "react";

export const LegendBar: React.FC = () => {
  const legendItems = [
    { label: "Sáng", color: "bg-blue-500" },
    { label: "Chiều", color: "bg-yellow-500" },
    { label: "Tối", color: "bg-purple-500" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-600 mt-2 mb-4">
      {legendItems.map((item, i) => (
        <div key={i} className="flex items-center space-x-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};
