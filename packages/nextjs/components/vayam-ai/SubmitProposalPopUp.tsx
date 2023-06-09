import { Fragment, useState } from "react";
import Loading from "./Loading";
import { Dialog, Transition } from "@headlessui/react";
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Datepicker from "react-tailwindcss-datepicker";
import { DateValueType } from "react-tailwindcss-datepicker/dist/types";
import { useAccount, useMutation } from "wagmi";
import { submitProposal } from "~~/api/vayam-ai/milestone";
import { formatDate } from "~~/utils/vayam-ai/convertDate";

type Milestone = {
  description: string;
  price: number;
  deadline: string;
};

interface MyModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
  clientId: string;
  refetchProposals: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined,
  ) => Promise<QueryObserverResult<any, unknown>>;
}

export default function MyModal({ refetchProposals, clientId, isOpen, setIsOpen, id }: MyModalProps) {
  const { address } = useAccount();

  const [dateTimeForJob, setDateTimeForJob] = useState<DateValueType>({
    startDate: "",
    endDate: "",
  });
  const [currentMilestone, setCurrentMilestone] = useState<Milestone>({
    deadline: "",
    description: "",
    price: -1,
  });
  const [allMilestone, setAllMilestone] = useState<Milestone[]>([]);

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const submitProposalMutation = useMutation({
    mutationFn: submitProposal,
    onSuccess: () => {
      toast.success("Submitted a new Proposal!");
      setAllMilestone([]);
      setDateTimeForJob({
        startDate: "",
        endDate: "",
      });
      setCurrentMilestone({
        deadline: "",
        description: "",
        price: 0,
      });
      setIsOpen(false);
      refetchProposals();
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
    setAllMilestone([]);
    setDateTimeForJob({
      startDate: "",
      endDate: "",
    });
    setCurrentMilestone({
      deadline: "",
      description: "",
      price: 0,
    });
  }

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCurrentMilestone(prev => ({
      ...prev,
      [e.target.name]: e.target.name == "price" ? parseFloat(e.target.value) : e.target.value,
    }));
  }

  const handleDateChange = (newValue: DateValueType) => {
    setDateTimeForJob(newValue);
    setCurrentMilestone(prev => ({
      ...prev,
      deadline: formatDate(String(newValue?.endDate)),
    }));
  };

  function handleAddMilestone() {
    console.log(currentMilestone);
    if (
      currentMilestone.deadline.trim() === "" ||
      currentMilestone.description.trim() === ""

      // ||
      // currentMilestone.price <= 0
    ) {
      toast.error("Please provide valid a milestone!");
      return false;
    } else {
      setAllMilestone(prev => [
        ...prev,
        {
          deadline: currentMilestone.deadline,
          description: currentMilestone.description,
          price: parseFloat(String(currentMilestone.price)),
        },
      ]);
      setCurrentMilestone({
        deadline: "",
        description: "",
        price: 0,
      });
      return true;
    }
  }

  function submitMilestone() {
    if (allMilestone.length <= 0 || address === undefined) {
      toast.error("Please add at least one milestone and make sure you connected with your wallet!");
    } else {
      console.log({
        task_id: id,
        freelancer_id: address!,
        milestones: allMilestone,
      });
      submitProposalMutation.mutate({
        proposal: {
          client_id: clientId,
          task_id: id,
          freelancer_id: address!,
          milestones: allMilestone,
        },
      });
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
                  <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-center">
                    Submit new Proposal
                  </Dialog.Title>
                  <div className="flex flex-col gap-3 mt-6">
                    <div className="w-full">
                      <input
                        onChange={handleOnChange}
                        value={currentMilestone.price <= -1 ? "" : currentMilestone.price}
                        type="number"
                        name="price"
                        placeholder="Price"
                        className="font-semibold w-full rounded-full border border-primary outline-none bg-transparent text-base px-4 py-2"
                      />
                    </div>
                    <div className="w-full font-semibold rounded-full border border-primary outline-none bg-transparent text-base px-4 py-2">
                      <Datepicker
                        value={dateTimeForJob}
                        onChange={handleDateChange}
                        inputClassName={"bg-transparent outline-none border-none text-white"}
                        placeholder="Start Time - Deadline"
                        minDate={Date()}
                      />
                    </div>

                    <div className="w-full">
                      <textarea
                        cols={10}
                        onChange={e =>
                          setCurrentMilestone(prev => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        name="description"
                        value={currentMilestone.description}
                        placeholder="Milestone Description"
                        className="font-semibold w-full rounded-xl border border-primary outline-none bg-transparent text-base px-4 py-2"
                      />
                    </div>
                  </div>
                  {submitProposalMutation.isLoading ? (
                    <div className="mx-auto mt-5 w-fit">
                      <Loading />
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-3">
                      {allMilestone.length > 0 ? (
                        <div
                          onClick={submitMilestone}
                          className="w-fit px-6 select-none mt-5 text-base cursor-pointer font-semibold connect-bg rounded-full py-2 text-center"
                        >
                          Submit
                        </div>
                      ) : null}
                      <div
                        onClick={handleAddMilestone}
                        className="w-fit px-6 select-none mt-5 text-base cursor-pointer font-semibold connect-bg rounded-full py-2 text-center"
                      >
                        Add
                      </div>
                    </div>
                  )}
                  <div className="text-sm text-primary mt-6">Added milestone {allMilestone.length}</div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
