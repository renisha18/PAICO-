const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // TEE_SIGNER is the public address corresponding to the TEE's private key
  // In dev: use a test wallet. In prod: use 0G Compute's published TEE address.
  const TEE_SIGNER = process.env.TEE_SIGNER_ADDRESS;
  if (!TEE_SIGNER) throw new Error("Set TEE_SIGNER_ADDRESS in .env");

  const Registry = await hre.ethers.getContractFactory("PAICORegistry");
  const registry = await Registry.deploy(TEE_SIGNER);
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("PAICORegistry deployed to:", address);
  console.log("0G Explorer:", `https://chainscan-galileo.0g.ai/address/${address}`);

  // Save this address — paste it into frontend/.env and backend/.env
}

main().catch((e) => { console.error(e); process.exit(1); });