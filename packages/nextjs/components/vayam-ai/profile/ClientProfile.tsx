import React, { useState } from "react";
import Loading from "../Loading";
import CompletedJob from "./CompletedJob";
import { useQuery } from "@tanstack/react-query";
import { IoLocationOutline } from "react-icons/io5";
import { useAccount } from "wagmi";
import { getAllDeals } from "~~/api/vayam-ai/deal";
import { getAllClients } from "~~/api/vayam-ai/profile";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { Deal } from "~~/types/vayam-ai/Deals";
import { User } from "~~/types/vayam-ai/User";

interface ClientProfileProps {
  clientAddr: string;
}

const ClientProfile = ({ clientAddr }: ClientProfileProps) => {
  const { address } = useAccount();

  const [user, setUser] = useState<User>({
    description: "",
    id: "",
    role: "",
    tasks_id: [],
    user_name: "",
  });
  const [deals, setDeals] = useState<Deal[]>([]);

  /*************************************************************
   * Contract interaction
   ************************************************************/
  const { data: userScore, isLoading: userScoreLoading } = useScaffoldContractRead({
    contractName: "VayamAI",
    functionName: "userScore",
    args: [clientAddr] as readonly [string | undefined],
    enabled: clientAddr != undefined,
  });
  const { data: invoicesNoReviewCount, isLoading: invoicesNoReviewCountLoading } = useScaffoldContractRead({
    contractName: "VayamAI",
    functionName: "invoicesNoReviewCount",
    args: [clientAddr] as readonly [string | undefined],
    enabled: clientAddr != undefined,
  });
  const { data: closedInvoicesCount, isLoading: closedInvoicesCountLoading } = useScaffoldContractRead({
    contractName: "VayamAI",
    functionName: "closedInvoicesCount",
    args: [clientAddr] as readonly [string | undefined],
    enabled: clientAddr != undefined,
  });
  const { data: balanceOf, isLoading: balanceOfLoading } = useScaffoldContractRead({
    contractName: "VayamAI",
    functionName: "balanceOf",
    args: [clientAddr] as readonly [string | undefined],
    enabled: clientAddr != undefined,
  });

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const allClientsQuery = useQuery({
    queryKey: ["allClient", clientAddr],
    queryFn: () => getAllClients(),
    onSuccess: data => {
      const userRes = data.users.find((user: User) => user.id == clientAddr);

      if (userRes) {
        setUser(userRes);
      }
    },
  });
  const allDealsQuery = useQuery({
    queryKey: ["dealProfile", address],
    queryFn: () => getAllDeals(),
    onSuccess: data => {
      const deals = data.deals.filter((deal: Deal) => deal.client_id == address);
      console.log(deals);
      setDeals(deals);
    },
    enabled: address != undefined,
  });

  return (
    <div className="pb-24">
      {allClientsQuery.isLoading ||
      allDealsQuery.isLoading ||
      invoicesNoReviewCountLoading ||
      closedInvoicesCountLoading ||
      balanceOfLoading ||
      userScoreLoading ? (
        <div className="flex-center mt-10">
          <Loading />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row">
          <div className="px-5 flex flex-col items-center">
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
              {deals && deals?.length <= 0 ? (
                <div className="mt-2">No Completed Job Yet!</div>
              ) : (
                <div className="mt-3 flex flex-col gap-5">
                  {deals?.map(deal => (
                    <CompletedJob key={deal.address} deal={deal} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfile;
