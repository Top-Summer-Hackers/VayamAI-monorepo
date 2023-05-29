import React from "react";
import { AiOutlineArrowRight } from "react-icons/ai";

const TaskList = () => {
  return (
    <div className="border-l-4 pl-3 border-sideColor">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-xl font-bold">Job title</div>
          <div className="font-semibold">time range - time range</div>
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

export default TaskList;
