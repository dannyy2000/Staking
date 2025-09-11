import { useReadContract, useAccount, useBalance, usePublicClient, useBlockNumber } from 'wagmi';
import { STAKING_CONTRACT_ABI, STAKING_TOKEN_ABI } from '../config/ABI.js';
import { useEffect, useState } from "react";
import { parseAbiItem } from 'viem';

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT;
const STAKING_TOKEN_ADDRESS = import.meta.env.VITE_STAKING_TOKEN;
// const stakedEvent = parseAbiItem("event Staked(address indexed user, uint256 amount, uint256 timestamp, uint256 newTotalStaked, uint256 currentRewardRate");


const useContractData = () => {
  const publicClient = usePublicClient();
  const block = useBlockNumber();
  const [totalStaked, setTotalStaked] = useState(0n);

  const { address } = useAccount();

  const { data: userDetails, refetch: refetchUserDetails } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: "getUserDetails",
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  const { data: tokenBalance, refetch: refetchBalance } = useBalance({
    address: address,
    token: STAKING_TOKEN_ADDRESS,
    enabled: !!address,
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: STAKING_TOKEN_ADDRESS,
    abi: STAKING_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, STAKING_CONTRACT_ADDRESS] : undefined,
    enabled: !!address,
  });

    const { data: currentRewardRate } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'currentRewardRate',
  });

 
  const { data: initialApr } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'initialApr',
  });

 
  const { data: emergencyWithdrawPenalty } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'emergencyWithdrawPenalty',
  });


  const { data: minLockDuration } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'minLockDuration',
  });


  const { data: tokenSymbol } = useReadContract({
    address: STAKING_TOKEN_ADDRESS,
    abi: STAKING_TOKEN_ABI,
    functionName: 'symbol',
  });


  const { data: tokenName } = useReadContract({
    address: STAKING_TOKEN_ADDRESS,
    abi: STAKING_TOKEN_ABI,
    functionName: 'name',
  });

  useEffect(() => {
  if (!block.data || !publicClient) return;
  
 
  const fetchInitialTotal = async () => {
    try {
      const currentTotal = await publicClient.readContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'totalStaked',
      });
      setTotalStaked(currentTotal);
    } catch (error) {
      console.error('Error fetching initial total:', error);
    }
  };
  
  fetchInitialTotal();
  
  
  const unwatch = publicClient.watchEvent({
    address: STAKING_CONTRACT_ADDRESS,
    event: STAKING_CONTRACT_ABI.find(
      (item) => item.type === "event" && item.name === "Staked"
    ),
    onLogs: (logs) => {
      logs.forEach((log) => {
        console.log("Event listener updated:", log.args.newTotalStaked);
        setTotalStaked(log.args.newTotalStaked);
      });
    },
  });
  
  return () => unwatch?.();
}, [publicClient, block.data]);

  return { totalStaked, block ,userDetails,tokenBalance,allowance,currentRewardRate,initialApr,emergencyWithdrawPenalty,minLockDuration,tokenSymbol,tokenName,
    refetchUserDetails,refetchBalance,refetchAllowance,
  };

  
};

export default useContractData;

 
  // const { data: initialTotalStaked, refetch: refetchTotalStaked } = useReadContract({
  //   address: STAKING_CONTRACT_ADDRESS,
  //   abi: STAKING_CONTRACT_ABI,
  //   functionName: 'totalStaked',
  // });

 
  // useEffect(() => {
  //   if (initialTotalStaked !== undefined) {
  //     setTotalStaked(initialTotalStaked);
  //   }
  // }, [initialTotalStaked]);

 
  // // useEffect(() => {
  // //   if (!block.data) return;

  // //   const unwatch = publicClient.watchEvent({
  // //     address: STAKING_CONTRACT_ADDRESS,
  // //     event: STAKING_CONTRACT_ABI.find(
  // //       (item) => item.type === "event" && item.name === "Staked"
  // //     ),
  // //     onLogs: (logs) => {
  // //       logs.forEach((log) => {
  // //          console.log("newTotalStaked raw:", log.args.newTotalStaked);
  // //          console.log("toString:", log.args.newTotalStaked);
  // //         setTotalStaked(log.args.newTotalStaked);
  // //       });
  // //     },
  // //   });

  
  // //   return () => unwatch?.();
  // // }, [publicClient, block.data]);

//   return { totalStaked, block ,userDetails,tokenBalance,allowance,currentRewardRate,initialApr,emergencyWithdrawPenalty,minLockDuration,tokenSymbol,tokenName,
//     refetchUserDetails,refetchBalance,refetchAllowance,
//   };

  
// };

// export default useContractData;


// export const useContractData = () => {
//   const { address } = useAccount();

 
//   const { data: userDetails, refetch: refetchUserDetails } = useReadContract({
//     address: STAKING_CONTRACT_ADDRESS,
//     abi: STAKING_CONTRACT_ABI,
//     functionName: 'getUserDetails',
//     args: address ? [address] : undefined,
//     enabled: !!address,
//   });

 
//   const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({
//     address: STAKING_CONTRACT_ADDRESS,
//     abi: STAKING_CONTRACT_ABI,
//     functionName: 'totalStaked',
//   });


//   const { data: currentRewardRate } = useReadContract({
//     address: STAKING_CONTRACT_ADDRESS,
//     abi: STAKING_CONTRACT_ABI,
//     functionName: 'currentRewardRate',
//   });

 
//   const { data: initialApr } = useReadContract({
//     address: STAKING_CONTRACT_ADDRESS,
//     abi: STAKING_CONTRACT_ABI,
//     functionName: 'initialApr',
//   });

 
//   const { data: emergencyWithdrawPenalty } = useReadContract({
//     address: STAKING_CONTRACT_ADDRESS,
//     abi: STAKING_CONTRACT_ABI,
//     functionName: 'emergencyWithdrawPenalty',
//   });


//   const { data: minLockDuration } = useReadContract({
//     address: STAKING_CONTRACT_ADDRESS,
//     abi: STAKING_CONTRACT_ABI,
//     functionName: 'minLockDuration',
//   });


//   const { data: tokenSymbol } = useReadContract({
//     address: STAKING_TOKEN_ADDRESS,
//     abi: STAKING_TOKEN_ABI,
//     functionName: 'symbol',
//   });


//   const { data: tokenName } = useReadContract({
//     address: STAKING_TOKEN_ADDRESS,
//     abi: STAKING_TOKEN_ABI,
//     functionName: 'name',
//   });


//   const { data: tokenBalance, refetch: refetchBalance } = useBalance({
//     address: address,
//     token: STAKING_TOKEN_ADDRESS,
//     enabled: !!address,
//   });


//   const { data: allowance, refetch: refetchAllowance } = useReadContract({
//     address: STAKING_TOKEN_ADDRESS,
//     abi: STAKING_TOKEN_ABI,
//     functionName: 'allowance',
//     args: address ? [address, STAKING_CONTRACT_ADDRESS] : undefined,
//     enabled: !!address,
//   });

//   return {
  
//     userDetails,
//     totalStaked,
//     currentRewardRate,
//     initialApr,
//     emergencyWithdrawPenalty,
//     minLockDuration,
//     tokenSymbol: tokenSymbol || 'TOKEN',
//     tokenName: tokenName || 'Token',
//     tokenBalance,
//     allowance,
    
   
//     refetchUserDetails,
//     refetchTotalStaked,
//     refetchBalance,
//     refetchAllowance,
//   };
// };
