import React from "react";
import { Proposal } from "~~/types/vayam-ai/Proposal";

interface ProposalListProp {
  proposal: Proposal;
}

const ProposalList = ({ proposal }: ProposalListProp) => {
  return (
    <div className="border-l-4 pl-3 border-sideColor">
      <div className="flex justify-between items-center">
        <div>
          <div className="cursor-pointer text-xl font-bold">Total Price: {proposal.price}</div>
          <div className="font-semibold">Number of milestones: {proposal.milestones_id.length}</div>
        </div>
      </div>
      {/* description */}
      <div className="mt-2 max-w-[80%] text-sm"></div>
    </div>
  );
};

export default ProposalList;
