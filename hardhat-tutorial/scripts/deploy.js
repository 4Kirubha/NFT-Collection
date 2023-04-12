const {ethers} = require("hardhat");
require("dotenv").config({path: ".env"});
const{WHITE_LIST_ADDRESS,METADATA_NFT} = require("../constants")

async function main(){
  const whitelistcontract = WHITE_LIST_ADDRESS;
  const metaDataNFT = METADATA_NFT;

  const kryptoContract = await ethers.getContractFactory("Krypto");
  const deployedKryptoContract = await kryptoContract.deploy(metaDataNFT,whitelistcontract);
  await deployedKryptoContract.deployed();

  console.log("Krypto Koin Address:",deployedKryptoContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });