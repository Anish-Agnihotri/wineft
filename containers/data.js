import { ethers } from "ethers"; // Ethers
import { useEffect, useState } from "react"; // State management
import { createContainer } from "unstated-next"; // Unstated containerization
import WineTokenABI from "contracts/abi/WineToken"; // Contract ABI

function useData() {
  const [bottles, setBottles] = useState([]); // Minted bottles
  const [address, setAddress] = useState(null); // Current user address
  const [loading, setLoading] = useState(true); // Loading state
  const [provider, setProvider] = useState(null); // Ethers provider
  const [contract, setContract] = useState(null); // WineToken contract
  const [mintCost, setMintCost] = useState(null); // Cost to mint NFT

  /**
   * Updates provider in state, generates contract, updates contract in state
   * @param {Object} provider ethers provider
   * @returns ethers contract
   */
  function updateProvider(provider) {
    setProvider(provider); // Update provider

    // Create contract
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_WINETOKEN_CONTRACT_ADDRESS,
      WineTokenABI,
      provider // With local provider
    );
    setContract(contract); // Udpate contract

    // Return contract
    return contract;
  }

  /**
   * Unlocks wallet
   */
  async function unlock() {
    // Collect and store provider from window
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    updateProvider(provider);

    // Collect and store address
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setAddress(address);
  }

  /**
   * Lock wallet
   */
  async function lock() {
    // Collect and store default provider via RPC
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ARBITRUM_RPC
    );
    updateProvider(provider);

    // Nullify address
    setAddress(null);
  }

  /**
   * Mint new NFT
   * @returns error if any
   */
  async function mint() {
    // Collect contract with signer
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);

    try {
      // Send mint() to contract
      const tx = await contractWithSigner.mint(address, {
        // With required mintCost
        value: ethers.utils.parseEther(mintCost.toString()),
      });

      // Wait for a confirmation
      await tx.wait(1);
      // Refresh ageing bottles
      await collectBottles(contract);
    } catch (error) {
      return error;
    }
  }

  /**
   * Transfer NFT to new address
   * @param {String} toAddress to send to
   * @param {Number} tokenId to transfer
   * @returns
   */
  async function transfer(toAddress, tokenId) {
    // Collect contract with signer
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);

    try {
      // Send transaction from current address
      const tx = await contractWithSigner.transferFrom(
        address,
        toAddress,
        tokenId
      );
      // Wait for a confirmation
      await tx.wait(1);
      // Refresh ageing bottles
      await collectBottles(contract);
    } catch (error) {
      return error;
    }
  }

  /**
   * Collect initial data on pageload
   */
  async function initiateData() {
    // Setup provider
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ARBITRUM_RPC
    );
    const contract = updateProvider(provider);

    // Collect bottles data
    await collectBottles(contract);
  }

  /**
   * Collect mintCost and all tokens in an array
   * @param {Object} contract Ethers contract
   */
  async function collectBottles(contract) {
    setLoading(true); // Toggle loading

    // Collect mint cost
    const mintCost = await contract._mintCost();
    setMintCost(ethers.utils.formatEther(mintCost));

    // Collect total minted NFT count
    const tokenCount = await contract.tokenCount();

    let bottles = []; // Setup array for NFT info

    // For each i in len(tokenCount)
    for (let i = 0; i < tokenCount; i++) {
      const owner = await contract.ownerOf(i); // Collect owner
      const bottle = await contract._tokens(i); // Collect NFT info

      // Push new info to bottles array
      bottles.push({
        id: i,
        owner,
        appearance: bottle.appearance.toString(),
        nextTransfer: bottle.nextTransfer.toNumber(),
        numTransfers: bottle.numTransfers.toNumber(),
      });
    }
    // Update bottles array
    setBottles(bottles);

    setLoading(false); // Toggle loading
  }

  // On load, collect required data
  useEffect(initiateData, []);

  return {
    address,
    bottles,
    loading,
    mintCost,
    mint,
    lock,
    unlock,
    transfer,
  };
}

// Create data container
const data = createContainer(useData);
// Export container
export default data;
