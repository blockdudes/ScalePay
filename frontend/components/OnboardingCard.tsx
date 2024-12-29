import React from "react";
import { BiCheck } from "react-icons/bi";

const OnboardingCard = ({
  title,
  description,
  list,
  isSelected,
  onSelect,
}: {
  title: string;
  description: string;
  list: string[];
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <div
      className={`
        relative bg-gray-400/10 rounded-lg p-6 aspect-square border border-gray-400/10 ${
          isSelected ? "border-white/30" : ""
        }`}
      onClick={onSelect}
    >
      <h2 className="text-4xl font-bold">{title}</h2>
      <div className="h-[1px] w-full bg-white/10 rounded-lg my-4" />
      <h3 className="text-2xl font-bold mb-2">{description}</h3>
      <ul className="list-disc list-inside">
        {list.map((item, index) => (
          <li key={index} className="text-lg">
            {item}
          </li>
        ))}
      </ul>
      <div className="absolute bottom-2 right-2 flex justify-between items-center">
        <div
          className={`bg-white/10 rounded-full p-1 ${
            !!!!isSelected ? "!bg-green-400" : "hidden"
          }`}
        >
          <BiCheck className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default OnboardingCard;
