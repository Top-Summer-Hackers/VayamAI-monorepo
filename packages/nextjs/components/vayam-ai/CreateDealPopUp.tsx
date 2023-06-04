import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters, useMutation } from "@tanstack/react-query";
import { BigNumber } from "ethers";
import { ethers } from "ethers";
import keccak256 from "keccak256";
import { toast } from "react-hot-toast";
import { updateDeal } from "~~/api/vayam-ai/deal";
import { useDeployedContractInfo, useScaffoldContractWrite, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import { ProposalItem } from "~~/types/vayam-ai/Proposal";

interface MyModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  clientAddr: string;
  proposal: ProposalItem | undefined;
  dealId: string;
  dealsRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined,
  ) => Promise<QueryObserverResult<any, unknown>>;
}

export default function MyModal({ dealId, proposal, clientAddr, isOpen, setIsOpen, dealsRefetch }: MyModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState("usdc");
  const [duration, setDuration] = useState(0);

  /*************************************************************
   * Contract interaction
   ************************************************************/
  const { data: USDCContract } = useDeployedContractInfo("USDC");
  const { data: DAIContract } = useDeployedContractInfo("DAI");

  useScaffoldEventSubscriber({
    contractName: "SmartInvoiceFactory",
    eventName: "LogNewInvoice",
    listener: (index, address, amounts, type, version) => {
      console.log(amounts, type, version);
      console.log(index, address);
      updateInvoiceAddrMutation.mutate({
        dealId: dealId,
        invoiceAddr: address,
      });
    },
  });

  const { writeAsync: createDeal, isLoading: createDealLoading } = useScaffoldContractWrite({
    contractName: "VayamAI",
    functionName: "createDeal",
    args: [
      clientAddr,
      selectedCurrency == "usdc" ? USDCContract?.address : DAIContract?.address,
      (duration * 24 * 60 * 60) as unknown as BigNumber,
      ("0x" + keccak256(``).toString("hex")) as `0x${string}`,
      proposal?.milestones.map(
        milestone => ethers.utils.parseEther(milestone.price.toString()) as unknown as BigNumber,
      ),
    ] as readonly [
      string | undefined,
      string | undefined,
      BigNumber | undefined,
      `0x${string}` | undefined,
      readonly BigNumber[] | undefined,
    ],
    onSuccess: async data => {
      console.log(data);
      const result = await data.wait();
      console.log(result);
      setIsOpen(false);
      dealsRefetch();
    },
  });

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const updateInvoiceAddrMutation = useMutation({
    mutationFn: updateDeal,
    onSuccess: () => {
      toast.success("Updated Deal!");
    },
    onError: (error: any) => {
      toast.error(error.response.data.message);
    },
  });

  /*************************************************************
   * Component functions
   ************************************************************/
  function closeModal() {
    setIsOpen(false);
  }

  function handleCreateDeal() {
    if (duration <= 0) {
      toast.error("Please enter a valid duration!");
    } else {
      createDeal();
    }
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto font-priori">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-tertiary text-white py-8 px-12 text-left align-middle shadow-xl transition-all">
                  {/* clip */}
                  <div className="mx-auto w-fit bg-black rounded-full px-2 py-2">
                    <img src="/review_icon.png" alt="" className="w-7 h-7" />
                  </div>
                  <Dialog.Title as="h3" className="mt-5 text-2xl font-medium leading-6 text-center">
                    Create Deal
                  </Dialog.Title>
                  <div className="mt-6">
                    {/* roles selection-provider/client */}
                    <div className="select-none w-full rounded-full grid grid-cols-2 overflow-hidden border border-primary">
                      <div
                        onClick={() => setSelectedCurrency("usdc")}
                        className={`font-semibold text-center cursor-pointer py-2 ${
                          selectedCurrency === "usdc" ? "connect-bg" : ""
                        }`}
                      >
                        USDC
                      </div>
                      <div
                        onClick={() => setSelectedCurrency("dai")}
                        className={`font-semibold text-center cursor-pointer py-2 ${
                          selectedCurrency === "dai" ? "connect-bg" : ""
                        }`}
                      >
                        DAI
                      </div>
                    </div>
                  </div>
                  <div className="mt-5">
                    {/* client addr */}
                    <div className="w-full">
                      <label htmlFor="client_id" className="pl-3 ">
                        Client Address
                      </label>
                      <input
                        disabled
                        value={clientAddr}
                        type="text"
                        name="client_id"
                        placeholder="Email Address / Username"
                        className="font-semibold w-full rounded-full border border-primary outline-none bg-transparent text-base px-4 py-2"
                      />
                    </div>
                    {/* duration */}
                    <div className="mt-2 w-full">
                      <label htmlFor="client_id" className="pl-3 ">
                        Duration
                      </label>
                      <input
                        onChange={e => setDuration(parseInt(e.target.value))}
                        // value={duration}
                        type="number"
                        name="duration"
                        min={"1"}
                        placeholder="Duration for the deal (in day)"
                        className="font-semibold w-full rounded-full border border-primary outline-none bg-transparent text-base px-4 py-2"
                      />
                    </div>
                    {/* amounts */}
                    <div className="mt-2 w-full">
                      <label htmlFor="client_id" className="pl-3 ">
                        Amount
                      </label>
                      <div className="font-semibold w-full rounded-lg border border-primary outline-none bg-transparent text-base px-4 py-2">
                        {proposal?.milestones.map((milestone, index) => (
                          <div key={milestone.description + index} className="flex items-center gap-2">
                            <div>{index + 1}.</div>
                            <div>
                              {milestone.description} (${milestone.price})
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-xl">
                    <div className="flex justify-center items-center gap-5"></div>
                    {/* submit */}
                    <div
                      onClick={handleCreateDeal}
                      className="select-none mt-10 text-base cursor-pointer font-semibold w-full connect-bg rounded-full py-3 text-center"
                    >
                      {createDealLoading ? "Loading..." : "Create"}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
