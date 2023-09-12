import fetch from "node-fetch";

export type APICoingeckoResponse = {
  [key: string]: {
    usd: number;
  };
};

export async function callCoingeckoAPI(
  coingeckoId: string
): Promise<APICoingeckoResponse> {
  const uri = `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`;
  // TODO: native fetch should be used on next.js, but node-fetch on server-side
  const req = await fetch(uri);
  const data = (await req.json()) as APICoingeckoResponse;

  return data;
}

export async function getCoingeckoPrice(coingeckoId: string): Promise<number> {
  const data = await callCoingeckoAPI(coingeckoId);
  const priceNumber = Number(data[coingeckoId].usd);
  return priceNumber;
}
