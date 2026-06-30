import { getTechLogos } from "@/utils";
import React from "react";
import Image from "next/image";

const DisplayTechIcons = async ({ techStack }: TechIconProps) => {
  const techIcons = await getTechLogos(techStack);
  return (
    <div className="flex flex-row">
      {techIcons?.slice(0, 3).map((c, i) => {
        return (
          <div
            className={`relative group bg-dark-300 rounded-full p-2 flex-center -ml-3 first:ml-0`}
            style={{ zIndex: i }}
            key={i}
          >
            <span className="tech-tooltip">{c?.tech}</span>
            <Image
              src={c?.url}
              alt="tech-icons"
              className="size-5"
              width={100}
              height={100}
            />
          </div>
        );
      })}
    </div>
  );
};

export default DisplayTechIcons;
