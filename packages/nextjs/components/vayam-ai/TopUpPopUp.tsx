import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils.js";
import { toast } from "react-hot-toast";
import { useDeployedContractInfo, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

interface MyModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  InvoiceAddr: string;
  tokenAddr: string;
}
export default function MyModal({ isOpen, setIsOpen, InvoiceAddr, tokenAddr }: MyModalProps) {
  const [amount, setAmount] = useState(0);

  /*************************************************************
   * Contract interaction
   ************************************************************/
  const { data: USDCContract } = useDeployedContractInfo("USDC");

  const { writeAsync: transferUSDC } = useScaffoldContractWrite({
    contractName: "USDC",
    functionName: "transfer",
    args: [InvoiceAddr, amount && (parseEther(amount.toString()) as unknown as BigNumber)] as readonly [
      string | undefined,
      BigNumber | undefined,
    ],
    onSuccess: () => {
      closeModal();
      setAmount(0);
      toast.success("Top Up Successfully!");
    },
  });
  const { writeAsync: transferDAI } = useScaffoldContractWrite({
    contractName: "DAI",
    functionName: "transfer",
    args: [InvoiceAddr, amount && (parseEther(amount.toString()) as unknown as BigNumber)] as readonly [
      string | undefined,
      BigNumber | undefined,
    ],
    onSuccess: () => {
      closeModal();
      setAmount(0);
      toast.success("Top Up Successfully!");
    },
  });

  /*************************************************************
   * Component functions
   ************************************************************/
  function closeModal() {
    setIsOpen(false);
  }

  function handleTopUp() {
    if (tokenAddr == USDCContract?.address) {
      transferUSDC();
    } else {
      transferDAI();
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
                  <div className="mx-auto w-fit bg-black rounded-full">
                    <img src="/register/clip.png" alt="" className="w-10 h-10" />
                  </div>
                  <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-center">
                    Top Up
                  </Dialog.Title>
                  {/* clip */}

                  <div>
                    <div className="mt-5 w-full">
                      <input
                        onChange={e => setAmount(parseInt(e.target.value))}
                        value={amount}
                        type="number"
                        name="amount"
                        placeholder="Amount to top up"
                        className="font-semibold w-full rounded-full border border-primary outline-none bg-transparent text-base px-4 py-2"
                      />
                    </div>
                  </div>
                  <div
                    onClick={handleTopUp}
                    className="select-none mt-10 text-base cursor-pointer font-semibold w-full connect-bg rounded-full py-3 text-center"
                  >
                    Submit
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
