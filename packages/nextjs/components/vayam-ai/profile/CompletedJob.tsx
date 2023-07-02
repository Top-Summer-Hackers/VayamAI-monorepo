import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AiOutlineArrowRight } from "react-icons/ai";
import { getAllTasks } from "~~/api/vayam-ai/tasks";
import { Deal } from "~~/types/vayam-ai/Deals";
import { TaskItem } from "~~/types/vayam-ai/Task";

interface CompletedJob {
  deal: Deal;
}

const CompletedJob = ({ deal }: CompletedJob) => {
  const [jobDetail, setJobDetail] = useState<TaskItem>();

  const allTasksQuery = useQuery({
    queryKey: ["completedJob", deal],
    queryFn: () => getAllTasks(),
    onSuccess: data => {
      const jobDetail = data.tasks.find((task: TaskItem) => task.id == deal.task_id);
      setJobDetail(jobDetail);
    },
  });

  return (
    <div>
      {!allTasksQuery.isLoading ? (
        <div className="border-l-4 pl-3 border-sideColor">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xl font-bold">{jobDetail?.title}</div>
              {/* <div className="font-semibold flex items-center">
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
              </div> */}
            </div>
            <Link
              href={`/job/${jobDetail?.id}`}
              className="cursor-pointer flex items-center gap-0.5 text-sm text-sideColor"
            >
              View More Detail
              <AiOutlineArrowRight />
            </Link>
          </div>
          {/* description */}
          <div className="mt-2 max-w-[80%] text-sm">{jobDetail?.description}</div>
        </div>
      ) : null}
    </div>
  );
};

export default CompletedJob;
