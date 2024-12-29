"use client";
import client from "@/lib/client";
import { bscTestnet } from "thirdweb/chains";
import React from "react";
import { ConnectButton } from "thirdweb/react";
import { readContract } from "thirdweb";
import { ScalePayFactoryContract } from "@/contracts/contracts";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="h-16 flex justify-between items-center p-4 bg-gray-900">
      <div className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="PayScale"
          width={50}
          height={50}
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold">PayScale</h1>
      </div>
      <ConnectButton
        client={client}
        chain={bscTestnet}
        connectModal={{
          size: "wide",
        }}
        connectButton={{
          label: "Connect Wallet",
        }}
        onConnect={(wallet) => {
          const account = wallet.getAccount();
          if (account?.address && pathname === "/") {
            readContract({
              contract: ScalePayFactoryContract,
              method:
                "function getDeployedContract(address _owner) external view returns (address)",
              params: [account.address],
            }).then((data) => {
              if (data !== "0x0000000000000000000000000000000000000000") {
                localStorage.setItem("scalePayAddress", data);
                router.push("/employer");
              } else {
                router.push("/onboarding");
              }
            });
          }
        }}
        onDisconnect={() => {
          localStorage.clear();
          if (pathname !== "/") {
            router.push("/");
          }
          toast.error("Wallet disconnected");
        }}
      />
    </div>
  );
};

export default Navbar;
