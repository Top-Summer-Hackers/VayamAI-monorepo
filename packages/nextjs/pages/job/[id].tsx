import React from "react";
import { useRouter } from "next/router";
import { JobProposal } from "~~/components/vayam-ai/job";

const JobDetail = () => {
  const router = useRouter();
  const { keyword } = router.query;
  console.log(keyword);
  return (
    <div className="px-5">
      {/* job title */}
      <div className="text-3xl font-bold mt-5">Developer XXX - Job Title</div>
      {/* time range + job description */}
      <div className="mt-5 font-semibold text-lg">
        <div>Time range - time range</div>
        <div className="mt-1">
          Full job description here.Full job description here.Full job description here.Full job description here.Full
          job description here.Full job description here.
        </div>
      </div>
      {/* skills */}
      <div className="mt-5 w-full">
        <div className="flex justify-between items-start">
          <div className="max-w-[70%] flex flex-wrap gap-3">
            <div className="rounded border-2 border-white bg-[#2C2734] w-fit px-10 py-0.5">Skill</div>
            <div className="rounded border-2 border-white bg-[#2C2734] w-fit px-10 py-0.5">Skill</div>
            <div className="rounded border-2 border-white bg-[#2C2734] w-fit px-10 py-0.5">Skill</div>
            <div className="rounded border-2 border-white bg-[#2C2734] w-fit px-10 py-0.5">Skill</div>{" "}
            <div className="rounded border-2 border-white bg-[#2C2734] w-fit px-10 py-0.5">Skill</div>{" "}
            <div className="rounded border-2 border-white bg-[#2C2734] w-fit px-10 py-0.5">Skill</div>{" "}
            <div className="rounded border-2 border-white bg-[#2C2734] w-fit px-10 py-0.5">Skill</div>{" "}
            <div className="rounded border-2 border-white bg-[#2C2734] w-fit px-10 py-0.5">Skill</div>
          </div>
          <div>Bounty range ?? - ??</div>
        </div>
      </div>
      {/* milestones list + proposal list */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <h3 className="text-xl font-semibold">Milestone List</h3>
          <div>
            <div>Description 1 $??</div>
            <div>Description 1 $??</div>
            <div>Description 1 $??</div>
            <div>Description 1 $??</div>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Submitted Proposal</h3>
          <div className="flex flex-col gap-2">
            <JobProposal />
            <JobProposal />
            <JobProposal />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
