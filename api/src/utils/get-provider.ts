import { AlchemyProvider } from "@ethersproject/providers";

export async function getProvider({ chainId }: { chainId: number }) {
  const provider = new AlchemyProvider(chainId, process.env.ALCHEMY_KEY);

  return provider;
}
