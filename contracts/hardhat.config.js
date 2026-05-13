require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    "0g-testnet": {
      url: process.env.OG_RPC_URL || "https://evmrpc-testnet.0g.ai",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 16600,
    }
  }
};