import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  AlertTriangle, 
  ArrowUpCircle,
  ArrowDownCircle,
  Shield,
  Loader2,
  CheckCircle,
  Info
} from 'lucide-react';
// import { useContractData } from '@/hooks/useContractData';
import  useContractData  from '@/hooks/useContractData';

import { useTokenApproval } from '@/hooks/useTokenApproval';
import  {useStake } from '@/hooks/useStake';
import { useWithdraw } from '@/hooks/useWithdraw';
import { useClaimRewards } from '@/hooks/useClaimRewards';
import { useEmergencyWithdraw } from '@/hooks/useEmergencyWithdraw';
import { formatTokenAmount, formatAPR, formatTimeRemaining } from '@/utils/formatters';

export default function StakingDashboard() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isEmergencySubmitting, setIsEmergencySubmitting] = useState(false);

  // Per-action loading states so only the pressed button shows a spinner
  const [isApprovingLocal, setIsApprovingLocal] = useState(false);
  const [isStakingLocal, setIsStakingLocal] = useState(false);
  const [isWithdrawingLocal, setIsWithdrawingLocal] = useState(false);
  const [isClaimingLocal, setIsClaimingLocal] = useState(false);
  
  // Track if user has approved for current session
  const [hasApprovedInSession, setHasApprovedInSession] = useState(false);

  const {userDetails,totalStaked,initialApr,tokenSymbol,tokenBalance,allowance,refetchUserDetails,refetchBalance,refetchAllowance,
  } = useContractData();
  //   const {totalStaked,initialApr,tokenSymbol,tokenBalance,allowance,refetchBalance,refetchAllowance,
  // } = useContractData();

const { approveToken, needsApproval, isPending: isApprovePending } = useTokenApproval();


const { stake, isPending: isStakePending, error: stakeError } = useStake();
// const { stake } = useStake();


 
const { withdraw, isPending: isWithdrawPending, error: withdrawError } = useWithdraw();


const { claimRewards, isPending: isClaimPending, error: claimError } = useClaimRewards();

 
const {
    emergencyWithdraw,
    isPending: isEmergencyPending,
    error: emergencyError,
  } = useEmergencyWithdraw();

 
const approvalNeeded = stakeAmount ? needsApproval(stakeAmount, allowance) : false;

