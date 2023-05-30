import React, { PropsWithChildren, createContext, useEffect } from "react";
import { BigNumber } from "ethers";
import { useAccount } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

interface VayamAIContextData {
  userId: BigNumber | undefined;
  userType: `0x${string}` | undefined;
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
}

const VayamAIContext = createContext<VayamAIContextData>({
  userId: undefined,
  userType: undefined,
  userIdRefetch: (options?: { throwOnError: boolean; cancelRefetch: boolean } | undefined): Promise<BigNumber> => {
    console.log(options);
    // This is an empty function with no implementation
    return Promise.resolve(new BigNumber("", "")); // Returning a placeholder value
  },
  clientKeccak256: "",
  freelancerKeccak256: "",
});

export const VayamAIContextProvider = ({ children }: PropsWithChildren) => {
  const freelancerKeccak256 = "0xa02ecbc81e63f25b98a6f309764a0a557900757c03aa6fe8f291281c1d833e8e";
  const clientKeccak256 = "0x971ee2c8925badb60ae2abac1a4faf0aa9b739dd57ac1b3b7a1e150be855cde3";

  const { address } = useAccount();

  // get user id from smart contract
  const { data: userId, refetch: userIdRefetch } = useScaffoldContractRead({
    contractName: "VayamAI",
    functionName: "userIds",
    args: [address === undefined ? undefined : address] as readonly [string | undefined],
  });

  // read the user type, (provider or client)
  const { data: userType } = useScaffoldContractRead({
    contractName: "VayamAI",
    functionName: "userType",
    args: [address === undefined ? undefined : address] as readonly [string | undefined],
  });

  console.log(userType);

  useEffect(() => {
    userIdRefetch();
  }, [address]);

  return (
    <VayamAIContext.Provider
      value={{
        userId,
        userType,
        freelancerKeccak256,
        clientKeccak256,
        userIdRefetch,
      }}
    >
      {children}
    </VayamAIContext.Provider>
  );
};

export default VayamAIContext;
