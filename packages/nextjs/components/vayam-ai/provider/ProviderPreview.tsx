import React, { useEffect, useState } from "react";
import { escrow } from "../../../constant/abi.json";
import Loading from "../Loading";
import { useQuery } from "@tanstack/react-query";
import { useContract, useProvider, useSigner } from "wagmi";
import { getAllDeals } from "~~/api/vayam-ai/deal";
import { Deal } from "~~/types/vayam-ai/Deals";
import { Proposal } from "~~/types/vayam-ai/Proposal";
import { TaskItem } from "~~/types/vayam-ai/Task";

interface TaskPreviewProps {
  item: {
    task: TaskItem;
    proposal: Proposal;
  };
}

const ProviderPreview = ({ item }: TaskPreviewProps) => {
  const { data: signer } = useSigner();
  const provider = useProvider();

  const [deal, setDeal] = useState<Deal>();
  const [numberOfReleased, setNumberOfReleased] = useState(0);
  const [milestoneAmounts, setMilestoneAmounts] = useState([]);
  const [isFetchingData, setIsFetchingData] = useState(false);

  /*************************************************************
   * Contract interaction
   ************************************************************/
  const escrowContract = useContract({
    address: (deal?.address as string) || "",
    abi: escrow,
    signerOrProvider: signer || provider,
  });

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const allDealsQuery = useQuery({
    queryKey: ["providerTaskPreviewDeal"],
    queryFn: () => getAllDeals(),
    onSuccess: data => {
      const dealRes = data.deals.find((deal: Deal) => deal.task_id == item.task.id);
      setDeal(dealRes);
    },
  });

  async function getInvoiceDetails() {
    setIsFetchingData(true);
    try {
      const amounts = await escrowContract?.getAmounts();
      const released = await escrowContract?.released();
      setMilestoneAmounts(amounts.length);
      setNumberOfReleased(released);
    } catch (error) {
      // toast.error("Get invoice details failed!");
    }
    setIsFetchingData(false);
  }

  useEffect(() => {
    getInvoiceDetails();
  }, [deal?.address]);

  return (
    <div>
      {allDealsQuery.isLoading || isFetchingData ? (
        <div className="w-fit mx-auto mt-5">
          <Loading />
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-semibold">
              {item.task.title} ({item.proposal.accepted ? "Accepted" : "Pending"})
            </div>
            {/* <div
                onClick={() => setIsReviewOpen(true)}
                className="font-semibold border border-primary px-7 py-1 rounded-lg cursor-pointer"
              >
                Rating
              </div> */}
          </div>
          <div className="text-lg">
            {item.task?.start_time} - {item.task?.deadline}
          </div>
          <div className="mt-5">{item.task?.description}</div>
          {/* Ongoing Deal */}
          <div className="mt-5">
            <div className="text-2xl font-semibold">Ongoing Deal</div>
            {/* progress bar */}
            <div className="mt-5">
              <div className="h-[10px] w-full bg-white rounded-full">
                <div
                  style={{
                    width: `${
                      parseInt(String(numberOfReleased)) == 0
                        ? 0
                        : (parseInt(String(numberOfReleased)) / parseInt(String(milestoneAmounts?.length))) * 100
                    }%`,
                  }}
                  className="h-[10px] bg-sideColor rounded-full"
                ></div>
              </div>
              <div>
                {milestoneAmounts?.map((amount, index) => {
                  return (
                    <div
                      key={parseInt(String(amount)) + index}
                      style={{
                        width: `${100 / parseInt(String(milestoneAmounts?.length))}%`,
                      }}
                      className="inline-block text-sideColor"
                    >
                      ${parseInt(String(amount))}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* milestones */}
            <div className="mt-5 text-2xl font-semibold">Proposed Milestones</div>
            <div></div>
            <div className="mt-3 flex flex-col gap-3">
              {item.proposal.milestones.map(proposal => (
                <div key={proposal.description} className="grid grid-cols-4 items-center">
                  <div>{proposal.description}</div>
                  <div className="text-sideColor">${proposal.price}</div>
                  <div className="place-self-start flex items-center gap-1">
                    <div className="cursor-pointer connect-bg text-center rounded-lg w-fit px-7 py-1">Submit</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderPreview;
