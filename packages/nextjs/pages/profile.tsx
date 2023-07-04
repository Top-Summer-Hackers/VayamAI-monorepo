import React, { useContext } from "react";
import keccak256 from "keccak256";
import { useAccount } from "wagmi";
import { Loading, PleaseConnectWallet } from "~~/components/vayam-ai";
import { ClientProfile, ProviderProfile } from "~~/components/vayam-ai/profile";
import VayamAIContext from "~~/context/context";

const Profile = () => {
  const { address } = useAccount();
  const { userType, userTypeLoading, authenticationCredentials } = useContext(VayamAIContext);

  return (
    <div className="pb-24">
      <div>
        {authenticationCredentials.id === "" || address == undefined ? (
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
                <ProviderProfile freelancerAddr={authenticationCredentials.id} />
              </div>
            ) : (
              <div>
                <ClientProfile clientAddr={authenticationCredentials.id} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
