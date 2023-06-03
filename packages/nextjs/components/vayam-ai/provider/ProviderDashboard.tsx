import React, { useState } from "react";
import Loading from "../Loading";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { getAllProposals } from "~~/api/vayam-ai/proposal";
import { ProposalList } from "~~/components/vayam-ai/provider";
import { Proposal } from "~~/types/vayam-ai/Proposal";

const ProviderDashboard = () => {
  const { address } = useAccount();

  const [currentProposap, setCurrentProposal] = useState<Proposal>();
  const [proposals, setProposals] = useState<Proposal[]>([]);

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const allProposalsQuery = useQuery({
    queryKey: ["providerProposal", address],
    queryFn: () => getAllProposals(),
    onSuccess: data => {
      const proposals = data.proposals.filter((proposal: Proposal) => proposal.freelancer_id == address);
      setProposals(proposals);
      if (setCurrentProposal.length > 0) {
        setCurrentProposal(proposals[0]);
      }
      console.log(proposals);
    },
  });

  return (
    <div className="px-5">
      {/* job title */}
      {allProposalsQuery.isLoading ? (
        <div className="w-fit mx-auto mt-10">
          <Loading />
        </div>
      ) : (
        <div>
          <div className="text-3xl font-bold mt-5">Task List (Provider)</div>
          <div className="relative mt-5 w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* list of tasks */}
            <div className="lg:after:absolute lg:after:left-[50%] lg:after:-translate-x-[50%] lg:after:content-[''] lg:after:h-full lg:after:w-[2px] lg:after:bg-white flex flex-col gap-8">
              {proposals.map(proposal => (
                <div onClick={() => setCurrentProposal(proposal)} key={proposal.id}>
                  <ProposalList proposal={proposal} />
                </div>
              ))}
            </div>
            {/* preview */}
            <div>
              <div className="text-2xl font-semibold">Milestones</div>
              {/* <div className="text-lg">time range - time range</div> */}
              {currentProposap?.milestones?.map((milestone, index) => (
                <div key={milestone?.description + index} className="mt-3 flex flex-col gap-3">
                  <div className="grid grid-cols-3 items-center">
                    <div>{milestone?.description}</div>
                    <div className="text-sideColor">${milestone?.price}</div>
                    <div className="connect-bg text-center rounded-lg w-fit px-7 py-1 cursor-pointer">Submit</div>
                  </div>
                </div>
              ))}
              {/* upcoming milestones */}
              <div className="mt-5">
                <div className="text-2xl font-semibold">Add milestone</div>
                {/* milestones
            <div className="mt-3 flex flex-col gap-3">
              <div className="grid grid-cols-3 items-center">
                <div>Job description</div>
                <div className="text-sideColor">$xxx</div>
                <div className="connect-bg text-center rounded-lg w-fit px-7 py-1">Submit</div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <div>Job description</div>
                <div className="text-sideColor">$xxx</div>
                <div className="connect-bg text-center rounded-lg w-fit px-7 py-1">Submit</div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <div>Job description</div>
                <div className="text-sideColor">$xxx</div>
                <div className="connect-bg text-center rounded-lg w-fit px-7 py-1">Submit</div>
              </div>
            </div> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
