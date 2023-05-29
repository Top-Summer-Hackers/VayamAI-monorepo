import React from "react";

const JobProposal = () => {
  return (
    <div className="grid grid-cols-2">
      <div className="flex items-center justify-start gap-2">
        <div>
          <img src="/job_detail/avatar.png" alt="avatar" className="w-12 h-12" />
        </div>
        <div>Milestone Proposal</div>
      </div>
      <div className="flex flex-col justify-center w-full h-full">Time</div>
    </div>
  );
};

export default JobProposal;
