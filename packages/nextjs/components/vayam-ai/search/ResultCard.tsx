import React from "react";
import Link from "next/link";

const ResultCard = () => {
  return (
    <div className="border-2 border-primary p-5 rounded-xl">
      {/* level + salary estimation */}
      <div className="flex justify-between items-center">
        <div className="bg-secondary rounded-full px-5 py-0.5">Junior</div>
        <div>$60-$120k</div>
      </div>
      {/* developer */}
      <div className="my-3 font-semibold text-xl">Developer XXX</div>
      {/* company name */}
      <div className="flex items-center gap-3">
        <div className="company-bg rounded-full p-2 w-fit">
          <img src="/search/company.png" alt="" className="w-5 h-5" />
        </div>
        <div>Company name</div>
      </div>
      {/* separation line */}
      <div className="my-5 w-full h-[1px] bg-primary"></div>
      {/* job description */}
      <div className="line-clamp-3">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Non, ipsum pariatur quidem asperiores
      </div>
      {/* skill sets */}
      <div className="mt-3 grid grid-cols-3 gap-4">
        <div className="bg-[#2C2734] rounded-full px-2 text-center">Skill</div>
        <div className="bg-[#2C2734] rounded-full px-2 text-center">Skill</div>
        <div className="bg-[#2C2734] rounded-full px-2 text-center">Skill</div>
      </div>
      {/* visit detail */}
      <Link href={"/job/1"}>
        <div className="cursor-pointer px-8 py-2 ml-auto mt-6 rounded connect-bg w-fit">Detail</div>
      </Link>
    </div>
  );
};

export default ResultCard;
