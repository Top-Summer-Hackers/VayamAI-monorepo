import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const mintMockTokens = async (hre: HardhatRuntimeEnvironment, contractName: any, user: any) => {
  const cToken = await hre.ethers.getContract(contractName);
  const tx = await cToken.mint(user, hre.ethers.utils.parseEther("1000000"));
  await tx.wait();
};
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // deployment objects - UPDATE when deploying to polygon
  let weth = { address: "0xc778417E063141139Fce010982780140Aa0cD5Ab" };
  let usdc = { address: "0xc778417E063141139Fce010982780140Aa0cD5Ab" };
  let dai = { address: "0xc778417E063141139Fce010982780140Aa0cD5Ab" };

  if (hre.network.name == "localhost") {
    //deploy mock tokens
    weth = await deploy("WETH", {
      from: deployer,
      // Contract constructor arguments
      args: [],
      log: true,
      contract: "MockWETH",
      // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
      // automatically mining the contract deployment transaction. There is no effect on live networks.
      autoMine: true,
    });

    usdc = await deploy("USDC", {
      from: deployer,
      args: [],
      log: true,
      contract: "MockToken",
      autoMine: true,
    });

    dai = await deploy("DAI", {
      from: deployer,
      args: [],
      log: true,
      contract: "MockToken",
      autoMine: true,
    });

    await mintMockTokens("USDC", deployer);
    await mintMockTokens("DAI", deployer);
  }
  await deploy("Arbitrator", {
    from: deployer,
    args: [hre.ethers.utils.parseEther("0.000001")],
    log: true,
    contract: "MockArbitrator",
    autoMine: false,
  });

  await deploy("SmartInvoiceFactory", {
    from: deployer,
    args: [weth.address],
    log: true,
    contract: "MockSmartInvoiceFactory",
    autoMine: true,
  });

  const escrowImplementation = await deploy("EscrowImplementation", {
    from: deployer,
    args: [],
    log: true,
    contract: "MockSmartInvoiceEscrow",
    autoMine: true,
  });

  const cSmartInvoiceFactory = await hre.ethers.getContract("SmartInvoiceFactory");

  let tx = await cSmartInvoiceFactory.addImplementation(
    hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("escrow")),
    escrowImplementation.address,
  );

  await tx.wait();

  await deploy("VayamAI", {
    from: deployer,
    args: [weth.address, cSmartInvoiceFactory.address],
    log: true,
    contract: "VayamAI",
    autoMine: true,
  });

  const cVayamAI = await hre.ethers.getContract("VayamAI");

  tx = await cVayamAI.addTokenToWhitelist(usdc.address);
  await tx.wait();

  tx = await cVayamAI.addTokenToWhitelist(dai.address);
  await tx.wait();
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];
