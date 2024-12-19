"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useNetwork } from "wagmi";

export function NetworkIndicator() {
  const { chain } = useNetwork();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!chain) {
    return (
      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
        Not Connected
      </Badge>
    );
  }

  const isBase = chain.id === 8453;
  const isEthereum = chain.id === 1;

  if (!isBase && !isEthereum) {
    return (
      <Badge variant="outline" className="text-red-600 border-red-600">
        Unsupported Network
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-green-600 border-green-600">
      {isBase ? "Base" : "Ethereum"}
    </Badge>
  );
}
