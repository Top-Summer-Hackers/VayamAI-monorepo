import React from "react";
import { AiFillStar, AiOutlineArrowRight } from "react-icons/ai";

const CompletedJob = () => {
  return (
    <div className="border-l-4 pl-3 border-sideColor">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-xl font-bold">Job title</div>
          <div className="font-semibold flex items-center">
            <div
              className={`cursor-pointer 
                             text-sideColor
                          `}
            >
              <AiFillStar className="" />
            </div>
            <div
              className={`cursor-pointer 
                             text-sideColor
                          `}
            >
              <AiFillStar className="" />
            </div>
            <div
              className={`cursor-pointer 
                             text-sideColor
                          `}
            >
              <AiFillStar className="" />
            </div>
            <div
              className={`cursor-pointer 
                             text-transparent
                          `}
            >
              <AiFillStar className="" />
            </div>
          </div>
        </div>
        <div className="cursor-pointer flex items-center gap-0.5 text-sm text-sideColor">
          View More Detail
          <AiOutlineArrowRight />
        </div>
      </div>
      {/* description */}
      <div className="mt-2 max-w-[80%] text-sm">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta quidem rem amet quae quaerat sunt ipsam omnis
        excepturi nisi sed.
      </div>
    </div>
  );
};

export default CompletedJob;
