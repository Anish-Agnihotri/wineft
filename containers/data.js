import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";
import WineTokenABI from "contracts/abi/WineToken";

function useData() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState(null);
  const [bottles, setBottles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mintCost, setMintCost] = useState(null);

  function updateProvider(provider) {
    setProvider(provider);

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_WINETOKEN_CONTRACT_ADDRESS,
      WineTokenABI,
      provider
    );
    setContract(contract);
    return contract;
  }

  async function unlock() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    updateProvider(provider);

    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setAddress(address);
  }

  async function lock() {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ARBITRUM_RPC
    );
    updateProvider(provider);
    setAddress(null);
  }

  async function mint() {
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);

    try {
      const tx = await contractWithSigner.mint(address, {
        value: ethers.utils.parseEther(mintCost.toString()),
      });
      await tx.wait(1);
      await collectBottles(contract);
    } catch (error) {
      return error;
    }
  }

  async function transfer(toAddress, tokenId) {
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);

    try {
      const tx = await contractWithSigner.transferFrom(
        address,
        toAddress,
        tokenId
      );
      await tx.wait(1);
      await collectBottles(contract);
    } catch (error) {
      return error;
    }
  }

  async function initiateData() {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ARBITRUM_RPC
    );
    const contract = updateProvider(provider);

    await collectBottles(contract);
  }

  async function collectBottles(contract) {
    setLoading(true);

    const mintCost = await contract._mintCost();
    setMintCost(ethers.utils.formatEther(mintCost));

    const tokenCount = await contract.tokenCount();

    let bottles = [];
    for (let i = 0; i < tokenCount; i++) {
      const owner = await contract.ownerOf(i);
      const bottle = await contract._tokens(i);

      bottles.push({
        id: i,
        owner,
        appearance: bottle.appearance.toString(),
        nextTransfer: bottle.nextTransfer.toNumber(),
        numTransfers: bottle.numTransfers.toNumber(),
      });
    }
    setBottles(bottles);

    setLoading(false);
  }

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

const data = createContainer(useData);
export default data;
