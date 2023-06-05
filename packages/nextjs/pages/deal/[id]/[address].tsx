import React, { useContext, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { BigNumber } from "ethers";
import { toast } from "react-hot-toast";
import { IoIosAdd } from "react-icons/io";
import truncateEthAddress from "truncate-eth-address";
import { useAccount, useBalance } from "wagmi";
import { getAllDeals } from "~~/api/vayam-ai/deal";
import { getAllProposals } from "~~/api/vayam-ai/proposal";
import { Loading, TopUpPopUp } from "~~/components/vayam-ai";
import VayamAIContext from "~~/context/context";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { Deal } from "~~/types/vayam-ai/Deals";
import { Proposal, ProposalItem } from "~~/types/vayam-ai/Proposal";

const InvoiceDetail = () => {
  const router = useRouter();
  const { address: walletAddress } = useAccount();
  const { userType, clientKeccak256 } = useContext(VayamAIContext);

  const { id, address } = router.query;
  const { data } = useBalance({ address: address != undefined ? String(address) : "" });
  console.log(id, address);

  const [deal, setDeal] = useState<Deal>({
    address: "",
    client_id: "",
    freelancer_id: "",
    id: "-1",
    price: 0,
    proposal_id: "",
    status: "",
    task_id: "",
  });
  const [proposal, setProposal] = useState<Proposal>();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedMileStone, setSelectedMileStone] = useState(0);

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const dealQuery = useQuery({
    queryKey: ["deal", id],
    queryFn: () => getAllDeals(),
    onSuccess: data => {
      const res = data.deals.find((deal: Deal) => deal.id == id);
      setDeal(res);
    },
  });
  const proposalQuery = useQuery({
    queryKey: ["jobProposal", id],
    queryFn: () => getAllProposals(),
    onSuccess: data => {
      const proposal = data.proposals.find((proposal: ProposalItem) => proposal.id == deal.proposal_id);
      setProposal(proposal);
    },
    enabled: deal.id != "-1",
  });

  /*************************************************************
   * Contract interaction
   ************************************************************/
  const { writeAsync: releaseMilestone } = useScaffoldContractWrite({
    contractName: "EscrowImplementation",
    functionName: "release",
    args: [selectedMileStone as unknown as BigNumber] as readonly [BigNumber | undefined],
    onSuccess: () => {
      toast.success("Released Milestone!");
    },
  });
  const { data: invoice, isLoading: getInvoiceLoading } = useScaffoldContractRead({
    contractName: "VayamAI",
    functionName: "getInvoice",
    args: [address] as readonly [string | undefined],
    enabled: address != undefined,
  });
  const { data: numberOfMilestones, isLoading: numberOfMilestonesLoading } = useScaffoldContractRead({
    contractName: "EscrowImplementation",
    functionName: "milestone",
    enabled: address != undefined,
  });
  const { data: numberOfReleased, isLoading: numberOfReleasedLoading } = useScaffoldContractRead({
    contractName: "EscrowImplementation",
    functionName: "released",
    enabled: address != undefined,
  });
  const { data: milestoneAmounts, isLoading: milestoneAmountsLoading } = useScaffoldContractRead({
    contractName: "EscrowImplementation",
    functionName: "getAmounts",
    enabled: address != undefined,
  });

  /*************************************************************
   * Component functions
   ************************************************************/
  function handleRelease(index: number) {
    setSelectedMileStone(index);
    releaseMilestone();
  }

  // console.log(invoice);
  // console.log(deal);
  // console.log(proposal);
  console.log(milestoneAmounts);

  return (
    <div>
      {getInvoiceLoading ||
      dealQuery.isLoading ||
      proposalQuery.isLoading ||
      numberOfReleasedLoading ||
      numberOfMilestonesLoading ||
      milestoneAmountsLoading ? (
        <div className="w-fit mx-auto mt-10">
          <Loading />
        </div>
      ) : (
        <div>
          <TopUpPopUp tokenAddr={invoice?.token || ""} isOpen={isTopUpOpen} setIsOpen={setIsTopUpOpen} />
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold mt-5">
              Invoice between {truncateEthAddress(invoice?.client || "")} and{" "}
              {truncateEthAddress(invoice?.freelancer || "")}
            </div>
            {userType != undefined && userType == clientKeccak256 && invoice?.client == walletAddress ? (
              <div
                onClick={() => setIsTopUpOpen(true)}
                className="gap-1 flex items-center cursor-pointer mt-1 border border-primary px-4 py-1 rounded-full "
              >
                TopUp
                <IoIosAdd className="mt-0.5 text-white" />
              </div>
            ) : null}
          </div>
          <div className="flex mt-5">
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2">
                Acknowledge Status:{" "}
                {invoice?.isAcknowledged ? (
                  <div className="w-5 h-5">
                    <img src="/check.png" alt="" />
                  </div>
                ) : (
                  <div className="w-5 h-5">
                    <img src="/cross.png" alt="" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                Client Review Status:{" "}
                {invoice?.isClosedByClient ? (
                  <div className="w-5 h-5">
                    <img src="/check.png" alt="" />
                  </div>
                ) : (
                  <div className="w-5 h-5">
                    <img src="/cross.png" alt="" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                Freelancer Review Status:{" "}
                {invoice?.isClosedByClient ? (
                  <div className="w-5 h-5">
                    <img src="/check.png" alt="" />
                  </div>
                ) : (
                  <div className="w-5 h-5">
                    <img src="/cross.png" alt="" />
                  </div>
                )}
              </div>
              <div>Current Milestone: {numberOfMilestones == undefined ? "" : String(numberOfMilestones)}</div>
              <div>Released Milestones: {numberOfReleased == undefined ? "" : String(numberOfReleased)}</div>
              <div>Total Value Locked: {String(data?.value)}</div>
            </div>
          </div>
          <div>
            <div>
              <div className="text-2xl font-bold mt-10">Milestones</div>
              <div className="grid grid-cols-2 gap-10">
                <div className="mt-3 flex flex-col gap-5">
                  {proposal?.milestones.map((milestone, index) => (
                    <div key={milestone.description + index} className="border-l-2 pl-3 border-sideColor">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{milestone.description}</div>
                          <div>Deadline: {milestone.deadline}</div>
                          <div>Price: {milestone.price}</div>
                        </div>
                        {userType != undefined &&
                        userType == clientKeccak256 &&
                        invoice?.client == walletAddress &&
                        numberOfReleased &&
                        parseInt(String(numberOfReleased)) <= index ? (
                          <div
                            onClick={() => handleRelease(index)}
                            className="cursor-pointer connect-bg rounded-full px-3 py-1"
                          >
                            Release
                          </div>
                        ) : null}
                        {numberOfReleased && parseInt(String(numberOfReleased)) > index && (
                          <div className="text-green-300 px-3 py-1">Released</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="">
                    <div className="h-[10px] w-full bg-white rounded-full">
                      <div
                        style={{
                          width:
                            parseInt(String(numberOfReleased)) == 0
                              ? 0
                              : (parseInt(String(numberOfReleased)) / parseInt(String(numberOfMilestones))) * 100,
                        }}
                        className="h-[10px] bg-sideColor rounded-full"
                      ></div>
                    </div>
                    <div>
                      {milestoneAmounts?.map(amount => (
                        <div
                          key={parseInt(String(amount))}
                          style={{
                            width: parseInt(String(numberOfMilestones)) / 100,
                          }}
                          className="inline-block"
                        >
                          ${parseInt(String(amount))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;
