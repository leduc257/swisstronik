const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/utils");

// Function to send a shielded transaction using the provided signer, destination, data, and value
const sendShieldedTransaction = async (signer, destination, data, value) => { 
  // Get the RPC link from the network configuration
  const rpcLink = hre.network.config.url;
  
  // Encrypt transaction data
  const [encryptedData] = await encryptDataField(rpcLink, data);
  
  // Construct and sign transaction with encrypted data
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  const contractAddress = "0xbe8D4e5FD9C03ab14A9E3af82a0261c45169f715";

  const [signer] = await ethers.getSigners();

  const contractFactory = await ethers.getContractFactory('MintERC721');
  const contract = contractFactory.attach(contractAddress);

  const mintFunctionName = 'mintERC721'
  const recipientAddress = signer.address
  const mintTx = await sendShieldedTransaction(
    //@ts-ignore
    signer,
    contractAddress,
    contract.interface.encodeFunctionData(mintFunctionName, [recipientAddress]),
    0
  );
  const mintReceipt = await mintTx.wait()
  console.log('Mint Transaction Hash: ', `https://explorer-evm.testnet.swisstronik.com/tx/${mintTx.hash}`)

}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})