import React from "react";
import { TaskList } from "~~/components/vayam-ai/provider";

const ProviderDashboard = () => {
  return (
    <div className="px-5">
      {/* job title */}
      <div className="text-3xl font-bold mt-5">Task List</div>
      <div className="relative mt-5 w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* list of tasks */}
        <div className="lg:after:absolute lg:after:left-[50%] lg:after:-translate-x-[50%] lg:after:content-[''] lg:after:h-full lg:after:w-[2px] lg:after:bg-white flex flex-col gap-8">
          <TaskList />
          <TaskList />
          <TaskList />
        </div>
        {/* preview */}
        <div>
          <div className="text-2xl font-semibold">Job Title</div>
          <div className="text-lg">time range - time range</div>
          <div className="mt-5">
            Full job description here.Full job description here.Full job description here.Full job description here.
          </div>
          {/* upcoming milestones */}
          <div className="mt-5">
            <div className="text-2xl font-semibold">Upcoming milestone</div>
            {/* milestones */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
