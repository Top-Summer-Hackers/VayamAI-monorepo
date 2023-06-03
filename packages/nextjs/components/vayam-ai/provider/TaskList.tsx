import React from "react";
import Link from "next/link";
import { AiOutlineArrowRight } from "react-icons/ai";
import { TaskItem } from "~~/types/vayam-ai/Task";

interface TaskList {
  task: TaskItem;
}

const TaskList = ({ task }: TaskList) => {
  return (
    <div className="border-l-4 pl-3 border-sideColor">
      <div className="flex justify-between items-center">
        <div>
          <div className="cursor-pointer text-xl font-bold">{task?.title}</div>
          <div className="font-semibold">
            {task?.start_time} - {task?.deadline}
          </div>
        </div>
        <Link href={`/job/${task?.id}`} className="cursor-pointer flex items-center gap-0.5 text-sm text-sideColor">
          View More Detail
          <AiOutlineArrowRight />
        </Link>
      </div>
      {/* description */}
      <div className="mt-2 max-w-[80%] text-sm">{task?.description}</div>
    </div>
  );
};

export default TaskList;
