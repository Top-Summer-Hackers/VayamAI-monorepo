import React, { PropsWithChildren, createContext, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { useAccount } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { AuthenticationCredentials } from "~~/types/vayam-ai/Authentication";

interface VayamAIContextData {
  authenticationCredentials: AuthenticationCredentials;
  userId: BigNumber | undefined;
  userType: `0x${string}` | undefined;
  userTypeLoading: boolean;
  freelancerKeccak256: string;
  clientKeccak256: string;
  userIdRefetch: (
    options?:
      | {
          throwOnError: boolean;
          cancelRefetch: boolean;
        }
      | undefined,
  ) => Promise<BigNumber>;
  setAuthenticationCredentials: React.Dispatch<React.SetStateAction<AuthenticationCredentials>>;
}

const VayamAIContext = createContext<VayamAIContextData>({
  authenticationCredentials: {
    id: "",
    user_name: "",
    role: "",
    description: "",
    task_id: [],
  },
  userId: undefined,
  userType: undefined,
  userTypeLoading: false,
  clientKeccak256: "",
  freelancerKeccak256: "",
  userIdRefetch: (options?: { throwOnError: boolean; cancelRefetch: boolean } | undefined): Promise<BigNumber> => {
    // This is an empty function with no implementation
    console.log("USELESS: " + JSON.stringify(options));
    return Promise.resolve(new BigNumber("", "")); // Returning a placeholder value
  },
  setAuthenticationCredentials: credentials => {
    // Implement the logic to update the authenticationCredentials state here
    // For example:
    console.log("Updating authenticationCredentials: ", credentials);
    // You can update the state using React.useState or any state management solution you are using
  },
});

export const VayamAIContextProvider = ({ children }: PropsWithChildren) => {
  const freelancerKeccak256 = "0xa02ecbc81e63f25b98a6f309764a0a557900757c03aa6fe8f291281c1d833e8e";
  const clientKeccak256 = "0x971ee2c8925badb60ae2abac1a4faf0aa9b739dd57ac1b3b7a1e150be855cde3";

  const { address } = useAccount();

  const [authenticationCredentials, setAuthenticationCredentials] = useState<AuthenticationCredentials>({
    id: "",
    user_name: "",
    role: "",
    description: "",
    task_id: [],
  });

  // get user id from smart contract
  const { data: userId, refetch: userIdRefetch } = useScaffoldContractRead({
    contractName: "VayamAI",
    functionName: "userIds",
    args: [
      authenticationCredentials.id === ""
        ? address === undefined
          ? undefined
          : address
        : authenticationCredentials.id,
    ] as readonly [string | undefined],
  });

  // read the user type, (provider or client)
  const { data: userType, isLoading: userTypeLoading } = useScaffoldContractRead({
    contractName: "VayamAI",
    functionName: "userType",
    args: [
      authenticationCredentials.id === ""
        ? address === undefined
          ? undefined
          : address
        : authenticationCredentials.id,
    ] as readonly [string | undefined],
  });

  // console.log(userType);

  useEffect(() => {
    userIdRefetch();
    setAuthenticationCredentials({
      id: "",
      user_name: "",
      role: "",
      description: "",
      task_id: [],
    });
  }, [address]);

  return (
    <VayamAIContext.Provider
      value={{
        authenticationCredentials,
        userId,
        userType,
        userTypeLoading,
        freelancerKeccak256,
        clientKeccak256,
        userIdRefetch,
        setAuthenticationCredentials,
      }}
    >
      {children}
    </VayamAIContext.Provider>
  );
};

export default VayamAIContext;