// Disable other actions while one is running (but only the active one shows a spinner)
const isBusy = (
  isApprovePending || isStakePending || isWithdrawPending || isClaimPending || isEmergencyPending ||
  isApprovingLocal || isStakingLocal || isWithdrawingLocal || isClaimingLocal || isEmergencySubmitting
);


  useEffect(() => {
    const error = stakeError || withdrawError || claimError || emergencyError;
    if (error) {
      setMessage(`Error: ${error.message || 'Transaction failed'}`);
      setTimeout(() => setMessage(''), 5000);
    }
  }, [stakeError, withdrawError, claimError, emergencyError]);

  const handleApprove = async () => {
    if (!stakeAmount) {
      setMessage('Please enter an amount to approve');
      return;
    }
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    setIsApprovingLocal(true);
    setMessage('');
    try {
      setMessage('Approving tokens...');
      await approveToken(stakeAmount);
      setMessage('Tokens approved. You can now stake.');
      setHasApprovedInSession(true); // Mark as approved for this session
      await Promise.all([refetchAllowance(), refetchBalance()]);
    } catch (err) {
      console.error('Approve error:', err);
      setMessage(`Error: ${err.shortMessage || err.message || 'Approval failed'}`);
    } finally {
      setIsApprovingLocal(false);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount) {
      setMessage('Please enter a stake amount');
      return;
    }

    if (!tokenBalance || tokenBalance.value === 0n) {
      setMessage('You need STA tokens to stake. Your balance is 0.');
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    if (approvalNeeded) {
      setMessage('Approval required for this amount. Please approve first.');
      return;
    }

    setIsStakingLocal(true);
    setMessage('');

    try {
      setMessage('Staking tokens...');
      await stake(stakeAmount);
      setMessage('Stake confirmed');
      setStakeAmount('');
      setHasApprovedInSession(false); // Reset approval state after staking
      await Promise.all([refetchUserDetails(), refetchBalance(), refetchAllowance()]);
    } catch (err) {
      console.error('Staking error:', err);
      setMessage(`Error: ${err.shortMessage || err.message || 'Transaction failed'}`);
    } finally {
      setIsStakingLocal(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) {
      setMessage('Please enter a withdrawal amount');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    if (userDetails && amount > parseFloat(formatTokenAmount(userDetails.stakedAmount))) {
      setMessage('Cannot withdraw more than staked amount');
      return;
    }

    setIsWithdrawingLocal(true);
    setMessage('');

    try {
      await withdraw(withdrawAmount);
      setMessage('Withdraw confirmed');
      setWithdrawAmount('');
      await Promise.all([refetchUserDetails(), refetchBalance(), refetchAllowance()]);
    } catch (err) {
      console.error('Withdrawal error:', err);
      setMessage(`Error: ${err.shortMessage || err.message || 'Failed to withdraw'}`);
    } finally {
      setIsWithdrawingLocal(false);
    }
  };

  const handleClaimRewards = async () => {
    setIsClaimingLocal(true);
    setMessage('');

    try {
      await claimRewards();
      setMessage('Rewards claimed');
      await Promise.all([refetchUserDetails(), refetchBalance(), refetchAllowance()]);
    } catch (err) {
      console.error('Claim rewards error:', err);
      setMessage(`Error: ${err.shortMessage || err.message || 'Failed to claim rewards'}`);
    } finally {
      setIsClaimingLocal(false);
    }
  };

  const handleEmergencyWithdraw = async () => {
    setIsEmergencySubmitting(true);
    setMessage('');

    try {
      await emergencyWithdraw();
      setMessage('Emergency withdraw confirmed');
      await Promise.all([refetchUserDetails(), refetchBalance(), refetchAllowance()]);
      setIsEmergencyDialogOpen(false);
    } catch (err) {
      setMessage(`Error: ${err.shortMessage || err.message || 'Failed to emergency withdraw'}`);
    } finally {
      setIsEmergencySubmitting(false);
    }
  };

  const setMaxStake = () => {
    if (tokenBalance) {
      setStakeAmount(formatTokenAmount(tokenBalance.value));
    }
  };

  const setMaxWithdraw = () => {
    if (userDetails && userDetails.stakedAmount) {
      setWithdrawAmount(formatTokenAmount(userDetails.stakedAmount));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Staking Dapp
                </h1>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Message Display */}
          {message && (
            <div className={`rounded-lg p-4 ${
              message.includes('Error') ? 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800' : 
              message.includes('success') || message.includes('confirmed') ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' :
              'bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
            }`}>
              <div className="flex items-center space-x-3">
                {message.includes('Error') ? (
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                ) : message.includes('success') || message.includes('confirmed') ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
                <span className={`text-sm font-medium ${
                  message.includes('Error') ? 'text-red-800 dark:text-red-200' :
                  message.includes('success') || message.includes('confirmed') ? 'text-green-800 dark:text-green-200' :
                  'text-blue-800 dark:text-blue-200'
                }`}>
                  {message}
                </span>
              </div>
            </div>
          )}


          {/* Protocol Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Staked</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatTokenAmount(totalStaked)} {tokenSymbol}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <ArrowUpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current APR</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {formatAPR(initialApr)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Your Balance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {tokenBalance ? formatTokenAmount(tokenBalance.value) : '0'} {tokenSymbol}
                  </p>
                  {(!tokenBalance || tokenBalance.value === 0n) && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">No tokens available</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Info className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* User Position */}
          {userDetails && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Your Staking Position</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Staked Amount</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatTokenAmount(userDetails.stakedAmount)} {tokenSymbol}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Rewards</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {formatTokenAmount(userDetails.pendingRewards)} {tokenSymbol}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lock Status</p>
                  <p className={`text-xl font-bold mt-2 ${
                    userDetails.canWithdraw ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {userDetails.canWithdraw
                      ? 'Unlocked'
                      : formatTimeRemaining(Number(userDetails.timeUntilUnlock))}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Staking Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <ArrowUpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Stake Tokens</h2>
              </div>

              <div className="space-y-6">
                {/* Amount input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount to stake
                  </label>
                  <div className="flex space-x-3">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={stakeAmount}
                      onChange={(e) => {
                        setStakeAmount(e.target.value);
                        setHasApprovedInSession(false); // Reset approval when amount changes
                      }}
                      className="flex-1 h-12 text-lg font-bold border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:focus:border-blue-400 transition-all duration-200 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    />
                    <Button 
                      variant="outline" 
                      onClick={setMaxStake}
                      className="h-12 px-6 font-bold text-base border-2 border-gray-400 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-500 dark:hover:border-blue-400 dark:hover:bg-blue-950/30 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Max
                    </Button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={!stakeAmount || isBusy}
                    onClick={handleApprove}
                    className="h-14 text-base font-bold border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950/30 transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:border-gray-600 dark:disabled:text-gray-500"
                  >
                    {(isApprovingLocal || isApprovePending) ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span className="font-bold">Approving...</span>
                      </>
                    ) : hasApprovedInSession ? (
                      "Approved"
                    ) : (
                      "Approve"
                    )}
                  </Button>

                  <Button 
                    size="lg"
                    disabled={!stakeAmount || !hasApprovedInSession || isBusy || (!tokenBalance || tokenBalance.value === 0n)}
                    onClick={handleStake}
                    className="h-14 text-base font-bold shadow-lg transition-all duration-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:transform-none dark:disabled:bg-gray-700 dark:disabled:text-gray-400 enabled:bg-gradient-to-r enabled:from-blue-600 enabled:to-blue-700 enabled:hover:from-blue-700 enabled:hover:to-blue-800 enabled:text-white enabled:hover:shadow-xl enabled:hover:scale-[1.02]"
                  >
                    {(isStakingLocal || isStakePending) ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span className="font-bold">Staking...</span>
                      </>
                    ) : (
                      "Stake"
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Withdrawal Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <ArrowDownCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Withdraw</h2>
              </div>

              <div className="space-y-6">
                {/* Claim Rewards */}
                <Button 
                  size="lg"
                  className="w-full h-14 text-base font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200"
                  disabled={(!userDetails?.pendingRewards || userDetails.pendingRewards === 0n) || isBusy}
                  onClick={handleClaimRewards}
                >
                  {(isClaimingLocal || isClaimPending) ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span className="font-bold">Claiming...</span>
                    </>
                  ) : (
                    <span className="font-bold">{`Claim Rewards (${userDetails ? formatTokenAmount(userDetails.pendingRewards) : '0'} ${tokenSymbol})`}</span>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">or</span>
                  </div>
                </div>

                {/* Withdraw Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount to withdraw
                  </label>
                  <div className="flex space-x-3">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="flex-1 h-12 text-lg font-bold border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:border-gray-600 dark:focus:border-orange-400 transition-all duration-200 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    />
                    <Button 
                      variant="outline" 
                      onClick={setMaxWithdraw}
                      className="h-12 px-6 font-bold text-base border-2 border-gray-400 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 dark:border-gray-500 dark:hover:border-orange-400 dark:hover:bg-orange-950/30 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Max
                    </Button>
                  </div>
                </div>

                <Button 
                  variant="outline"
                  size="lg"
                  className="w-full h-14 text-base font-bold border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-950/30 shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={!withdrawAmount || !userDetails?.canWithdraw || isBusy}
                  onClick={handleWithdraw}
                >
                  {(isWithdrawingLocal || isWithdrawPending) ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span className="font-bold">Withdrawing...</span>
                    </>
                  ) : userDetails?.canWithdraw ? (
                    'Withdraw'
                  ) : (
                    'Locked - Cannot Withdraw Yet'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Emergency Section */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">Emergency Actions</h2>
            </div>

            <div className="bg-white/60 dark:bg-red-950/30 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-900 dark:text-red-100 mb-2">Emergency Withdrawal</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                    Immediately withdraw all staked tokens. This action will forfeit all pending rewards 
                    and may incur a penalty fee. Only use in emergency situations.
                  </p>
                </div>
              </div>
            </div>
            
            <AlertDialog
              open={isEmergencyDialogOpen}
              onOpenChange={(open) => {
                if (!isEmergencySubmitting) setIsEmergencyDialogOpen(open);
              }}
            >
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full md:w-auto h-12 text-base font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isBusy || !userDetails || userDetails.stakedAmount === 0n}
                >
                  {(isEmergencySubmitting || isEmergencyPending) ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span className="font-bold">Processing...</span>
                    </>
                  ) : (
                    'Emergency Withdraw All'
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader className="text-left">
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Confirm Emergency Withdrawal
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-neutral-700 dark:text-neutral-300">
                    This will immediately withdraw all your staked tokens.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-3">
                  <div className="rounded-md border p-3 text-sm bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-600/40">
                    <p className="font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Warning
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-red-800 dark:text-red-200">
                      <li>All pending rewards will be forfeited</li>
                      <li>A penalty fee may be applied</li>
                      <li>This action cannot be undone</li>
                    </ul>
                  </div>

                  {userDetails && (
                    <div className="rounded-md border p-3 text-sm bg-gray-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-600 dark:text-neutral-300">You will withdraw</span>
                        <span className="font-medium">
                          {formatTokenAmount(userDetails.stakedAmount)} {tokenSymbol}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isEmergencySubmitting}>Cancel</AlertDialogCancel>
                  <Button
                    type="button"
                    onClick={handleEmergencyWithdraw}
                    disabled={isEmergencySubmitting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isEmergencySubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Withdrawing...
                      </>
                    ) : (
                      'Yes, Emergency Withdraw All'
                    )}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}