import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ApprovePopUp, RatingPopUp } from "..";
import { escrow } from "../../../constant/abi.json";
import { toast } from "react-hot-toast";
import truncateEthAddress from "truncate-eth-address";
import { useAccount, useContract, useProvider, useSigner } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { Deal } from "~~/types/vayam-ai/Deals";

interface JobOngoingDealProps {
  deal: Deal;
  setIsCreateDealPopUp: React.Dispatch<React.SetStateAction<boolean>>;
}

const JobOngoingDeal = ({ deal, setIsCreateDealPopUp }: JobOngoingDealProps) => {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const provider = useProvider();

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [terminationTime, setTerminationTime] = useState("0");

  /*************************************************************
   * Contract interaction
   ************************************************************/
  const { data: invoice } = useScaffoldContractRead({
    contractName: "VayamAI",
    functionName: "getInvoice",
    args: [deal.address] as readonly [string | undefined],
    enabled: deal.address != "0x0",
  });

  const { writeAsync: acknowledgeDeal, isLoading: acknowledgeDealLoading } = useScaffoldContractWrite({
    contractName: "VayamAI",
    functionName: "acknowledgeDeal",
    args: [deal.address] as readonly [string | undefined],
    onSuccess: () => {
      toast.success("Acknowledged!");
    },
  });
  const escrowContract = useContract({
    address: (deal?.address as string) || "",
    abi: escrow,
    signerOrProvider: signer || provider,
  });
  async function getInvoiceDetails() {
    try {
      if (escrowContract) {
        const terminationTime = await escrowContract?.terminationTime();
        setTerminationTime(String(terminationTime));
      }
    } catch (error) {
      // console.log(error);
      // toast.error("Get invoice details failed!");
    }
  }

  /*************************************************************
   * Component functions
   ************************************************************/
  function handleAcknowledge() {
    if (isApproved) {
      acknowledgeDeal();
    } else {
      setIsApproveOpen(true);
    }
  }

  function handleCloseDeal() {
    setIsRatingOpen(true);
  }

  console.log("DEBUGGing", invoice);

  useEffect(() => {
    getInvoiceDetails();
  }, [address, escrowContract]);

  return (
    <div>
      <div className="w-full grid grid-cols-3">
        <RatingPopUp invoiceAddress={deal.address} isOpen={isRatingOpen} setIsOpen={setIsRatingOpen} />
        <ApprovePopUp
          setIsApproved={setIsApproved}
          amount={deal?.price ?? ""}
          invoiceAddr={deal?.address ?? ""}
          tokenAddr={invoice?.token ?? ""}
          isOpen={isApproveOpen}
          setIsOpen={setIsApproveOpen}
        />
        <div>
          <div className="flex items-center justify-start gap-2">
            <div>
              <img src="/job_detail/avatar.png" alt="avatar" className="w-12 h-12" />
            </div>
            <div>{truncateEthAddress(deal.freelancer_id)}</div>
          </div>
        </div>
        <div className="flex flex-col justify-center w-full h-full ">${deal.price}</div>
        <div>
          {/* show create deal */}
          {deal.freelancer_id == address && deal.address == "0x0" ? (
            <div
              onClick={() => {
                setIsCreateDealPopUp(true);
              }}
              className="mt-1 cursor-pointer flex flex-col justify-center w-fit rounded-full px-5 h-fit font-semibold py-1 connect-bg"
            >
              Create Deal
            </div>
          ) : null}
          {/* show waiting for acknowledge */}
          {deal.freelancer_id == address && deal.address != "0x0" && invoice?.isAcknowledged == false ? (
            <div className="text-sm mt-1 flex flex-col justify-center w-fit rounded-full px-5 h-fit font-semibold py-1 connect-bg">
              Waiting Acknowledge
            </div>
          ) : null}
          {/* show acknowledge button for client */}
          {deal.client_id == address && deal.address != "0x0" && invoice?.isAcknowledged == false ? (
            <div
              onClick={handleAcknowledge}
              className="cursor-pointer text-sm mt-1 flex flex-col justify-center w-fit rounded-full px-5 h-fit font-semibold py-1 connect-bg"
            >
              {acknowledgeDealLoading ? "Loading..." : "Acknowledge"}
            </div>
          ) : null}
          {/* show close deal button or deal ongoing word */}
          {(terminationTime != "0" &&
            parseInt(String(terminationTime)) > Date.now() &&
            deal.freelancer_id == address &&
            deal.address != "0x0" &&
            invoice?.isAcknowledged == true &&
            invoice?.isClosedByFreelancer == false) ||
          (terminationTime != "0" &&
            parseInt(String(terminationTime)) > Date.now() &&
            deal.client_id == address &&
            deal.address != "0x0" &&
            invoice?.isAcknowledged == true &&
            invoice?.isClosedByClient == false) ? (
            <div
              onClick={handleCloseDeal}
              className="text-green cursor-pointer text-sm mt-1 flex flex-col justify-center w-fit rounded-full px-5 h-fit font-semibold py-1 connect-bg"
            >
              Close Deal
            </div>
          ) : null}

          {(terminationTime != "0" &&
            parseInt(String(terminationTime)) < Date.now() &&
            deal.freelancer_id == address &&
            deal.address != "0x0" &&
            invoice?.isAcknowledged == true &&
            invoice?.isClosedByFreelancer == false) ||
          (terminationTime != "0" &&
            parseInt(String(terminationTime)) < Date.now() &&
            deal.client_id == address &&
            deal.address != "0x0" &&
            invoice?.isAcknowledged == true &&
            invoice?.isClosedByClient == false) ? (
            <div className="text-green-300 flex flex-col justify-center w-full h-full font-semibold">Deal Ongoing</div>
          ) : null}

          {/* show review completed word*/}
          {deal.client_id == address &&
          deal.address != "0x0" &&
          invoice?.isAcknowledged == true &&
          invoice?.isClosedByClient == true ? (
            <div className="text-green-300 flex flex-col justify-center w-full h-full font-semibold">
              Review Completed
            </div>
          ) : null}
          {deal.freelancer_id == address &&
          deal.address != "0x0" &&
          invoice?.isAcknowledged == true &&
          invoice?.isClosedByFreelancer == true ? (
            <div className="text-green-300 flex flex-col justify-center w-full h-full font-semibold">
              Review Completed
            </div>
          ) : null}
        </div>
      </div>
      {deal.address != "0x0" && (deal.freelancer_id == address || deal.client_id == address) && (
        <Link href={`/deal/${deal.id}/${deal.address}`} className="text-sideColor text-sm cursor-pointer">
          View Incoive
        </Link>
      )}
    </div>
  );
};

export default JobOngoingDeal;
