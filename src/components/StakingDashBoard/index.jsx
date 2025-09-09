import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  ArrowUpCircle,
  ArrowDownCircle,
  Shield,
  Loader2,
  CheckCircle,
  Info
} from 'lucide-react';
import { useContractData } from '@/hooks/useContractData';
import { useTokenApproval } from '@/hooks/useTokenApproval';
import { useStake } from '@/hooks/useStake';
import { useWithdraw } from '@/hooks/useWithdraw';
import { useClaimRewards } from '@/hooks/useClaimRewards';
import { useEmergencyWithdraw } from '@/hooks/useEmergencyWithdraw';
import { formatTokenAmount, formatAPR } from '@/utils/formatters';

export default function StakingDashboard() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const {
    userDetails,
    totalStaked,
    initialApr,
    tokenSymbol,
    tokenBalance,
    allowance,
    refetchUserDetails,
    refetchBalance,
    refetchAllowance,
  } = useContractData();

  const {approveToken,needsApproval,isPending: isApprovePending,isConfirmed: isApproveConfirmed,  } = useTokenApproval();


  const {
    stake,
    isPending: isStakePending,
    isConfirmed: isStakeConfirmed,
    error: stakeError,
  } = useStake();

  // Withdrawal
  const {
    withdraw,
    isPending: isWithdrawPending,
    isConfirmed: isWithdrawConfirmed,
    error: withdrawError,
  } = useWithdraw();


  const {
    claimRewards,
    isPending: isClaimPending,
    isConfirmed: isClaimConfirmed,
    error: claimError,
  } = useClaimRewards();

 
  const {
    emergencyWithdraw,
    isPending: isEmergencyPending,
    isConfirmed: isEmergencyConfirmed,
    error: emergencyError,
  } = useEmergencyWithdraw();

 
  const isAnyPending = isStakePending || isWithdrawPending || isClaimPending || isEmergencyPending || isApprovePending;
  const isAnyConfirming = false; 

 
  useEffect(() => {
    if (isStakeConfirmed || isWithdrawConfirmed || isClaimConfirmed || isEmergencyConfirmed || isApproveConfirmed) {
      setMessage('Transaction confirmed successfully!');
      setStakeAmount('');
      setWithdrawAmount('');
      refetchUserDetails();
      refetchBalance();
      refetchAllowance();
      setTimeout(() => setMessage(''), 5000);
    }
  }, [isStakeConfirmed, isWithdrawConfirmed, isClaimConfirmed, isEmergencyConfirmed, isApproveConfirmed]);


  useEffect(() => {
    const error = stakeError || withdrawError || claimError || emergencyError;
    if (error) {
      setMessage(`Error: ${error.message || 'Transaction failed'}`);
      setTimeout(() => setMessage(''), 5000);
    }
  }, [stakeError, withdrawError, claimError, emergencyError]);

  const handleStake = async () => {
    if (!stakeAmount) return;
    
    setIsLoading(true);
    setMessage('');
    
    try {
      if (needsApproval(stakeAmount, allowance)) {
        setMessage('Approving tokens...');
        await approveToken(stakeAmount);
        setMessage('Approval successful! Now staking...');
      }
      
      await stake(stakeAmount);
      setMessage('Staking transaction submitted!');
    } catch (err) {
      console.error('Staking error:', err);
      setMessage(`Error: ${err.message || 'Failed to stake'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    
    setIsLoading(true);
    setMessage('');
    
    try {
      await withdraw(withdrawAmount);
      setMessage('Withdrawal transaction submitted!');
    } catch (err) {
      console.error('Withdrawal error:', err);
      setMessage(`Error: ${err.message || 'Failed to withdraw'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      await claimRewards();
      setMessage('Claim rewards transaction submitted!');
    } catch (err) {
      console.error('Claim rewards error:', err);
      setMessage(`Error: ${err.message || 'Failed to claim rewards'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyWithdraw = async () => {
    if (!window.confirm('Are you sure? This will forfeit all rewards and may include penalties.')) {
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      await emergencyWithdraw();
      setMessage('Emergency withdrawal transaction submitted!');
    } catch (err) {
      console.error('Emergency withdrawal error:', err);
      setMessage(`Error: ${err.message || 'Failed to emergency withdraw'}`);
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Staking Protocol
            </h1>
         
          </div>
          <ConnectButton />
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Message Display */}
        {message && (
          <Card className={`border ${
            message.includes('Error') ? 'border-red-500 bg-red-50' : 
            message.includes('success') || message.includes('confirmed') ? 'border-green-500 bg-green-50' :
            'border-blue-500 bg-blue-50'
          }`}>
            <CardContent className="flex items-center gap-2 pt-4">
              {message.includes('Error') ? (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              ) : message.includes('success') || message.includes('confirmed') ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Info className="h-4 w-4 text-blue-500" />
              )}
              <span className={`text-sm ${
                message.includes('Error') ? 'text-red-700' :
                message.includes('success') || message.includes('confirmed') ? 'text-green-700' :
                'text-blue-700'
              }`}>
                {message}
              </span>
            </CardContent>
          </Card>
        )}

        {/* Protocol Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Staked</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatTokenAmount(totalStaked)} {tokenSymbol}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current APR</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatAPR(initialApr)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Your Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{tokenBalance ? formatTokenAmount(tokenBalance.value) : '0'} {tokenSymbol}</p>
            </CardContent>
          </Card>
        </div>

        {/* User Position */}
        {userDetails && (
          <Card>
            <CardHeader>
              <CardTitle>Your Staking Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Staked Amount</p>
                  <p className="text-lg font-semibold">{formatTokenAmount(userDetails.stakedAmount)} {tokenSymbol}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Rewards</p>
                  <p className="text-lg font-semibold">{formatTokenAmount(userDetails.pendingRewards)} {tokenSymbol}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lock Status</p>
                  <p className="text-lg font-semibold">
                    {userDetails.canWithdraw ? 'Unlocked' : `Locked (${userDetails.timeUntilUnlock}s remaining)`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Interface */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Staking Section */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5" />
                Stake Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount to Stake</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={setMaxStake}>
                    Max
                  </Button>
                </div>
              </div>

              <Button 
                variant="default" 
                className="w-full" 
                disabled={!stakeAmount || isLoading || isAnyPending}
                onClick={handleStake}
              >
                {isLoading || isAnyPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLoading ? 'Processing...' : 'Confirming...'}
                  </>
                ) : (
                  'Stake Tokens'
                )}
              </Button>

            
            </CardContent>
          </Card>

          {/* Withdrawal Section */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5" />
                Withdraw
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="default" 
                className="w-full"
                disabled={!userDetails?.pendingRewards || userDetails.pendingRewards === 0n || isLoading || isAnyPending}
                onClick={handleClaimRewards}
              >
                {isLoading || isAnyPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Claim Rewards (${userDetails ? formatTokenAmount(userDetails.pendingRewards) : '0'} ${tokenSymbol})`
                )}
              </Button>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount to Withdraw</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={setMaxWithdraw}>
                    Max
                  </Button>
                </div>
              </div>

              <Button 
                variant="secondary" 
                className="w-full"
                disabled={!withdrawAmount || !userDetails?.canWithdraw || isLoading || isAnyPending}
                onClick={handleWithdraw}
              >
                {isLoading || isAnyPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : userDetails?.canWithdraw ? (
                  'Withdraw'
                ) : (
                  'Locked - Cannot Withdraw Yet'
                )}
              </Button>

              
            </CardContent>
          </Card>
        </div>

        {/* Emergency Section */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Emergency Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-medium text-destructive mb-1">Emergency Withdrawal</h3>
                  <p className="text-sm text-muted-foreground">
                    Immediately withdraw all staked tokens. This action will forfeit all pending rewards 
                    and may incur a penalty fee. Only use in emergency situations.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="destructive" 
              className="w-full md:w-auto"
              disabled={!userDetails?.stakedAmount || userDetails.stakedAmount === 0n || isLoading || isAnyPending}
              onClick={handleEmergencyWithdraw}
            >
              {isLoading || isAnyPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Emergency Withdraw All'
              )}
            </Button>
          </CardContent>
        </Card>

       
      </div>
    </div>
  );
}