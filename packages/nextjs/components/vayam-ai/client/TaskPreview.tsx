import React, { useEffect, useState } from "react";
import { escrow } from "../../../constant/abi.json";
import Loading from "../Loading";
import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { useAccount, useContract, useProvider, useSigner } from "wagmi";
import { getAllDeals } from "~~/api/vayam-ai/deal";
import { Deal } from "~~/types/vayam-ai/Deals";
import { TaskItem } from "~~/types/vayam-ai/Task";

interface TaskPreviewProps {
  currentTask: TaskItem;
}

const TaskPreview = ({ currentTask }: TaskPreviewProps) => {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const provider = useProvider();

  const [deal, setDeal] = useState<Deal>();
  // const [currentMileStone, setCurrentMilestone] = useState(0);
  const [numberOfReleased, setNumberOfReleased] = useState(0);
  const [milestoneAmounts, setMilestoneAmounts] = useState([]);
  const [tokenContractAddr, setTokenContractAddr] = useState("");
  // const [invoiceBalance, setInvoiceBalance] = useState("-1");
  const [isFetchingData, setIsFetchingData] = useState(false);

  /*************************************************************
   * Contract interaction
   ************************************************************/
  const escrowContract = useContract({
    address: (deal?.address as string) || "",
    abi: escrow,
    signerOrProvider: signer || provider,
  });
  // const tokenContract = useContract({
  //   address: (tokenContractAddr as string) || "",
  //   abi: token,
  //   signerOrProvider: signer || provider,
  // });

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const allDealsQuery = useQuery({
    queryKey: ["clientTaskPreviewDeal"],
    queryFn: () => getAllDeals(),
    onSuccess: data => {
      const dealRes = data.deals.find((deal: Deal) => deal.task_id == currentTask.id);
      setDeal(dealRes);
    },
  });

  async function getInvoiceDetails() {
    console.log("CALL:getInvoiceDetails");
    setIsFetchingData(true);
    try {
      const amounts = await escrowContract?.getAmounts();
      const milestone = await escrowContract?.milestone(); // get current milestone
      const token = await escrowContract?.token();
      // setCurrentMilestone(milestone);
      setMilestoneAmounts(amounts);
      setNumberOfReleased(milestone);
      setTokenContractAddr(token);

      // const invoiceBalance = await tokenContract?.balanceOf(deal?.address);
      // setInvoiceBalance(invoiceBalance);
    } catch (error) {
      toast.error("Get invoice details failed!");
    }
    setIsFetchingData(false);
  }

  useEffect(() => {
    getInvoiceDetails();
  }, [deal?.address]);

  useEffect(() => {
    getInvoiceDetails();
  }, [tokenContractAddr, address, escrowContract]);

  return (
    <div>
      {allDealsQuery.isLoading || isFetchingData ? (
        <div className="w-fit mx-auto mt-5">
          <Loading />
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-semibold">{currentTask.title}</div>
            {/* <div
                onClick={() => setIsReviewOpen(true)}
                className="font-semibold border border-primary px-7 py-1 rounded-lg cursor-pointer"
              >
                Rating
              </div> */}
          </div>
          <div className="text-lg">
            {currentTask?.start_time} - {currentTask?.deadline}
          </div>
          <div className="mt-5">{currentTask?.description}</div>
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
                      ${ethers.utils.formatEther(String(amount))}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* milestones */}
            {/* <div className="mt-3 flex flex-col gap-3">
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
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPreview;
