import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { BigNumber } from "ethers";
import { toast } from "react-hot-toast";
import truncateEthAddress from "truncate-eth-address";
import { useDeployedContractInfo, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

interface MyModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  amount: number | string;
  tokenAddr: string;
  invoiceAddr: string;
  setIsApproved: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MyModal({ setIsApproved, invoiceAddr, tokenAddr, amount, isOpen, setIsOpen }: MyModalProps) {
  /*************************************************************
   * Contract interaction
   ************************************************************/
  const { data: USDCContract } = useDeployedContractInfo("USDC");
  const { data: VayamAIContract } = useDeployedContractInfo("VayamAI");

  console.log("DEBUGGING:", amount);

  const { writeAsync: approveUSDC } = useScaffoldContractWrite({
    contractName: "USDC",
    functionName: "approve",
    args: [VayamAIContract?.address, amount as unknown as BigNumber] as readonly [
      string | undefined,
      BigNumber | undefined,
    ],
    onSuccess: () => {
      toast.success("Approved!");
      setIsApproved(true);
      setIsOpen(false);
    },
  });
  const { writeAsync: approveDAI } = useScaffoldContractWrite({
    contractName: "DAI",
    functionName: "approve",
    args: [VayamAIContract?.address, amount as unknown as BigNumber] as readonly [
      string | undefined,
      BigNumber | undefined,
    ],
    onSuccess: () => {
      toast.success("Approved!");
      setIsApproved(true);
      setIsOpen(false);
    },
  });

  /*************************************************************
   * Component functions
   ************************************************************/
  function closeModal() {
    setIsOpen(false);
  }

  function handleApprove() {
    if (tokenAddr == USDCContract?.address) {
      approveUSDC();
    } else {
      approveDAI();
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
                <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-tertiary text-white py-8 px-12 text-left align-middle shadow-xl transition-all">
                  {/* clip */}
                  <div className="mx-auto w-fit bg-black rounded-full">
                    <img src="/register/clip.png" alt="" className="w-10 h-10" />
                  </div>
                  <Dialog.Title as="h3" className="mt-5 text-2xl font-medium leading-6 text-center">
                    Approve {+amount / 10} {tokenAddr == USDCContract?.address ? "USDC" : "DAI"}
                  </Dialog.Title>
                  <div className="mt-5">
                    <div className="text-center text-xl font-light">
                      Approve to Vayam AI contract
                      <br /> {truncateEthAddress(invoiceAddr)}
                    </div>
                    <div className="mt-2 text-center text-xl font-light">
                      Approve from TOKEN {tokenAddr == USDCContract?.address ? "USDC" : "DAI"} <br />{" "}
                      {truncateEthAddress(tokenAddr)}
                    </div>
                  </div>
                  <div
                    onClick={handleApprove}
                    className="mt-4 connect-bg rounded px-4 py-1 w-fit cursor-pointer mx-auto"
                  >
                    Approve
                  </div>
                  <div
                    className="mt-5 flex p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400"
                    role="alert"
                  >
                    <svg
                      aria-hidden="true"
                      className="flex-shrink-0 inline w-5 h-5 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span className="sr-only">Info</span>
                    <div>
                      <span className="font-medium">Attention!</span> You are approving 10% of the total amount for the
                      deal.
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
