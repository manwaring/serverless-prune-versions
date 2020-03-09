import { PrunePlugin } from './plugin';
import { LOG_PREFIX } from './log';
import { getServerless, getServerlessWithFunctions } from './mock-data/serverless';
import { defaultOptions, invalidOptions, dryRunOptions, noDeployOptions, emptyOptions } from './mock-data/options';
import { invalidConfig, disabledConfig } from './mock-data/config';

describe('Prune plugin', () => {
  beforeEach(() => {
    jest.resetModules();
    console.log = jest.fn();
  });

  describe('Constructor validation', () => {
    it('Instantiates with valid inputs', () => {
      const mockServerless = getServerless();
      new PrunePlugin(mockServerless, defaultOptions);
    });

    it('Throws an error with invalid config options', () => {
      const mockServerless = getServerless();
      // @ts-ignore
      expect(() => new PrunePlugin(mockServerless, invalidOptions)).toThrow();
    });

    it('Throws an error with invalid custom config', () => {
      const mockInvalidServerless = getServerless(invalidConfig);
      // @ts-ignore
      expect(() => new PrunePlugin(mockInvalidServerless)).toThrow();
    });

    it('Instantiates with empty default options', () => {
      const mockServerless = getServerless();
      new PrunePlugin(mockServerless, emptyOptions);
    });
  });

  describe('Post deploy pruning', () => {
    it("Doesn't remove versions on a dry run", async () => {
      const mockServerless = getServerlessWithFunctions();

      const plugin = new PrunePlugin(mockServerless, dryRunOptions);
      await plugin.postDeployPrune();

      expect(console.log).toHaveBeenCalledWith(
        `${LOG_PREFIX} Dry run complete, no function versions have been removed`
      );
    });

    it("Doesn't run when sls set to noDeploy", async () => {
      console.log = jest.fn();
      const mockServerless = getServerlessWithFunctions();

      const plugin = new PrunePlugin(mockServerless, noDeployOptions);
      await plugin.postDeployPrune();

      expect(console.log).toHaveBeenCalledWith(`${LOG_PREFIX} Skipping pruning because 'noDeploy' was set to true`);
    });

    it("Doesn't run when automatic set to false", async () => {
      console.log = jest.fn();
      const mockServerless = getServerlessWithFunctions(disabledConfig);

      const plugin = new PrunePlugin(mockServerless, noDeployOptions);
      await plugin.postDeployPrune();

      expect(console.log).toHaveBeenCalledWith(`${LOG_PREFIX} Skipping pruning because 'automatic' wasn't set to true`);
    });
  });

  describe('Standalone pruning', () => {
    it("Doesn't remove versions on a dry run", async () => {
      console.log = jest.fn();
      const mockServerless = getServerlessWithFunctions();

      const plugin = new PrunePlugin(mockServerless, dryRunOptions);
      await plugin.standalonePrune();

      expect(console.log).toHaveBeenCalledWith(
        `${LOG_PREFIX} Dry run complete, no function versions have been removed`
      );
    });
  });
});
