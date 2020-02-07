import { LambdaLayer } from './layer';
import { LOG_PREFIX } from './log';
import { defaultConfig } from './mock-data/config';
import { getServerlessWithLayers } from './mock-data/serverless';
import { providerWithLayerVersions, providerWithNextMarkers, providerLayerNotDeployed } from './mock-data/provider';
import { Settings } from './settings';

describe('Lambda layer', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = ORIGINAL_ENV;
    jest.resetModules();
    console.log = jest.fn();
  });

  describe('Basic setup', () => {
    it('Instantiates with valid inputs', () => {
      const mockServerless = getServerlessWithLayers();
      const mockSettings = new Settings(defaultConfig);
      new LambdaLayer('name', mockSettings, mockServerless);
    });

    it('Handles truncated aws calls', async () => {
      const mockServerless = getServerlessWithLayers(defaultConfig, providerWithNextMarkers);
      const mockSettings = new Settings(defaultConfig);
      const layerName = 'name';

      const lambda = new LambdaLayer(layerName, mockSettings, mockServerless);
      await lambda.deleteVersions();

      expect(providerWithNextMarkers.request).toHaveBeenCalledWith('Lambda', 'listLayerVersions', {
        LayerName: layerName
      });
      expect(providerWithNextMarkers.request).toHaveBeenCalledWith('Lambda', 'listLayerVersions', {
        LayerName: layerName,
        Marker: '123'
      });
    });
  });

  describe('Layer versions', () => {
    it('Deletes versions', async () => {
      process.env.SLS_DEBUG = '*';
      const mockServerless = getServerlessWithLayers(defaultConfig, providerWithLayerVersions);
      const mockSettings = new Settings(defaultConfig);
      const layerName = 'name';

      const lambda = new LambdaLayer(layerName, mockSettings, mockServerless);
      await lambda.deleteVersions();

      expect(console.log).toHaveBeenCalledWith(
        `${LOG_PREFIX} The ${layerName} layer has 3 versions: 1 versions will be pruned`
      );
      expect(providerWithLayerVersions.request).toHaveBeenCalledWith('Lambda', 'deleteLayerVersion', {
        LayerName: layerName,
        VersionNumber: 1
      });
    });

    it("Can't delete layers that aren't deployed", async () => {
      process.env.SLS_DEBUG = '*';
      const mockServerless = getServerlessWithLayers(defaultConfig, providerLayerNotDeployed);
      const mockSettings = new Settings(defaultConfig);
      const functionName = 'name';

      const lambda = new LambdaLayer(functionName, mockSettings, mockServerless);
      await lambda.deleteVersions();

      expect(console.log).toHaveBeenCalledWith(
        `${LOG_PREFIX} Couldn't get ${functionName} versions because the function isn't deployed`
      );
    });
  });
});
