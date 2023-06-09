import React, { useState } from "react";
import Loading from "../Loading";
import CompletedJob from "./CompletedJob";
import { useQuery } from "@tanstack/react-query";
import { IoLocationOutline } from "react-icons/io5";
import { getAllFreelancers } from "~~/api/vayam-ai/profile";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { User } from "~~/types/vayam-ai/User";

interface ProviderProfileProps {
  freelancerAddr: string;
}

const ProviderProfile = ({ freelancerAddr }: ProviderProfileProps) => {
  const [user, setUser] = useState<User>({
    description: "",
    id: "",
    role: "",
    tasks_id: [],
    user_name: "",
  });

  /*************************************************************
   * Contract interaction
   ************************************************************/
  const { data: invoicesNoReviewCount, isLoading: invoicesNoReviewCountLoading } = useScaffoldContractRead({
    contractName: "VayamAI",
    functionName: "invoicesNoReviewCount",
    args: [freelancerAddr] as readonly [string | undefined],
    enabled: freelancerAddr != undefined,
  });
  const { data: closedInvoicesCount, isLoading: closedInvoicesCountLoading } = useScaffoldContractRead({
    contractName: "VayamAI",
    functionName: "closedInvoicesCount",
    args: [freelancerAddr] as readonly [string | undefined],
    enabled: freelancerAddr != undefined,
  });
  const { data: userScore, isLoading: userScoreLoading } = useScaffoldContractRead({
    contractName: "VayamAI",
    functionName: "userScore",
    args: [freelancerAddr] as readonly [string | undefined],
    enabled: freelancerAddr != undefined,
  });
  const { data: balanceOf, isLoading: balanceOfLoading } = useScaffoldContractRead({
    contractName: "VayamAI",
    functionName: "balanceOf",
    args: [freelancerAddr] as readonly [string | undefined],
    enabled: freelancerAddr != undefined,
  });

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const allFreelancersQuery = useQuery({
    queryKey: ["allFreelancer", freelancerAddr],
    queryFn: () => getAllFreelancers(),
    onSuccess: data => {
      const userRes = data.users.find((user: User) => user.id == freelancerAddr);
      if (userRes) {
        setUser(userRes);
      }
    },
  });

  return (
    <div>
      {allFreelancersQuery.isLoading ||
      invoicesNoReviewCountLoading ||
      closedInvoicesCountLoading ||
      balanceOfLoading ||
      userScoreLoading ? (
        <div className="flex-center mt-10">
          <Loading />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row">
          <div className="lg:max-w-[300px] px-5 flex flex-col items-center">
            <div>
              <img src="/job_detail/avatar.png" alt="" />
            </div>
            <div className="mt-2 font-bold text-2xl text-center">{user?.user_name}</div>
            <div className="my-5 flex-center gap-1">
              <IoLocationOutline />
              <div className="text-xs text-center">Kuala Lumpur, Malaysia</div>
            </div>
            <div>{user?.role}</div>
            <div>23 years old</div>
            <div>{user?.description}</div>
          </div>
          <div className="my-5 lg:mx-5 w-full h-[2px] lg:h-[80vh] lg:w-[2px] bg-white"></div>
          <div className="w-full">
            <div className="w-full place-items-center place-content-center grid grid-cols-4 gap-5">
              <div className="text-center">
                <div>Completed Projects</div>
                <div className="font-semibold">{String(closedInvoicesCount)}</div>
              </div>
              <div className="text-center">
                <div>Pending Review</div>
                <div className="font-semibold">{String(invoicesNoReviewCount)}</div>
              </div>
              <div className="text-center">
                <div>5 Stars Rating</div>
                <div className="font-semibold">{String(userScore)}</div>
              </div>
              <div className="text-center">
                <div>Amount of Mentor NFT</div>
                <div className="font-semibold">{String(balanceOf)}</div>
              </div>
            </div>
            <div className="mt-10">
              <div className="text-2xl font-bold">Completed Jobs</div>
              {user?.tasks_id && user?.tasks_id?.length <= 0 ? (
                <div className="mt-2">No Completed Job Yet!</div>
              ) : (
                <div className="mt-3 flex flex-col gap-5">
                  <CompletedJob />
                  <CompletedJob />
                  <CompletedJob />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderProfile;
