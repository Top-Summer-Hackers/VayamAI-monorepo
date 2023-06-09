import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
// import { useMutation } from "@tanstack/react-query";
import keccak256 from "keccak256";
import { toast } from "react-hot-toast";
import { AiFillStar } from "react-icons/ai";
// import { useAccount } from "wagmi";
// import { submitReview } from "~~/api/vayam-ai/review";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

interface MyModalProps {
  isOpen: boolean;
  invoiceAddress: string;
  taskId: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MyModal({ /*taskId*/ invoiceAddress, isOpen, setIsOpen }: MyModalProps) {
  // const { address } = useAccount();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  /*************************************************************
   * Contract interaction
   ************************************************************/
  const { writeAsync: closeDeal, isLoading: closeDealLoading } = useScaffoldContractWrite({
    contractName: "VayamAI",
    functionName: "closeDeal",
    args: [invoiceAddress, ("0x" + keccak256(reviewText).toString("hex")) as `0x${string}`, rating] as readonly [
      string | undefined,
      `0x${string}` | undefined,
      number | undefined,
    ],
    onSuccess: () => {
      toast.success("Closed!");
      closeModal();
      // registerAsClientMutation.mutate({
      //   review: {
      //     freelancer_id: address!,
      //     id: taskId,
      //     review: reviewText,
      //     star: rating,
      //   },
      // });
    },
  });

  /*************************************************************
   * Backend interaction
   ************************************************************/
  // const registerAsClientMutation = useMutation({
  //   mutationFn: submitReview,
  //   onSuccess: () => {
  //     toast.success("Closed!");
  //     closeModal();
  //   },
  //   onError: (error: any) => {
  //     toast.error(error.response.data.message);
  //   },
  // });
  /*************************************************************
   * Component functions
   ************************************************************/
  function closeModal() {
    setRating(0);
    setReviewText("");
    setIsOpen(false);
  }

  const handleMouseOver = (index: number) => {
    setHoveredRating(index + 1);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const handleClick = (index: number) => {
    setRating(index + 1);
    console.log("Rating saved:", index + 1);
  };

  function handleSubmitClick() {
    if (reviewText.trim() == "") {
      toast.error("Please enter some review text!");
    } else {
      closeDeal();
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
                    Review
                  </Dialog.Title>

                  <div className="text-xl mt-6">
                    <div className="flex justify-center items-center gap-5">
                      {[...Array(5)].map((_, index) => (
                        <div
                          key={index}
                          className={`cursor-pointer ${
                            index < (hoveredRating || rating) ? "text-primary" : "text-gray-400"
                          }`}
                          onMouseOver={() => handleMouseOver(index)}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => handleClick(index)}
                        >
                          <AiFillStar className="text-2xl" />
                        </div>
                      ))}
                    </div>
                    <div className="w-full mt-5">
                      <label htmlFor="review">Review</label>
                      <textarea
                        onChange={e => setReviewText(e.target.value)}
                        value={reviewText}
                        name="review"
                        placeholder="Enter your review here"
                        className="font-semibold w-full rounded-lg border border-primary outline-none bg-transparent text-base px-4 py-2"
                      />
                    </div>
                    {/* submit */}
                    <div
                      onClick={handleSubmitClick}
                      className="select-none mt-10 text-base cursor-pointer font-semibold w-full connect-bg rounded-full py-3 text-center"
                    >
                      {closeDealLoading ? "Loading..." : "Submit"}
                      {/* {closeDealLoading || registerAsClientMutation.isLoading ? "Loading..." : "Submit"} */}
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
