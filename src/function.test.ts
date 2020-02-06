import { LambdaFunction } from './function';
import { LOG_PREFIX } from './log';
import { defaultConfig } from './mock-data/config';
import { defaultOptions } from './mock-data/options';
import { getServerlessWithFunctions } from './mock-data/serverless';
import {
  providerWithVersions,
  providerWithReplicatedVersions,
  providerFunctionNotDeployed,
  providerWithNextMarkers
} from './mock-data/provider';
import { Settings } from './settings';

describe('Lambda function', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = ORIGINAL_ENV;
    jest.resetModules();
    console.log = jest.fn();
  });

  describe('Basic setup', () => {
    it('Instantiates with valid inputs', () => {
      const mockServerless = getServerlessWithFunctions();
      const mockSettings = new Settings(defaultConfig);
      new LambdaFunction('name', mockSettings, mockServerless);
    });

    it('Handles truncated aws calls', async () => {
      const mockServerless = getServerlessWithFunctions(defaultConfig, providerWithNextMarkers);
      const mockSettings = new Settings(defaultConfig);
      const functionName = 'name';

      const lambda = new LambdaFunction(functionName, mockSettings, mockServerless);
      await lambda.deleteVersions();

      expect(providerWithNextMarkers.request).toHaveBeenCalledWith('Lambda', 'listVersionsByFunction', {
        FunctionName: functionName
      });
      expect(providerWithNextMarkers.request).toHaveBeenCalledWith('Lambda', 'listVersionsByFunction', {
        FunctionName: functionName,
        Marker: '123'
      });
      expect(providerWithNextMarkers.request).toHaveBeenCalledWith('Lambda', 'listAliases', {
        FunctionName: functionName
      });
      expect(providerWithNextMarkers.request).toHaveBeenCalledWith('Lambda', 'listAliases', {
        FunctionName: functionName,
        Marker: '123'
      });
    });
  });

  describe('Function versions', () => {
    it('Deletes versions', async () => {
      process.env.SLS_DEBUG = '*';
      const mockServerless = getServerlessWithFunctions(defaultConfig, providerWithVersions);
      const mockSettings = new Settings(defaultConfig);
      const functionName = 'name';

      const lambda = new LambdaFunction(functionName, mockSettings, mockServerless);
      await lambda.deleteVersions();

      expect(console.log).toHaveBeenCalledWith(
        `${LOG_PREFIX} The ${functionName} function has 3 versions and 1 aliases: 1 versions will be pruned`
      );
      expect(providerWithVersions.request).toHaveBeenCalledWith('Lambda', 'deleteFunction', {
        FunctionName: functionName,
        Qualifier: 1
      });
    });

    it("Can't delete Lambda@Edge versions", async () => {
      process.env.SLS_DEBUG = '*';
      const mockServerless = getServerlessWithFunctions(defaultConfig, providerWithReplicatedVersions);
      const mockSettings = new Settings(defaultConfig);
      const functionName = 'name';

      const lambda = new LambdaFunction(functionName, mockSettings, mockServerless);
      await lambda.deleteVersions();

      expect(console.log).toHaveBeenCalledWith(
        `${LOG_PREFIX} The ${functionName} function has 3 versions and 1 aliases: 1 versions will be pruned`
      );
      expect(providerWithVersions.request).toHaveBeenCalledWith('Lambda', 'deleteFunction', {
        FunctionName: functionName,
        Qualifier: 1
      });
      expect(console.log).toHaveBeenCalledWith(
        `${LOG_PREFIX} Couldn't prune version v${1} from ${functionName} because it is replicated to Lambda@Edge`
      );
    });

    it("Can't delete functions that aren't deployed", async () => {
      process.env.SLS_DEBUG = '*';
      const mockServerless = getServerlessWithFunctions(defaultConfig, providerFunctionNotDeployed);
      const mockSettings = new Settings(defaultConfig);
      const functionName = 'name';

      const lambda = new LambdaFunction(functionName, mockSettings, mockServerless);
      await lambda.deleteVersions();

      expect(console.log).toHaveBeenCalledWith(
        `${LOG_PREFIX} Couldn't get ${functionName} versions because the function isn't deployed`
      );
    });
  });

  describe('Layer versions', () => {
    it('', () => {
      // TODO
    });
  });
});
