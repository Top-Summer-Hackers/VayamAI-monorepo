import React, { useContext, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { RegisterPopUp } from ".";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { CiSearch } from "react-icons/ci";
import { useAccount } from "wagmi";
import VayamAIContext from "~~/context/context";

const Navbar = () => {
  const router = useRouter();

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const { isConnected: isWalletConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { userId } = useContext(VayamAIContext);

  async function connectWallet() {
    if (!isWalletConnected && openConnectModal) {
      openConnectModal();
    }
  }

  return (
    <div className="max-w-[1980px] mx-auto mb-10 pt-5 flex items-center justify-between">
      <RegisterPopUp isOpen={isRegisterOpen} setIsOpen={setIsRegisterOpen} />
      {/* logo/app name */}
      <Link href={"/"}>
        <div className="text-xl md:text-2xl lg:text-3xl font-bold">VayamAi</div>
      </Link>
      {/* searchbar */}
      <div>
        <div className="flex-center border border-gray-300 rounded-full px-3 py-1">
          {/* icon */}
          <div
            className="cursor-pointer"
            onClick={() => searchKeyword.trim() != "" && router.push(`/search/${searchKeyword}`)}
          >
            <CiSearch className="text-xl" />
          </div>
          {/* search input */}
          <div>
            <input
              onKeyDown={e => {
                if (e.key === "Enter") {
                  if (searchKeyword.trim() !== "") {
                    router.push(`/search/${searchKeyword}`);
                  }
                }
              }}
              onChange={e => setSearchKeyword(e.target.value)}
              type="search"
              className="pl-2 bg-transparent outline-none border-none"
              placeholder="Search"
            />
          </div>
        </div>
      </div>
      {/* dashboard+register+connect */}
      <div className="hidden md:block">
        <div className="flex-center gap-5">
          {address !== undefined ? (
            <div className="flex items-center gap-5">
              {userId != undefined && parseInt(String(userId).toString()) > 0 ? (
                <Link href={"/dashboard"}>
                  {" "}
                  <div className="font-semibold cursor-pointer">dashboard</div>
                </Link>
              ) : null}

              {userId != undefined && parseInt(String(userId).toString()) <= 0 ? (
                <div
                  onClick={() => setIsRegisterOpen(true)}
                  className="cursor-pointer border-2 border-primary px-8 py-1 rounded-full font-semibold"
                >
                  Register
                </div>
              ) : null}
            </div>
          ) : (
            <div
              onClick={connectWallet}
              className="block connect-bg rounded-full px-8 py-2 font-semibold cursor-pointer"
            >
              Connect
            </div>
          )}
        </div>
      </div>
      {/* mobile-dashboard+register+connect */}
      <div
        className={`${
          address === undefined ? "bottom-3" : "bottom-14"
        } block md:hidden rounded-full py-1 px-2 bg-[#191b1fc2] z-10 fixed  left-[50%] -translate-x-[50%]`}
      >
        <div className="flex-center ">
          <div className="flex items-center gap-5">
            {userId != undefined && parseInt(String(userId).toString()) > 0 ? (
              <Link href={"/dashboard"}>
                {" "}
                <div className="font-semibold cursor-pointer">dashboard</div>
              </Link>
            ) : null}

            {userId != undefined && parseInt(String(userId).toString()) <= 0 ? (
              <div
                onClick={() => setIsRegisterOpen(true)}
                className="cursor-pointer border-2 border-primary px-8 py-1 rounded-full font-semibold"
              >
                Register
              </div>
            ) : null}
          </div>
          {address !== undefined ? null : (
            <div
              onClick={connectWallet}
              className="block connect-bg rounded-full px-8 py-2 font-semibold cursor-pointer"
            >
              Connect
            </div>
          )}
        </div>
      </div>
      {address !== undefined ? (
        <div className="z-10 fixed right-3 bottom-2">
          <ConnectButton />
        </div>
      ) : null}
    </div>
  );
};

export default Navbar;
