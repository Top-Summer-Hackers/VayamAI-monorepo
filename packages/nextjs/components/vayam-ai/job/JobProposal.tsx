import React, { useContext } from "react";
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters, useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import truncateEthAddress from "truncate-eth-address";
import { approveProposal } from "~~/api/vayam-ai/proposal";
import VayamAIContext from "~~/context/context";
import { ProposalItem } from "~~/types/vayam-ai/Proposal";

interface JobProposalProps {
  id: string;
  freelancerAddr: string;
  clientAddr: string;
  accepted: boolean;
  price: number;
  isAcceptedAlready: boolean;
  proposal: ProposalItem;
  refetchProposals: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined,
  ) => Promise<QueryObserverResult<any, unknown>>;
}

const JobProposal = ({
  id,
  refetchProposals,
  isAcceptedAlready,
  accepted,
  freelancerAddr,
  price,
  clientAddr,
}: JobProposalProps) => {
  const queryClient = useQueryClient();
  const { userType, clientKeccak256, authenticationCredentials } = useContext(VayamAIContext);

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const approveProposalMutation = useMutation({
    mutationFn: approveProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobProposal"] });
      queryClient.invalidateQueries({ queryKey: ["ProviderDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["ClientDashboard"] });
      toast.success("Approved proposal!");
      refetchProposals();
    },
    onError: (error: any) => {
      toast.error(error.response.data.message);
    },
  });

  /*************************************************************
   * Component functions
   ************************************************************/
  function handleAcceptProposal() {
    approveProposalMutation.mutate(id);
  }

  return (
    <div className="grid grid-cols-3 cursor-pointer">
      <div className="flex items-center justify-start gap-2">
        <div>
          <img src="/job_detail/avatar.png" alt="avatar" className="w-12 h-12" />
        </div>
        <div>{truncateEthAddress(freelancerAddr)}</div>
      </div>
      <div className="flex flex-col justify-center w-full h-full ">${price}</div>
      {userType == clientKeccak256 &&
      authenticationCredentials.id != "" &&
      authenticationCredentials.id == clientAddr ? (
        isAcceptedAlready ? (
          <button className="cursor-not-allowed flex flex-col justify-center w-fit rounded-full px-5 h-fit font-semibold py-2 border border-primary">
            {accepted ? "Accepted" : "Accept"}
          </button>
        ) : (
          <button
            onClick={handleAcceptProposal}
            className="flex flex-col justify-center w-fit rounded-full px-5 h-fit font-semibold py-2 connect-bg"
          >
            {approveProposalMutation.isLoading ? "Loading" : accepted ? "Accepted" : "Accept"}
          </button>
        )
      ) : (
        <div className="flex flex-col justify-center w-full h-full ">{accepted ? "Accepted" : "Not Accepted Yet"}</div>
      )}
    </div>
  );
};

export default JobProposal;

// freelancerAddr == address && accepted == true ? (
// <div
//   onClick={() => setIsCreateDealPopUp(true)}
//   className="flex flex-col justify-center w-fit rounded-full px-5 h-fit font-semibold py-2 connect-bg"
// >
//   Create Deal
// </div>
// ) :
