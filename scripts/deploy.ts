import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";

const main = async () => {
  const [deployer] = await ethers.getSigners();
  // const accountBalance = await deployer.getBalance();

  // We get the contract to deploy
  const walletContractFactory = await ethers.getContractFactory("SharedWallet");
  const walletContract = await walletContractFactory.deploy();
  await walletContract.deployed();

  console.log("Deploying contract with account: ", deployer.address);
  // console.log("Account balance: ", accountBalance.toString());
  console.log("SharedWallet deployed to:", walletContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
