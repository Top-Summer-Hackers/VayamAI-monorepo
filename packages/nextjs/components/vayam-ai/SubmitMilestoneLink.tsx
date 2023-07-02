import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { submitMilestoneFileLink } from "~~/api/vayam-ai/milestone";

interface MyModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  submitLinkDetail: {
    milestoneId: string;
    proposalId: string;
  };
}
export default function MyModal({ isOpen, setIsOpen, submitLinkDetail }: MyModalProps) {
  const queryClient = useQueryClient();

  const [link, setLink] = useState("");

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const submitMilestoneLinkkMutation = useMutation({
    mutationFn: submitMilestoneFileLink,
    onSuccess: data => {
      console.log(data);
      closeModal();
      setLink("");
      queryClient.invalidateQueries({ queryKey: ["DealDetail"] });
    },
    onError: () => {
      toast.error("Submit link failed!");
    },
  });

  /*************************************************************
   * Component functions
   ************************************************************/
  function closeModal() {
    setIsOpen(false);
  }

  function handleSubmitLink() {
    if (link.trim() === "") {
      toast.error("Link cannot be empty!");
    } else {
      submitMilestoneLinkkMutation.mutate({
        link: link.replaceAll("/", ":"),
        milestoneId: submitLinkDetail.milestoneId,
        proposalId: submitLinkDetail.proposalId,
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
                  <div className="mx-auto w-fit bg-black rounded-full">
                    <img src="/register/clip.png" alt="" className="w-10 h-10" />
                  </div>
                  <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-center">
                    Submit File Link
                  </Dialog.Title>
                  {/* clip */}

                  <div>
                    <div className="mt-5 w-full">
                      <input
                        onChange={e => setLink(e.target.value)}
                        value={link}
                        name="link"
                        placeholder="Put the link here..."
                        className="font-semibold w-full rounded-full border border-primary outline-none bg-transparent text-base px-4 py-2"
                      />
                    </div>
                  </div>
                  <div
                    onClick={handleSubmitLink}
                    className="select-none mt-10 text-base cursor-pointer font-semibold w-full connect-bg rounded-full py-3 text-center"
                  >
                    {submitMilestoneLinkkMutation.isLoading ? "Loading..." : "Submit"}
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
