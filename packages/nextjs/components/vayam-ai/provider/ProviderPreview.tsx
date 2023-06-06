import React, { useEffect, useState } from "react";
import { escrow, token } from "../../../constant/abi.json";
import Loading from "../Loading";
import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { useAccount, useContract, useProvider, useSigner } from "wagmi";
import { getAllDeals } from "~~/api/vayam-ai/deal";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
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
  const { address } = useAccount();

  const { data: signer } = useSigner();
  const provider = useProvider();

  const [deal, setDeal] = useState<Deal>();
  const [numberOfReleased, setNumberOfReleased] = useState(0);
  const [milestoneAmounts, setMilestoneAmounts] = useState([]);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [tokenContractAddr, setTokenContractAddr] = useState("");
  const [invoiceBalance, setInvoiceBalance] = useState("-1");

  /*************************************************************
   * Contract interaction
   ************************************************************/
  const { data: USDCContract } = useDeployedContractInfo("USDC");
  const { data: DAIContract } = useDeployedContractInfo("DAI");

  const escrowContract = useContract({
    address: (deal?.address as string) || "",
    abi: escrow,
    signerOrProvider: signer || provider,
  });
  const tokenContract = useContract({
    address: (tokenContractAddr as string) || "",
    abi: token,
    signerOrProvider: signer || provider,
  });

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const allDealsQuery = useQuery({
    queryKey: ["providerTaskPreviewDeal", item.proposal.id],
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
      const milestone = await escrowContract?.milestone(); // get current milestone
      const token = await escrowContract?.token();
      setMilestoneAmounts(amounts);
      setNumberOfReleased(milestone);
      setTokenContractAddr(token);
      console.log(`${item.proposal.id}-${milestone}`);

      if (deal?.address) {
        const invoiceBalance = await tokenContract?.balanceOf(deal?.address);
        setInvoiceBalance(invoiceBalance);
      }
    } catch (error) {
      toast.error("Get invoice details failed!");
    }
    setIsFetchingData(false);
  }

  useEffect(() => {
    getInvoiceDetails();
  }, [tokenContractAddr, address, escrowContract, item]);

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
            {/* Ongoing Deal */}
            {item.proposal.accepted == true && milestoneAmounts?.length > 0 ? (
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
                          key={index}
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
                <div>
                  Total Value Locked:{" "}
                  {invoiceBalance != "-1" && invoiceBalance != undefined
                    ? ethers.utils.formatEther(
                        invoiceBalance != "-1" && invoiceBalance != undefined ? invoiceBalance : "0",
                      )
                    : "0"}
                  {tokenContractAddr == USDCContract?.address
                    ? "USDC"
                    : tokenContractAddr == DAIContract?.address
                    ? "DAI"
                    : ""}
                </div>
              </div>
            ) : (
              <div></div>
            )}
            {/* milestones */}
            <div className="mt-5 text-2xl font-semibold">Proposed Milestones</div>
            <div></div>
            <div className="mt-3 flex flex-col gap-3">
              {item.proposal.milestones.map((proposal, index) => (
                <div key={proposal.description} className="grid grid-cols-4 items-center">
                  <div>{proposal.description}</div>
                  <div className="text-sideColor">${proposal.price}</div>
                  {item.proposal.accepted &&
                    (index < numberOfReleased ? (
                      <div className="text-green-300 col-span-2 text-center w-fit px-7 py-1">Released</div>
                    ) : (
                      <div className="place-self-start flex items-center gap-1">
                        <div className="cursor-pointer connect-bg text-center rounded-lg w-fit px-7 py-1">Submit</div>
                      </div>
                    ))}
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
