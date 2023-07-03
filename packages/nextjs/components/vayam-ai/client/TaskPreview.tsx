import React, { useEffect, useState } from "react";
import { escrow, token } from "../../../constant/abi.json";
import Loading from "../Loading";
import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useAccount, useContract, useProvider, useSigner } from "wagmi";
import { getAllDeals } from "~~/api/vayam-ai/deal";
import { getAllProposals, getProposal } from "~~/api/vayam-ai/proposal";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { Deal } from "~~/types/vayam-ai/Deals";
import { Milestone, Proposal } from "~~/types/vayam-ai/Proposal";
import { TaskItem } from "~~/types/vayam-ai/Task";

interface TaskPreviewProps {
  currentTask: TaskItem;
}

const TaskPreview = ({ currentTask }: TaskPreviewProps) => {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const provider = useProvider();

  const [deal, setDeal] = useState<Deal>();
  const [proposal, setProposal] = useState<Proposal>();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [numberOfReleased, setNumberOfReleased] = useState(0);
  const [milestoneAmounts, setMilestoneAmounts] = useState([]);
  const [tokenContractAddr, setTokenContractAddr] = useState("");
  const [invoiceBalance, setInvoiceBalance] = useState("-1");
  const [isFetchingData, setIsFetchingData] = useState(false);

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
    refetchOnMount: true,
    queryKey: ["ClientDashboard", "clientTaskPreviewDeal", currentTask.id],
    queryFn: () => getAllDeals(),
    onSuccess: data => {
      const dealRes = data.deals.find((deal: Deal) => deal.task_id == currentTask.id);
      setDeal(dealRes);
    },
  });
  const allProposalsQuery = useQuery({
    enabled: allDealsQuery.isSuccess,
    refetchOnMount: true,
    queryKey: ["ClientDashboard", "previewProposal", currentTask.id],
    queryFn: () => getAllProposals(),
    onSuccess: data => {
      const res = data?.proposals.find((proposal: Proposal) => proposal.id == deal?.proposal_id);
      if (res) {
        setProposal(res);
      }
    },
  });
  const proposalDetailQuery = useQuery({
    enabled: allProposalsQuery.isSuccess,
    refetchOnMount: true,
    queryKey: ["ClientDashboard", "proposalDetailClientDashboardQuery", proposal?.id],
    queryFn: () => getProposal(proposal?.id || ""),
    onSuccess: data => {
      setMilestones(data.data.detailed_proposal.milestones);
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

      if (deal?.address) {
        const invoiceBalance = await tokenContract?.balanceOf(deal?.address);
        setInvoiceBalance(invoiceBalance);
      }
    } catch (error) {
      // toast.error("Get invoice details failed!");
    }
    setIsFetchingData(false);
  }

  useEffect(() => {
    getInvoiceDetails();
  }, [tokenContractAddr, address, escrowContract, currentTask]);

  return (
    <div>
      {allDealsQuery.isLoading || isFetchingData || allProposalsQuery.isLoading || proposalDetailQuery.isLoading ? (
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
          {milestoneAmounts?.length > 0 ? (
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
              {proposal != undefined && proposal.accepted == true /* milestones */ ? (
                <div className="mt-3 flex flex-col gap-3">
                  {milestones.map((milestone, index) => (
                    <div
                      key={milestone.description + milestone.deadline + milestone.price + index}
                      className="grid grid-cols-4 items-center"
                    >
                      <div>{milestone.description}</div>
                      <div className="text-sideColor">${milestone.price}</div>
                      <div className="place-self-start flex items-center gap-1">
                        {index < numberOfReleased ? (
                          <div className="text-green-300 col-span-2 text-center w-fit px-7 py-1">Released</div>
                        ) : (
                          <></>
                          // <Link
                          //   href={`/deal/${deal?.id}/${deal?.address}`}
                          //   className="col-span-2 cursor-pointer text-center rounded-lg w-fit px-7 py-1 border border-primary"
                          // >
                          //   View
                          // </Link>
                        )}
                        {/* <div className="cursor-pointer connect-bg text-center rounded-lg w-fit px-7 py-1">Confirm</div> */}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div></div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskPreview;
