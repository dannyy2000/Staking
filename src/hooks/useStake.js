import { parseEther } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { STAKING_CONTRACT_ABI } from '../config/ABI.js';

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT;

export const useStake = () => {
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

 
  const stake = async (amount) => {
    const amountWei = parseEther(amount);
    const result = await writeContractAsync({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_CONTRACT_ABI,
      functionName: 'stake',
      args: [amountWei],
    });
    return result;
  };

  return {
    stake,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
};
