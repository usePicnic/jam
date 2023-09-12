import { RateLimiter } from "limiter";

export const limiterParaswap = new RateLimiter(1, 1100);
export const limiterParaswapFull = new RateLimiter(1, 1100);

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

export async function useLimiter(
  limiter: any,
  func: Function,
  params: any
): Promise<any> {
  const remainingRequests = limiter.getTokensRemaining();

  if (remainingRequests >= 1) {
    limiter.tryRemoveTokens(1);
    return await func(params);
  } else {
    await sleep(limiter.tokenBucket.interval);
    return await useLimiter(limiter, func, params);
  }
}
