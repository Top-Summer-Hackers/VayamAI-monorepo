import React, { useContext } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import VayamAIContext from "~~/context/context";

const PleaseConnectWallet = () => {
  const { isConnected: isWalletConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { authenticationCredentials } = useContext(VayamAIContext);

  async function connectWallet() {
    if (!isWalletConnected && openConnectModal) {
      openConnectModal();
    }
  }

  return (
    <div className="fixed left-[50%] -translate-x-[50%] top-[30%]">
      {!isWalletConnected ? (
        <div>
          {" "}
          <div>
            <div className="text-2xl font-bold">Please Connect Your Wallet</div>
          </div>
          <div>
            <div
              onClick={connectWallet}
              className="mt-3 w-fit mx-auto block connect-bg rounded-full px-8 py-2 font-semibold cursor-pointer"
            >
              Connect
            </div>
          </div>
        </div>
      ) : authenticationCredentials.id == "" ? (
        <div>
          {" "}
          <div>
            <div className="text-2xl font-bold">Please login first</div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PleaseConnectWallet;
