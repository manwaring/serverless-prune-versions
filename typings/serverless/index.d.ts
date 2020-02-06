declare interface PruneConfig {
  automatic?: boolean;
  includeLayers?: boolean;
  number?: number;
}

declare interface PruneSettings {
  stage?: string;
  region?: string;
  automatic?: boolean;
  includeLayers?: boolean;
  number?: number;
  dryRun?: boolean;
  noDeploy?: boolean;
  function?: string;
  layer?: string;
}

declare namespace Serverless {
  interface Options {
    number?: number;
    n?: number;
    stage?: string;
    region?: string;
    function?: string;
    layer?: string;
    includeLayers?: boolean;
    i?: boolean;
    dryRun?: boolean;
    d?: boolean;
    noDeploy?: boolean;
  }

  namespace Provider {
    class Aws {
      constructor(serverless: Serverless, options: Serverless.Options);

      getProviderName: () => string;
      getRegion: () => string;
      getStage: () => string;
      request: (service: string, method: string, params: any, stage?: string, region?: string) => Promise<any>;
    }
  }
}

declare interface Serverless {
  getProvider(name: string): Serverless.Provider.Aws;

  cli: {
    log(message: string): void;
  };

  service: {
    getAllFunctions(): string[];
    getFunction(
      string
    ): {
      name: string;
    };

    custom?: {
      prune?: PruneConfig;
    };

    provider: {
      name: string;
    };
  };
}
