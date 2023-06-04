import { Fragment, useContext, useState } from "react";
import { registerAsFreelancer } from "../../api/vayam-ai/authentication";
import { Dialog, Transition } from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";
import { BigNumber } from "ethers";
import keccak256 from "keccak256";
import { toast } from "react-hot-toast";
import { useAccount } from "wagmi";
import VayamAIContext from "~~/context/context";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { RegisterAsProvider } from "~~/types/vayam-ai/RegisterAsProvider";

interface MyModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MyModal({ isOpen, setIsOpen }: MyModalProps) {
  const { address } = useAccount();

  const { userIdRefetch } = useContext(VayamAIContext);

  const [selectedRole, setSelectedRole] = useState("freelancer");
  const [authenticationInformation, setAuthenticationInformation] = useState<RegisterAsProvider>({
    _id: "",
    user_name: "",
    password: "",
    description: "",
  });

  /*************************************************************
   * Contract interaction
   ************************************************************/
  // get user count from smart contract
  const { data: userCount } = useScaffoldContractRead({
    contractName: "VayamAI",
    functionName: "userCount",
  });

  // register user on smart contract
  const { writeAsync: registerAsUser, isLoading: registerAsUserLoading } = useScaffoldContractWrite({
    contractName: "VayamAI",
    functionName: "registerAsUser",
    args: [
      ("0x" + keccak256(JSON.stringify(authenticationInformation)).toString("hex")) as `0x${string}`,
      ("0x" + keccak256(selectedRole).toString("hex")) as `0x${string}`,
      userCount,
    ] as readonly [`0x${string}` | undefined, `0x${string}` | undefined, BigNumber | undefined],
    onSuccess: () => {
      if (selectedRole === "freelancer") {
        registerAsFreelancerMutation.mutate({
          ...authenticationInformation,
          _id: address!,
        });
      } else {
        registerAsClientMutation.mutate({
          ...authenticationInformation,
          _id: address!,
        });
      }
    },
  });

  /*************************************************************
   * Backend interaction
   ************************************************************/
  const registerAsFreelancerMutation = useMutation({
    mutationFn: registerAsFreelancer,
    onSuccess: () => {
      setAuthenticationInformation({
        user_name: "",
        password: "",
        description: "",
        _id: "",
      });
      setIsOpen(false);
      userIdRefetch();
      toast.success("Registered as Freelancer!");
    },
    onError: (error: any) => {
      setAuthenticationInformation({
        user_name: "",
        password: "",
        description: "",
        _id: "",
      });
      toast.error(error.response.data.message);
    },
  });

  const registerAsClientMutation = useMutation({
    mutationFn: registerAsFreelancer,
    onSuccess: () => {
      setAuthenticationInformation({
        user_name: "",
        password: "",
        description: "",
        _id: "",
      });
      setIsOpen(false);
      userIdRefetch();
      toast.success("Registered as Client!");
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

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAuthenticationInformation(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  // when user click on the register/login button
  function handleAuthentication() {
    if (
      authenticationInformation.user_name.trim() === "" ||
      authenticationInformation.password.trim() === "" ||
      authenticationInformation.description.trim() === "" ||
      address === undefined
    ) {
      return toast.error("Please fill in all the information and connect your wallet!");
    }

    if (selectedRole === "freelancer") {
      // provider (aka freelancer)
      // TODO: submit a new provider
      registerAsUser();
    } else {
      // client
      registerAsUser();
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
                  <div className="mx-auto w-fit bg-black rounded-full">
                    <img src="/register/clip.png" alt="" className="w-10 h-10" />
                  </div>
                  <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-center">
                    Easily Login or Register
                  </Dialog.Title>
                  <div className="text-center">Are you </div>
                  <div className="mt-6">
                    {/* roles selection-provider/client */}
                    <div className="select-none w-full rounded-full grid grid-cols-2 overflow-hidden border border-primary">
                      <div
                        onClick={() => setSelectedRole("freelancer")}
                        className={`font-semibold text-center cursor-pointer py-2 ${
                          selectedRole === "freelancer" ? "connect-bg" : ""
                        }`}
                      >
                        Provider
                      </div>
                      <div
                        onClick={() => setSelectedRole("client")}
                        className={`font-semibold text-center cursor-pointer py-2 ${
                          selectedRole === "client" ? "connect-bg" : ""
                        }`}
                      >
                        Client
                      </div>
                    </div>
                  </div>
                  <div className="text-xl mt-6">
                    {/* email address / username */}
                    <div className="w-full">
                      <input
                        value={authenticationInformation.user_name}
                        onChange={handleOnChange}
                        type="text"
                        name="user_name"
                        placeholder="Email Address / Username"
                        className="font-semibold w-full rounded-full border border-primary outline-none bg-transparent text-base px-4 py-2"
                      />
                    </div>
                    <div className="mt-5 w-full">
                      <input
                        value={authenticationInformation.description}
                        onChange={handleOnChange}
                        type="description"
                        name="description"
                        placeholder="Role (Auditor etc.)"
                        className="font-semibold w-full rounded-full border border-primary outline-none bg-transparent text-base px-4 py-2"
                      />
                    </div>
                    {/* password */}
                    <div className="mt-5 w-full">
                      <input
                        value={authenticationInformation.password}
                        onChange={handleOnChange}
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="font-semibold w-full rounded-full border border-primary outline-none bg-transparent text-base px-4 py-2"
                      />
                    </div>
                    {/* login/register */}
                    <div
                      onClick={handleAuthentication}
                      className="select-none mt-10 text-base cursor-pointer font-semibold w-full connect-bg rounded-full py-3 text-center"
                    >
                      {registerAsClientMutation.isLoading ||
                      registerAsFreelancerMutation.isLoading ||
                      registerAsUserLoading
                        ? "Loading..."
                        : "Login / Register"}
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
