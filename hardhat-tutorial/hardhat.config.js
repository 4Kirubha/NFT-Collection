require("@nomicfoundation/hardhat-toolbox");
//require("dotenv").config({path:".env"});


//const infuraID = process.env.INFURA_ID;
//const PrivateKey = process.env.PRIVATE_KEY;
module.exports = {
  solidity: "0.8.18",
  networks:{
    sepolia:{
      url: "https://sepolia.infura.io/v3/e9cf275f1ddc4b81aa62c5aa0b11ac0f",
      accounts: ["4c07e1ac8e50f79c66f986b7eee80b91f0c8460bd1481d59781893fdae4cb3f6"],
    },
  },
};