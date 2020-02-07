import { defaultConfig } from './config';
import { defaultProvider, providerWithFunctionVersions, providerWithLayerVersions } from './provider';

export function getServerless(
  config: any = defaultConfig,
  provider: Serverless.Provider.Aws = defaultProvider
): Serverless {
  return {
    getProvider: (name: string) => provider,
    cli: { log: () => {} },
    service: {
      getAllFunctions: () => [''],
      getFunction: string => ({ name: string }),
      getAllLayers: () => [''],
      getLayer: string => ({ name: string }),
      provider: { name: 'aws' },
      custom: { prune: config }
    }
  };
}

export function getServerlessWithFunctions(
  config: any = defaultConfig,
  provider: Serverless.Provider.Aws = providerWithFunctionVersions
): Serverless {
  return {
    getProvider: (name: string) => provider,
    cli: { log: message => console.log(message) },
    service: {
      getAllFunctions: () => ['function1', 'function2'],
      getFunction: f => ({ name: f }),
      getAllLayers: () => [''],
      getLayer: string => ({ name: string }),
      provider: { name: 'aws' },
      custom: { prune: config }
    }
  };
}

export function getServerlessWithLayers(
  config: any = defaultConfig,
  provider: Serverless.Provider.Aws = providerWithLayerVersions
): Serverless {
  return {
    getProvider: (name: string) => provider,
    cli: { log: message => console.log(message) },
    service: {
      getAllFunctions: () => ['function1', 'function2'],
      getFunction: f => ({ name: f }),
      getAllLayers: () => [''],
      getLayer: string => ({ name: string }),
      provider: { name: 'aws' },
      custom: { prune: config }
    }
  };
}
