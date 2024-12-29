import { getContract } from "thirdweb/contract";
import client from "@/lib/client";
import { bscTestnet } from "thirdweb/chains";

export const USDCContractAddress = "0xb48249Ef5b895d6e7AD398186DF2B0c3Cec2BF94";
export const USDTContractAddress = "0x37fFAb7530Fbb7E8b4bFeC152132929bdCdae3F3";

export const ScalePayFactoryContractAddress =
  "0x5BaDBC3F72B14EDa2152a00c1AeC1E33744A1186";

export const ScalePayFactoryContract = getContract({
  client,
  chain: bscTestnet,
  address: ScalePayFactoryContractAddress,
});

export const USDCContract = getContract({
  client,
  chain: bscTestnet,
  address: USDCContractAddress,
});

export const USDTContract = getContract({
  client,
  chain: bscTestnet,
  address: USDTContractAddress,
});

export const ScalePayContract = (address: string) =>
  getContract({
    client,
    chain: bscTestnet,
    address: address,
  });
