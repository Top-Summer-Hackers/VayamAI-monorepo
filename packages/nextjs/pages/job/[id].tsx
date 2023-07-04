import React, { useContext, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IoMdAdd } from "react-icons/io";
import { useAccount } from "wagmi";
import { getAllDeals } from "~~/api/vayam-ai/deal";
import { getAllProposals, getProposal } from "~~/api/vayam-ai/proposal";
import { getAllTasks } from "~~/api/vayam-ai/tasks";
import { CreateDealPopUp, Loading, SubmitProposalPopUp } from "~~/components/vayam-ai";
import SomethingWentWrong from "~~/components/vayam-ai/SomethingWentWrong";
import { JobMilestoneList, JobOngoingDeal, JobProposal } from "~~/components/vayam-ai/job";
import VayamAIContext from "~~/context/context";
import { Deal } from "~~/types/vayam-ai/Deals";
import { Milestone, ProposalItem } from "~~/types/vayam-ai/Proposal";
import { TaskItem } from "~~/types/vayam-ai/Task";

const JobDetail = () => {
  const router = useRouter();
  const { address: walletAddress } = useAccount();

  const { userType, freelancerKeccak256, authenticationCredentials } = useContext(VayamAIContext);
  const queryClient = useQueryClient();

  const { id } = router.query;

  const [isSubmitProposalOpen, setIsSubmitProposalOpen] = useState(false);
  const [taskDetail, setTaskDetail] = useState<TaskItem>({
    bounty: 0,
    client_id: "",
    deadline: "",
    description: "",
    id: "",
    proposals_id: [],
    skills: [],
    start_time: "",
    title: "",
  });
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [currentDeal, setCurrentDeal] = useState<Deal>({
    address: "",
    client_id: "",
    freelancer_id: "",
    id: "",
    price: 0,
    proposal_id: "",
    status: "",
    task_id: "",
  });
  const [selectedProposal, setSelectedProposal] = useState("-1");
  const [isCreateDealPopUp, setIsCreateDealPopUp] = useState(false);
  const [isHadAcceptedProposal, setIsHadAcceptedProposal] = useState(false);

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const allTasksQuery = useQuery({
    refetchOnMount: true,
    queryKey: ["jobDetail", id],
    queryFn: () => getAllTasks(),
    onSuccess: data => {
      const jobDetail = data.tasks.find((task: TaskItem) => task.id == id);
      setTaskDetail(jobDetail);
    },
  });
  const allProposalsQuery = useQuery({
    refetchOnMount: true,
    queryKey: ["JobDetail", "jobProposal", id],
    queryFn: () => getAllProposals(),
    onSuccess: data => {
      const proposals = data.proposals.filter((proposal: ProposalItem) => proposal.task_id == id);
      const isAccepted = proposals.find((proposal: ProposalItem) => proposal.accepted == true);
      setProposals(proposals);
      setIsHadAcceptedProposal(isAccepted);
      if (proposals.length > 0) {
        console.log(proposals);
        // queryClient.invalidateQueries({ queryKey: ["proposalDetailQuery"] });
        setSelectedProposal(proposals[0].id);
      }
    },
  });
  const proposalDetailQuery = useQuery({
    enabled: allProposalsQuery.isSuccess && selectedProposal != "-1",
    refetchOnMount: true,
    queryKey: ["JobDetail", "proposalDetailQuery", selectedProposal],
    queryFn: () => getProposal(selectedProposal),
    onSuccess: data => {
      setMilestones(data.data.detailed_proposal.milestones);
    },
  });
  const allDealsQuery = useQuery({
    refetchOnMount: true,
    queryKey: ["JobDetail", "allDeals", id],
    queryFn: () => getAllDeals(),
    onSuccess: data => {
      const deals = data.deals.filter((deal: Deal) => deal.task_id == id);
      setDeals(deals);
    },
  });

  /*************************************************************
   * Component functions
   ************************************************************/

  return (
    <div className="pb-10">
      <CreateDealPopUp
        dealId={currentDeal?.id}
        proposal={proposals.find(proposal => proposal.id == currentDeal.proposal_id)}
        clientAddr={currentDeal.client_id}
        isOpen={isCreateDealPopUp}
        setIsOpen={setIsCreateDealPopUp}
        dealsRefetch={allDealsQuery.refetch}
        milestones={milestones}
      />
      {allTasksQuery.isLoading || allProposalsQuery.isLoading || allDealsQuery.isLoading ? (
        <div className="w-fit mx-auto mt-10">
          <Loading />
        </div>
      ) : allTasksQuery.isError || allProposalsQuery.isError || allDealsQuery.isError ? (
        <SomethingWentWrong />
      ) : (
        <div className="px-5">
          <SubmitProposalPopUp
            refetchProposals={allProposalsQuery.refetch}
            clientId={taskDetail?.client_id}
            id={String(id)}
            isOpen={isSubmitProposalOpen}
            setIsOpen={setIsSubmitProposalOpen}
          />
          {/* job title */}
          <div className="flex items-center justify-between mt-5">
            <div className="text-3xl font-bold mt-5">{taskDetail?.title}</div>
            {userType != undefined &&
              userType == freelancerKeccak256 &&
              authenticationCredentials.id == walletAddress?.toString() && (
                <div
                  onClick={() => setIsSubmitProposalOpen(true)}
                  className="cursor-pointer flex-center gap-1 border border-primary rounded-full px-5 py-2"
                >
                  Submit Proposal <IoMdAdd />
                </div>
              )}
          </div>
          {/* time range + job description */}
          <div className="mt-5 font-semibold text-lg">
            <div>
              {taskDetail?.start_time} - {taskDetail?.deadline}
            </div>
            <div className="mt-1">{taskDetail?.description}</div>
          </div>
          {/* skills */}
          <div className="mt-5 w-full">
            <div className="flex justify-between items-start">
              <div className="max-w-[70%] flex flex-wrap gap-3">
                {taskDetail?.skills.map((skill, index) => (
                  <div key={skill + index} className="rounded border-2 border-white bg-[#2C2734] w-fit px-10 py-0.5">
                    {skill}
                  </div>
                ))}
              </div>
              <div>Bounty: {taskDetail?.bounty}</div>
            </div>
          </div>
          {/* milestones list + proposal list */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <h3 className="text-xl font-semibold">Milestone List</h3>
              {(proposalDetailQuery.isLoading || proposalDetailQuery.isRefetching) && selectedProposal != "-1" ? (
                <Loading />
              ) : (
                <div>
                  <JobMilestoneList milestones={milestones} />
                </div>
              )}
            </div>
            <div>
              <div>
                <h3 className="text-xl font-semibold">Submitted Proposal</h3>
                <div className="flex flex-col gap-2">
                  {proposals.map(proposal => (
                    <div
                      key={proposal.id}
                      onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ["proposalDetailQuery"] });
                        setSelectedProposal(proposal.id);
                      }}
                    >
                      <JobProposal
                        refetchProposals={allProposalsQuery.refetch}
                        proposal={proposal}
                        id={proposal.id}
                        isAcceptedAlready={isHadAcceptedProposal}
                        freelancerAddr={proposal.freelancer_id}
                        clientAddr={proposal.client_id}
                        accepted={proposal.accepted}
                        price={proposal.proposal_price}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <h3 className="text-xl font-semibold">Ongoing Deal</h3>
                <div className="flex flex-col gap-2">
                  {deals.map(deal => (
                    <div key={deal.id} /*onClick={() => setCurrentDeal(deal)}*/>
                      <JobOngoingDeal
                        deal={deal}
                        setIsCreateDealPopUp={setIsCreateDealPopUp}
                        setCurrentDeal={setCurrentDeal}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
