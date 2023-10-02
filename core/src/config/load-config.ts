let config;

export interface ConfigType {
  networks: {
    [key: number]: {
      routerAddress: string;
      routerSimulatorAddress: string;
      gammaRatiosCalculator: string;
    };
  };
}

export const loadConfig = async (): Promise<ConfigType> => {
  config = (await import("./config.default")).default;

  return config;
};
