"use client";

import { Button } from "@/components/ui/button";
import { useAccount, useConnect } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

export function ConnectButton() {
  const { connect } = useConnect();
  const { isConnected } = useAccount();

  if (isConnected) return null;

  return (
    <Button
      variant="outline"
      onClick={() => connect({ connector: new MetaMaskConnector() })}
    >
      Connect Wallet
    </Button>
  );
}
