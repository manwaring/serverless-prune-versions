const FunctionVersions = [{ Version: 1 }, { Version: 2 }, { Version: 3 }, { Version: '$LATEST' }];
const LayerVersions = [{ Version: 1 }, { Version: 2 }, { Version: 3 }, { Version: 4 }];
const Aliases = [{ FunctionVersion: 4 }];

export const defaultProvider: Serverless.Provider.Aws = {
  getProviderName: () => '',
  getRegion: () => '',
  getStage: () => '',
  request: (service: string, method: string, data: {}, stage: string, region: string): Promise<any> => undefined
};

export const providerWithFunctionVersions: Serverless.Provider.Aws = {
  getProviderName: () => '',
  getRegion: () => '',
  getStage: () => '',
  request: jest.fn((service: string, method: string, data: {}, stage: string, region: string) => {
    switch (method) {
      case 'listVersionsByFunction':
        return Promise.resolve({ NextMarker: undefined, Versions: FunctionVersions });
      case 'listAliases':
        return Promise.resolve({ NextMarker: undefined, Aliases });
      case 'deleteFunction':
        return Promise.resolve();
      case 'listLayerVersions':
        return Promise.resolve();
      case 'deleteLayerVersion':
        return Promise.resolve();
    }
  })
};

export const providerWithLayerVersions: Serverless.Provider.Aws = {
  getProviderName: () => '',
  getRegion: () => '',
  getStage: () => '',
  request: jest.fn((service: string, method: string, data: {}, stage: string, region: string) => {
    switch (method) {
      case 'listVersionsByFunction':
        return Promise.resolve();
      case 'listAliases':
        return Promise.resolve();
      case 'deleteFunction':
        return Promise.resolve();
      case 'listLayerVersions':
        return Promise.resolve({ NextMarker: undefined, Versions: LayerVersions });
      case 'deleteLayerVersion':
        return Promise.resolve();
    }
  })
};

export const providerWithReplicatedVersions: Serverless.Provider.Aws = {
  getProviderName: () => '',
  getRegion: () => '',
  getStage: () => '',
  request: jest.fn((service: string, method: string, data: {}, stage: string, region: string) => {
    switch (method) {
      case 'listVersionsByFunction':
        return Promise.resolve({ NextMarker: undefined, Versions: FunctionVersions });
      case 'listAliases':
        return Promise.resolve({ NextMarker: undefined, Aliases });
      case 'deleteFunction':
        throw {
          statusCode: 400,
          message: 'Lambda was unable to delete because it is a replicated function'
        };
    }
  })
};

export const providerFunctionNotDeployed: Serverless.Provider.Aws = {
  getProviderName: () => '',
  getRegion: () => '',
  getStage: () => '',
  request: jest.fn((service: string, method: string, data: {}, stage: string, region: string) => {
    switch (method) {
      case 'listVersionsByFunction':
        throw { statusCode: 404 };
      case 'listAliases':
        return Promise.resolve({ NextMarker: undefined, Aliases });
      case 'deleteFunction':
        return Promise.resolve();
    }
  })
};

export const providerLayerNotDeployed: Serverless.Provider.Aws = {
  getProviderName: () => '',
  getRegion: () => '',
  getStage: () => '',
  request: jest.fn((service: string, method: string, data: {}, stage: string, region: string) => {
    switch (method) {
      case 'listLayerVersions':
        throw { statusCode: 404 };
      case 'deleteFunction':
        return Promise.resolve();
    }
  })
};

export const providerWithNextMarkers: Serverless.Provider.Aws = {
  getProviderName: () => '',
  getRegion: () => '',
  getStage: () => '',
  request: jest.fn((service: string, method: string, data: any, stage: string, region: string) => {
    switch (method) {
      case 'listVersionsByFunction':
        const versionMarker = data?.Marker ? undefined : '123';
        return Promise.resolve({ NextMarker: versionMarker, Versions: FunctionVersions });
      case 'listAliases':
        const aliasMarker = data?.Marker ? undefined : '123';
        return Promise.resolve({ NextMarker: aliasMarker, Aliases });
      case 'deleteFunction':
        return Promise.resolve();
      case 'listLayerVersions':
        const layerMarker = data?.Marker ? undefined : '123';
        return Promise.resolve({ NextMarker: layerMarker, Versions: LayerVersions });
      case 'deleteLayerVersion':
        return Promise.resolve();
    }
  })
};
