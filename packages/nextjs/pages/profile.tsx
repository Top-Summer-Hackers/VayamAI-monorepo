import React from "react";
import { IoLocationOutline } from "react-icons/io5";
import { CompletedJob } from "~~/components/vayam-ai/profile";

const Profile = () => {
  return (
    <div className="pb-24">
      <div className="flex flex-col lg:flex-row">
        <div className="px-5 flex flex-col items-center">
          <div>
            <img src="/job_detail/avatar.png" alt="" />
          </div>
          <div className="mt-2 font-bold text-2xl">BOWBOWZAI</div>
          <div className="my-5 flex-center gap-1">
            <IoLocationOutline />
            <div className="text-xs">Kuala Lumpur, Malaysia</div>
          </div>
          <div>xx developer</div>
          <div>23 years old</div>
          <div>Personal Info</div>
        </div>
        <div className="my-5 lg:mx-5 w-full h-[2px] lg:h-[80vh] lg:w-[2px] bg-white"></div>
        <div className="w-full">
          <div className="w-full place-items-center place-content-center grid grid-cols-4 gap-5">
            <div className="text-center">
              <div>Completed Projects</div>
              <div className="font-semibold">28</div>
            </div>
            <div className="text-center">
              <div>Pending Review</div>
              <div className="font-semibold">2/5</div>
            </div>
            <div className="text-center">
              <div>Rating</div>
              <div className="font-semibold">5/5</div>
            </div>
            <div className="text-center">
              <div>Followers</div>
              <div className="font-semibold">109</div>
            </div>
          </div>
          <div className="mt-10">
            <div className="text-2xl font-bold">Completed Jobs</div>
            <div className="mt-3 flex flex-col gap-5">
              <CompletedJob />
              <CompletedJob />
              <CompletedJob />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
