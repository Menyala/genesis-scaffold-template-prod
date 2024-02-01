import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import fs from "fs";
import path from "path";

/**
 * Deploys all contracts in the contracts folder using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployAllContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
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

  // Get all contract files in the contracts directory
  const contractsDir = path.join(__dirname, "..", "contracts");
  const contractFiles = fs.readdirSync(contractsDir);

  // Loop through each contract file and deploy
  for (const contractFile of contractFiles) {
    const contractName = path.basename(contractFile, path.extname(contractFile));

    await deploy(contractName, {
      from: deployer,
      // Contract constructor arguments
      args: [deployer],
      log: true,
      // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
      // automatically mining the contract deployment transaction. There is no effect on live networks.
      autoMine: true,
    });

    // Get the deployed contract to interact with it after deploying.
    const contract = await hre.ethers.getContract<Contract>(contractName, deployer);
    console.log(`👋 Contract ${contractName} deployed, address: ${await contract.getAddress()}`);

    // Tags are useful if you have multiple deploy files and only want to run one of them.
    // e.g. yarn deploy --tags YourContract
    deployAllContracts.tags = [contractName];
  }
};

export default deployAllContracts;
