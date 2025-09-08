import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  ArrowUpCircle,
  ArrowDownCircle,
  Shield
} from 'lucide-react';

export default function StakingDashboard() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

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
                  <Button variant="outline" size="sm">
                    Max
                  </Button>
                </div>
              </div>

              <Button 
                variant="default" 
                className="w-full" 
                disabled={!stakeAmount}
              >
                Stake ETH
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
              <Button variant="default" className="w-full">
                Claim Rewards
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
                  <Button variant="outline" size="sm">
                    Max
                  </Button>
                </div>
              </div>

              <Button 
                variant="secondary" 
                className="w-full"
                disabled={!withdrawAmount}
              >
                Request Withdrawal
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
            
            <Button variant="destructive" className="w-full md:w-auto">
              Emergency Withdraw All
            </Button>
          </CardContent>
        </Card>

       
      </div>
    </div>
  );
}