import React, { useState } from "react";
import Loading from "../Loading";
import SomethingWentWrong from "../SomethingWentWrong";
import ProviderPreview from "./ProviderPreview";
import ProviderTaskList from "./ProviderTaskList";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { getAllProposals } from "~~/api/vayam-ai/proposal";
import { getAllTasks } from "~~/api/vayam-ai/tasks";
import { Proposal } from "~~/types/vayam-ai/Proposal";
import { TaskItem } from "~~/types/vayam-ai/Task";

const ProviderDashboard = () => {
  const { address } = useAccount();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [items, setItems] = useState<
    {
      task: TaskItem;
      proposal: Proposal;
    }[]
  >([]);
  const [currentItem, setCurrentItem] = useState<{
    task: TaskItem;
    proposal: Proposal;
  }>({
    proposal: {
      client_id: "",
      freelancer_id: "",
      milestones_id: [],
      task_id: "",
      accepted: false,
      price: 0,
      id: "",
    },
    task: {
      bounty: 0,
      client_id: "",
      deadline: "",
      description: "",
      id: "",
      proposals_id: [],
      skills: [],
      start_time: "",
      title: "",
    },
  });

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const allProposalsQuery = useQuery({
    queryKey: ["providerProposal", address],
    queryFn: () => getAllProposals(),
    onSuccess: data => {
      const proposals = data.proposals.filter((proposal: Proposal) => proposal.freelancer_id == address);
      setProposals(proposals);
    },
  });
  const allTasksQuery = useQuery({
    queryKey: ["jobDetail", address],
    queryFn: () => getAllTasks(),
    onSuccess: data => {
      const lists: {
        task: TaskItem;
        proposal: Proposal;
      }[] = [];
      proposals.map(proposal => {
        const task = data.tasks.find((task: TaskItem) => task.id == proposal.task_id);
        lists.push({
          proposal,
          task,
        });
      });
      if (lists.length > 0) {
        setCurrentItem(lists[0]);
      }
      setItems(lists);
    },
    enabled: allProposalsQuery.isSuccess,
  });

  return (
    <div className="px-5">
      {/* job title */}
      {allProposalsQuery.isLoading || allTasksQuery.isLoading ? (
        <div className="w-fit mx-auto mt-10">
          <Loading />
        </div>
      ) : (
        <div>
          <div className="text-3xl font-bold mt-5">Task List (Provider)</div>
          {items.length <= 0 ? (
            <div>
              {" "}
              <SomethingWentWrong title="No submitted proposal yet" />
            </div>
          ) : (
            <div className="relative mt-5 w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* list of tasks */}
              <div className="lg:after:absolute lg:after:left-[50%] lg:after:-translate-x-[50%] lg:after:content-[''] lg:after:h-full lg:after:w-[2px] lg:after:bg-white flex flex-col gap-8">
                {items.map(item => (
                  <div key={item.proposal.id} onClick={() => setCurrentItem(item)}>
                    <ProviderTaskList item={item} />
                  </div>
                ))}
              </div>
              {/* preview */}
              <div>
                <ProviderPreview item={currentItem} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
