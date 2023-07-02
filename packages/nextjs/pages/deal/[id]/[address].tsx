import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { escrow, token } from "../../../constant/abi.json";
import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { AiOutlineLink } from "react-icons/ai";
import { IoIosAdd } from "react-icons/io";
import truncateEthAddress from "truncate-eth-address";
import { useAccount, useContract, useProvider, useSigner } from "wagmi";
import { getAllDeals } from "~~/api/vayam-ai/deal";
import { getAllProposals, getProposal } from "~~/api/vayam-ai/proposal";
import { Loading, SubmitMilestoneLink, TopUpPopUp } from "~~/components/vayam-ai";
import VayamAIContext from "~~/context/context";
import { useDeployedContractInfo, useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { Deal } from "~~/types/vayam-ai/Deals";
import { Milestone, Proposal, ProposalItem } from "~~/types/vayam-ai/Proposal";

const InvoiceDetail = () => {
  const router = useRouter();
  const { address: walletAddress } = useAccount();
  const { userType, clientKeccak256, freelancerKeccak256 } = useContext(VayamAIContext);
  const { data: signer } = useSigner();
  const provider = useProvider();

  const { id, address } = router.query;

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
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestoneAmounts, setMilestoneAmounts] = useState([]);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isSubmitLinkOpen, setIsSubmitLinkOpen] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [currentMileStone, setCurrentMilestone] = useState(0);
  const [numberOfReleased, setNumberOfReleased] = useState(0);
  const [tokenContractAddr, setTokenContractAddr] = useState("");
  const [invoiceBalance, setInvoiceBalance] = useState("-1");
  const [submitLinkDetail, setSubmitLinkDetail] = useState({
    milestoneId: "",
    proposalId: "",
  });

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const dealQuery = useQuery({
    refetchOnMount: true,
    queryKey: ["DealDetail", "deal", id],
    queryFn: () => getAllDeals(),
    onSuccess: data => {
      const res = data.deals.find((deal: Deal) => deal.id == id);
      setDeal(res);
    },
  });
  const proposalQuery = useQuery({
    refetchOnMount: true,
    queryKey: ["DealDetail", "jobProposal", id],
    queryFn: () => getAllProposals(),
    onSuccess: data => {
      const proposal = data.proposals.find((proposal: ProposalItem) => proposal.id == deal.proposal_id);
      setProposal(proposal);
    },
    enabled: deal?.id != "-1",
  });
  const proposalDetailQuery = useQuery({
    refetchOnMount: true,
    queryKey: ["DealDetail", "proposalDetailDealPageQuery", proposal?.id],
    enabled: proposalQuery.isSuccess,
    queryFn: () => getProposal(proposal?.id || ""),
    onSuccess: data => {
      console.log(data);
      setMilestones(data.data.detailed_proposal.milestones);
    },
  });

  /*************************************************************
   * Contract interaction
   ************************************************************/
  const { data: USDCContract } = useDeployedContractInfo("USDC");
  const { data: DAIContract } = useDeployedContractInfo("DAI");

  const escrowContract = useContract({
    address: (address as string) || "",
    abi: escrow,
    signerOrProvider: signer || provider,
  });
  const tokenContract = useContract({
    address: (tokenContractAddr as string) || "",
    abi: token,
    signerOrProvider: signer || provider,
  });

  async function getInvoiceDetails() {
    setIsFetchingData(true);
    try {
      const amounts = await escrowContract?.getAmounts();
      const milestone = await escrowContract?.milestone(); // get current milestone
      const token = await escrowContract?.token();
      setCurrentMilestone(milestone);
      setMilestoneAmounts(amounts);
      setNumberOfReleased(milestone);
      setTokenContractAddr(token);

      const invoiceBalance = await tokenContract?.balanceOf(address);
      setInvoiceBalance(invoiceBalance);
    } catch (error) {
      toast.error("Get invoice details failed!");
    }
    setIsFetchingData(false);
  }

  async function releaseMilestone(index: number) {
    try {
      const res = await escrowContract?.release(index, { gasLimit: 1000000 });
      await res.wait();
      await getInvoiceDetails();
      toast.success("Released Milestone!");
    } catch (error) {
      toast.error("Release milestone failed!");
    }
  }

  const { data: invoice, isLoading: getInvoiceLoading } = useScaffoldContractRead({
    contractName: "VayamAI",
    functionName: "getInvoice",
    args: [address] as readonly [string | undefined],
    enabled: address != undefined,
  });

  /*************************************************************
   * Component functions
   ************************************************************/
  function handleRelease(index: number) {
    releaseMilestone(index);
  }

  // Invoke when freelancer whant to submit proof of work link file
  function handleSubmitMilestoneLink() {
    setIsSubmitLinkOpen(true);
  }

  useEffect(() => {
    getInvoiceDetails();
  }, [tokenContractAddr, walletAddress, escrowContract]);

  return (
    <div>
      {getInvoiceLoading ||
      dealQuery.isLoading ||
      proposalQuery.isLoading ||
      isFetchingData ||
      proposalDetailQuery.isLoading ? (
        <div className="w-fit mx-auto mt-10">
          <Loading />
        </div>
      ) : (
        <div>
          <TopUpPopUp
            getInvoiceDetails={getInvoiceDetails}
            tokenAddr={invoice?.token || ""}
            InvoiceAddr={(address as string) || ""}
            isOpen={isTopUpOpen}
            setIsOpen={setIsTopUpOpen}
          />
          <SubmitMilestoneLink
            submitLinkDetail={submitLinkDetail}
            isOpen={isSubmitLinkOpen}
            setIsOpen={setIsSubmitLinkOpen}
          />
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
            <div className="mt-2 grid grid-cols-2 lg:grid-cols-3 gap-2">
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
              <div>Total Milestones: {milestoneAmounts == undefined ? "" : String(milestoneAmounts.length)}</div>
              <div>Released Milestones: {numberOfReleased == undefined ? "" : String(numberOfReleased)}</div>
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
          </div>
          <div>
            <div className="mt-10 pb-32 lg:pb-24">
              <div className="text-2xl font-bold hidden lg:grid grid-cols-2 mb-2">
                <div>Milestones</div>
                <div>Deal Progress</div>
              </div>
              <div className="text-2xl font-bold lg:hidden mb-2">Milestones</div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="mt-3 flex flex-col gap-5">
                  {milestones.map((milestone, index) => (
                    <div
                      key={milestone.deadline + index + milestone.description}
                      className="border-l-2 pl-3 border-sideColor"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold flex">
                            {milestone.description}{" "}
                            {milestone.link != "" &&
                            (deal.client_id == walletAddress || deal.freelancer_id == walletAddress) ? (
                              <a
                                href={`${milestone.link.slice(0, milestone.link.indexOf(":") + 1)}${milestone.link
                                  .slice(milestone.link.indexOf(":") + 1)
                                  .replaceAll(":", "/")}`}
                                target="_blank"
                                className="cursor-pointer ml-1 flex items-center gap-1"
                                rel="noreferrer"
                              >
                                (&nbsp;Work Submitted{" "}
                                <div>
                                  <AiOutlineLink className="text-xl mt-0.5" />
                                </div>
                                )
                              </a>
                            ) : null}
                          </div>
                          <div>Deadline: {milestone.deadline}</div>
                          <div>Price: {milestone.price}</div>
                        </div>
                        {userType != undefined &&
                        userType == clientKeccak256 &&
                        invoice?.client == walletAddress &&
                        invoice?.isAcknowledged &&
                        currentMileStone &&
                        parseInt(String(currentMileStone)) == index ? (
                          <div
                            onClick={() => handleRelease(index)}
                            className="cursor-pointer connect-bg rounded-full px-3 py-1"
                          >
                            Release
                          </div>
                        ) : null}
                        {userType != undefined &&
                        userType == freelancerKeccak256 &&
                        invoice?.freelancer == walletAddress &&
                        invoice?.isAcknowledged &&
                        currentMileStone &&
                        milestone.link == "" &&
                        parseInt(String(currentMileStone)) == index ? (
                          <div
                            onClick={() => {
                              handleSubmitMilestoneLink();
                              setSubmitLinkDetail({ milestoneId: milestone.id, proposalId: proposal!.id! });
                            }}
                            className="cursor-pointer connect-bg rounded-full px-3 py-1"
                          >
                            Submit
                          </div>
                        ) : null}
                        {parseInt(String(numberOfReleased)) <= index &&
                          milestone.link != "" &&
                          deal.freelancer_id == walletAddress && (
                            <div className="text-green-300 px-3 py-1">Submitted</div>
                          )}
                        {numberOfReleased && parseInt(String(numberOfReleased)) > index && (
                          <div className="text-green-300 px-3 py-1">Released</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-2xl font-bold lg:hidden mb-2">Deal Progress</div>
                  <div>
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
