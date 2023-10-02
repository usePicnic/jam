import * as defaultConfig from "./config.default";

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
  let config = defaultConfig.default;

  return config;
};
