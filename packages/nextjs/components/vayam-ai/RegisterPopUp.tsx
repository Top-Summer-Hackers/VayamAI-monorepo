import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface MyModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MyModal({ isOpen, setIsOpen }: MyModalProps) {
  const [selectedRole, setSelectedRole] = useState("provider");

  function closeModal() {
    setIsOpen(false);
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
                        onClick={() => setSelectedRole("provider")}
                        className={`font-semibold text-center cursor-pointer py-2 ${
                          selectedRole === "provider" ? "connect-bg" : ""
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
                        type="text"
                        placeholder="Email Address / Username"
                        className="font-semibold w-full rounded-full border border-primary outline-none bg-transparent text-base px-4 py-2"
                      />
                    </div>
                    {/* password */}
                    <div className="mt-5 w-full">
                      <input
                        type="password"
                        placeholder="Password"
                        className="font-semibold w-full rounded-full border border-primary outline-none bg-transparent text-base px-4 py-2"
                      />
                    </div>
                    {/* login/register */}
                    <div className="select-none mt-10 text-base cursor-pointer font-semibold w-full connect-bg rounded-full py-3 text-center">
                      Login / Register
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
