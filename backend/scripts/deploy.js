const hre = require("hardhat");

async function main() {
  // Get the contract to deploy
  const CryptPayMe = await hre.ethers.getContractFactory("CryptPayMe");
  const cryptPayMe = await CryptPayMe.deploy();

  // Wait for the contract deployment to complete
  await cryptPayMe.waitForDeployment();

  // Get the deployed contract address
  console.log("CryptPayMe deployed to:", cryptPayMe.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
