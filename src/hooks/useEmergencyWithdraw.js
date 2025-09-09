import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { STAKING_CONTRACT_ABI } from '../config/ABI.js';

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT;

export const useEmergencyWithdraw = () => {
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const emergencyWithdraw = async () => {
    const result = await writeContractAsync({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_CONTRACT_ABI,
      functionName: 'emergencyWithdraw',
    });
    return result;
  };

  return {
    emergencyWithdraw,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
};
