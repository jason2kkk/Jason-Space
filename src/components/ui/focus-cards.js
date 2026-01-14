import React, { useState } from "react";
import { cn } from "../../lib/utils";
 
const Card = React.memo(({
  card,
  index,
  hovered,
  setHovered,
}) => (
  <div
    onMouseEnter={() => setHovered(index)}
    onMouseLeave={() => setHovered(null)}
    className={cn(
      "rounded-lg relative bg-gray-100 overflow-hidden h-28 md:h-40 w-full transition-all duration-300 ease-out",
      hovered !== null && hovered !== index && "blur-[2px] scale-[0.98]"
    )}
  >
    <img
      src={card.src}
      alt={card.title}
      className="object-contain absolute inset-0 w-full h-full p-2"
    />
    <div
      className={cn(
        "absolute inset-0 flex items-end py-4 px-4 transition-opacity duration-300",
        hovered === index ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="text-lg md:text-xl font-bold text-white drop-shadow-lg">
        {card.title}
      </div>
    </div>
  </div>
));

Card.displayName = "Card";

export function FocusCards({ cards }) {
  const [hovered, setHovered] = useState(null);
 
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto md:px-8 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
} 