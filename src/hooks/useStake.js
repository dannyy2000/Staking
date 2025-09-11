import { createWalletClient, custom, parseEther } from 'viem';
import { useWriteContract, useConfig } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { STAKING_CONTRACT_ABI } from '../config/ABI.js';
import { sepolia } from 'viem/chains';

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT;
// const [account] = await (window,ethereum).request({method:'eth_requestAccounts'})


// const useStake = () => {

//   const stake = async(amount) => {
//     const client = createWalletClient({
//     account:account,
//    chain:sepolia,
//    transport:custom(window.ethereum)
   
// })
  
//     const hash = await client.writeContract({
//       address : STAKING_CONTRACT_ADDRESS,
//       abi: STAKING_CONTRACT_ABI,
//       functionName: 'stake',
//       args: [parseEther(amount)],
//     })

//     return hash;
       
//   }
//   return {stake};
// }

// export default useStake;



export const useStake = () => {
  const { writeContractAsync, error, isPending } = useWriteContract();
  const config = useConfig();

  const stake = async (amount) => {
    const amountWei = parseEther(amount);
    const hash = await writeContractAsync({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_CONTRACT_ABI,
      functionName: 'stake',
      args: [amountWei],
    });
    await waitForTransactionReceipt(config, { hash });
    return hash;
  };

  return {
    stake,
    isPending,
    error,
  };
};
