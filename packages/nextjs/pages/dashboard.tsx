import React, { useContext } from "react";
import keccak256 from "keccak256";
import { useAccount } from "wagmi";
import { Loading, PleaseConnectWallet } from "~~/components/vayam-ai";
import ClientDashboard from "~~/components/vayam-ai/client/ClientDashboard";
import { ProviderDashboard } from "~~/components/vayam-ai/provider";
import VayamAIContext from "~~/context/context";

const Dashboard = () => {
  const { address } = useAccount();
  const { userType, userTypeLoading, authenticationCredentials } = useContext(VayamAIContext);

  return (
    <div>
      {authenticationCredentials.id === "" || address === undefined ? (
        <PleaseConnectWallet />
      ) : (
        <div>
          {userType === undefined || userTypeLoading ? (
            <div className="flex-center mt-10">
              <Loading />
            </div>
          ) : userType === "0x0000000000000000000000000000000000000000000000000000000000000000" ? (
            <div className="mt-10 text-center text-3xl font-bold">Please register first!</div>
          ) : userType === "0x" + keccak256("freelancer").toString("hex") ? (
            <div>
              <ProviderDashboard />
            </div>
          ) : (
            <div>
              <ClientDashboard />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
