import { defaultConfig } from './config';
import { defaultProvider, providerWithVersions } from './provider';

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
      provider: { name: 'aws' },
      custom: { prune: config }
    }
  };
}

export function getServerlessWithFunctions(
  config: any = defaultConfig,
  provider: Serverless.Provider.Aws = providerWithVersions
): Serverless {
  return {
    getProvider: (name: string) => provider,
    cli: { log: message => console.log(message) },
    service: {
      getAllFunctions: () => ['function1', 'function2'],
      getFunction: f => ({ name: f }),
      provider: { name: 'aws' },
      custom: { prune: config }
    }
  };
}
