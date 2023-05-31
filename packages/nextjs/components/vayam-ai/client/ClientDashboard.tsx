import React, { useState } from "react";
import { RatingPopUp } from "..";
import { TaskList } from "~~/components/vayam-ai/provider";

const ClientDashboard = () => {
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  return (
    <div className="px-5">
      <RatingPopUp isOpen={isReviewOpen} setIsOpen={setIsReviewOpen} />
      {/* job title */}
      <div className="text-3xl font-bold mt-5">Task List (Client)</div>
      <div className="relative mt-5 w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* list of tasks */}
        <div className="lg:after:absolute lg:after:left-[50%] lg:after:-translate-x-[50%] lg:after:content-[''] lg:after:h-full lg:after:w-[2px] lg:after:bg-white flex flex-col gap-8">
          <TaskList />
          <TaskList />
          <TaskList />
        </div>
        {/* preview */}
        <div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-semibold">Job Title</div>
            <div
              onClick={() => setIsReviewOpen(true)}
              className="font-semibold border border-primary px-7 py-1 rounded-lg cursor-pointer"
            >
              Rating
            </div>
          </div>
          <div className="text-lg">time range - time range</div>
          <div className="mt-5">
            Full job description here.Full job description here.Full job description here.Full job description here.
          </div>
          {/* Pending Review */}
          <div className="mt-5">
            <div className="text-2xl font-semibold">Pending Review</div>
            {/* milestones */}
            <div className="mt-3 flex flex-col gap-3">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
