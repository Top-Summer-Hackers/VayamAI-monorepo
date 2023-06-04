import React, { useState } from "react";
import { Loading } from "..";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { getAllTasks } from "~~/api/vayam-ai/tasks";
import { TaskList } from "~~/components/vayam-ai/provider";
import { TaskItem } from "~~/types/vayam-ai/Task";

const ClientDashboard = () => {
  const { address } = useAccount();
  // const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [clientTasks, setClientTasks] = useState<TaskItem[]>([]);
  const [currentTask, setCurrentTask] = useState<TaskItem>({
    title: "",
    start_time: "",
    deadline: "",
    description: "",
    bounty: 0,
    client_id: "",
    id: "",
    proposals_id: [],
    skills: [],
  });

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const allTasksQuery = useQuery({
    queryKey: ["jobDetail", address],
    queryFn: () => getAllTasks(),
    onSuccess: data => {
      const jobs = data.tasks.filter((task: TaskItem) => task.client_id == address);
      setClientTasks(jobs);
      if (jobs.length > 0) {
        setCurrentTask(jobs[0]);
      }
      console.log(jobs);
    },
  });

  return (
    <div className="px-5">
      {/* <RatingPopUp isOpen={isReviewOpen} setIsOpen={setIsReviewOpen} /> */}
      {/* job title */}
      <div className="text-3xl font-bold mt-5">Task List (Client)</div>
      {allTasksQuery.isLoading ? (
        <div className="w-fit mx-auto mt-10">
          <Loading />
        </div>
      ) : (
        <div className="relative mt-5 w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* list of tasks */}
          <div className="lg:after:absolute lg:after:left-[50%] lg:after:-translate-x-[50%] lg:after:content-[''] lg:after:h-full lg:after:w-[2px] lg:after:bg-white flex flex-col gap-8">
            {clientTasks.map(task => (
              <div key={task.id} onClick={() => setCurrentTask(task)}>
                <TaskList key={task.id} task={task} />
              </div>
            ))}
          </div>
          {/* preview */}
          <div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-semibold"></div>
              {/* <div
                onClick={() => setIsReviewOpen(true)}
                className="font-semibold border border-primary px-7 py-1 rounded-lg cursor-pointer"
              >
                Rating
              </div> */}
            </div>
            <div className="text-lg">
              {currentTask?.start_time} - {currentTask?.deadline}
            </div>
            <div className="mt-5">{currentTask?.description}</div>
            {/* Pending Review */}
            <div className="mt-5">
              {/* <div className="text-2xl font-semibold">Pending Review</div> */}
              {/* milestones */}
              {/* <div className="mt-3 flex flex-col gap-3">
                <div className="grid grid-cols-4 items-center">
                  <div>Job description</div>
                  <div className="text-sideColor">$xxx</div>
                  <div className="place-self-start flex items-center gap-1">
                    <div className="col-span-2 cursor-pointer text-center rounded-lg w-fit px-7 py-1 border border-primary">
                      View
                    </div>
                    <div className="cursor-pointer connect-bg text-center rounded-lg w-fit px-7 py-1">Confirm</div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
