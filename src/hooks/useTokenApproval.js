import { parseEther } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { STAKING_TOKEN_ABI } from '../config/ABI.js';

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT;
const STAKING_TOKEN_ADDRESS = import.meta.env.VITE_STAKING_TOKEN;

export const useTokenApproval = () => {
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const approveToken = async (amount) => {
    const amountWei = parseEther(amount);
    const result = await writeContractAsync({
      address: STAKING_TOKEN_ADDRESS,
      abi: STAKING_TOKEN_ABI,
      functionName: 'approve',
      args: [STAKING_CONTRACT_ADDRESS, amountWei],
    });
    return result;
  };

 
  const needsApproval = (amount, allowance) => {
    if (!allowance || !amount) return true;
    try {
      return allowance < parseEther(amount);
    } catch {
      return true;
    }
  };

  return {
    approveToken,
    needsApproval,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
};
