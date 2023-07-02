import React from "react";
import Link from "next/link";
import { AiOutlineArrowRight } from "react-icons/ai";
import { Proposal } from "~~/types/vayam-ai/Proposal";
import { TaskItem } from "~~/types/vayam-ai/Task";

interface ProviderTaskListTaskListProps {
  item: {
    task: TaskItem;
    proposal: Proposal;
  };
}

const ProviderTaskList = ({ item }: ProviderTaskListTaskListProps) => {
  return (
    <div className="border-l-4 pl-3 border-sideColor">
      <div className="flex justify-between items-center">
        <div>
          <div className="cursor-pointer text-xl font-bold">{item.task?.title}</div>
          <div className="font-semibold">
            {item.task?.start_time} - {item.task?.deadline}
          </div>
        </div>
        <Link
          href={`/job/${item.task?.id}`}
          className="cursor-pointer flex items-center gap-0.5 text-sm text-sideColor"
        >
          View More Detail
          <AiOutlineArrowRight />
        </Link>
      </div>
      {/* description */}
      <div className="mt-2 max-w-[80%] text-sm">{item.task?.description}</div>
      <div>{item.proposal.milestones_id.length} milestones</div>
    </div>
  );
};

export default ProviderTaskList;
