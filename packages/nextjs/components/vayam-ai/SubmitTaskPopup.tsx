import { Fragment, useState } from "react";
import { submitNewTask } from "../../api/vayam-ai/tasks";
import { Dialog, Transition } from "@headlessui/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Datepicker from "react-tailwindcss-datepicker";
import { DateValueType } from "react-tailwindcss-datepicker/dist/types";
import { useAccount, useMutation } from "wagmi";

interface MyModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MyModal({ isOpen, setIsOpen }: MyModalProps) {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const [taskInformation, setTaskInformation] = useState({
    title: "",
    start_time: "",
    deadline: "",
    description: "",
    skills: "",
    bounty: 0,
  });
  const [dateTimeForJob, setDateTimeForJob] = useState<DateValueType>({
    startDate: "",
    endDate: "",
  });

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const submitNewTaskMutation = useMutation({
    mutationFn: submitNewTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      setTaskInformation({
        title: "",
        start_time: "",
        deadline: "",
        description: "",
        skills: "",
        bounty: 0,
      });
      setDateTimeForJob({
        startDate: "",
        endDate: "",
      });
      setIsOpen(false);
      toast.success("Submitted a new Job!");
    },
    onError: (error: any) => {
      toast.error(error.response.data.message);
    },
  });

  /*************************************************************
   * Component functions
   ************************************************************/
  const handleDateChange = (newValue: DateValueType) => {
    console.log("newValue:", newValue);
    setDateTimeForJob(newValue);
  };

  function closeModal() {
    setIsOpen(false);
  }

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTaskInformation(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleSubmitTask() {
    if (
      dateTimeForJob?.startDate === "" ||
      dateTimeForJob?.endDate === "" ||
      taskInformation.title === "" ||
      taskInformation.description === "" ||
      taskInformation.skills.length <= 0 ||
      taskInformation.bounty < 0
    ) {
      toast.error("Please enter valid value!");
    } else {
      try {
        const dates = {
          start_time: String(dateTimeForJob!.startDate).replaceAll("-", "/"),
          deadline: String(dateTimeForJob!.endDate).replaceAll("-", "/"),
        };
        const submitData = {
          ...dates,
          title: taskInformation.title,
          description: taskInformation.description,
          skills: taskInformation.skills.split(","),
          bounty: taskInformation.bounty & 0xffff, //u16
          client_id: address,
        };
        submitNewTaskMutation.mutate({ taskInfo: submitData });
        console.log(submitData);
      } catch (error) {
        toast.error("Please ensure that you have all the information in correct format!");
      }
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
                  <div className="mx-auto w-fit bg-black rounded-full px-2 py-2">
                    <img src="/review_icon.png" alt="" className="w-7 h-7" />
                  </div>
                  <Dialog.Title as="h3" className="mt-5 text-2xl font-medium leading-6 text-center">
                    Add a JOB
                  </Dialog.Title>

                  <div className="flex flex-col gap-3 text-xl mt-6">
                    <div className="w-full">
                      <input
                        value={taskInformation.title}
                        onChange={handleOnChange}
                        type="text"
                        name="title"
                        placeholder="Job Title"
                        className="font-semibold w-full rounded-full border border-primary outline-none bg-transparent text-base px-4 py-2"
                      />
                    </div>
                    <div className="w-full">
                      <input
                        value={taskInformation.description}
                        onChange={handleOnChange}
                        type="text"
                        name="description"
                        placeholder="Job Description"
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
                      <input
                        value={taskInformation.skills}
                        onChange={handleOnChange}
                        type="text"
                        name="skills"
                        placeholder="Skills Required (solidity,typescript,...)"
                        className="font-semibold w-full rounded-full border border-primary outline-none bg-transparent text-base px-4 py-2"
                      />
                    </div>
                    <div className="w-full">
                      <input
                        value={taskInformation.bounty}
                        onChange={handleOnChange}
                        type="number"
                        name="bounty"
                        placeholder="Bounty Given"
                        className="font-semibold w-full rounded-full border border-primary outline-none bg-transparent text-base px-4 py-2"
                      />
                    </div>
                    {/* submit */}
                    <div
                      onClick={handleSubmitTask}
                      className="select-none mt-10 text-base cursor-pointer font-semibold w-full connect-bg rounded-full py-3 text-center"
                    >
                      {submitNewTaskMutation.isLoading ? "Loading..." : "Submit"}
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
