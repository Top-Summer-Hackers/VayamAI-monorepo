import React from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const PleaseConnectWallet = () => {
  const { isConnected: isWalletConnected } = useAccount();

  const { openConnectModal } = useConnectModal();

  async function connectWallet() {
    if (!isWalletConnected && openConnectModal) {
      openConnectModal();
    }
  }

  return (
    <div className="fixed left-[50%] -translate-x-[50%] top-[30%]">
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
  );
};

export default PleaseConnectWallet;
