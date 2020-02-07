import { ok, deepStrictEqual } from 'assert';
import { commands } from './commands';
import { LambdaFunction } from './function';
import { LambdaLayer } from './layer';
import { LOG_PREFIX } from './log';
import { Settings } from './settings';

export class PrunePlugin {
  private settings: Settings;
  private hooks = {
    'prune:prune': this.standalonePrune.bind(this),
    'after:deploy:deploy': this.postDeployPrune.bind(this)
  };
  private commands = commands;

  constructor(private serverless: Serverless, rawOptions?: Serverless.Options) {
    this.settings = new Settings(serverless.service?.custom?.prune, rawOptions);
    this.validateServerlessYml();
  }

  postDeployPrune(): Promise<any> {
    return this.shouldPostDeployPrune() && this.prune();
  }

  standalonePrune(): Promise<any> {
    return this.prune();
  }

  private prune(): Promise<any> {
    if (this.settings.includeLayers) {
      this.log('Pruning Lambda function versions and layers...');
      return Promise.all([this.pruneVersions(), this.pruneLayers()]);
    } else {
      this.log('Pruning Lambda function versions...');
      return this.pruneVersions();
    }
  }

  private validateServerlessYml() {
    ok(this.serverless, `Invalid serverless.yml file`);
    ok(this.serverless?.service, `Missing required service section in serverless.yml`);
    ok(this.serverless?.service?.provider, `Missing required provider section in serverless.yml`);
    const providerName = this.serverless?.service?.provider?.name;
    ok(providerName, `Missing required name property of provider section in serverless.yml`);
    deepStrictEqual(providerName, 'aws', `This plugin only supports AWS as a provider`);
  }

  private shouldPostDeployPrune(): boolean {
    const noDeploy = this.settings.noDeploy === true;
    if (noDeploy) {
      this.log("Skipping pruning because 'noDeploy' was set to true");
    }
    const automaticPruning = this.settings.automatic === true;
    if (!automaticPruning) {
      this.log("Skipping pruning because 'automatic' wasn't set to true");
    }
    return !noDeploy && automaticPruning;
  }

  private async pruneVersions(): Promise<any> {
    const functions = this.settings.function ? [this.settings.function] : this.serverless.service.getAllFunctions();
    const functionsToPrune = functions.map(f => {
      const name = this.serverless.service.getFunction(f).name;
      return new LambdaFunction(name, this.settings, this.serverless);
    });
    const prunedVersions = await Promise.all(functionsToPrune.map(f => f.deleteVersions()));
    const didPrune = prunedVersions.filter(pruned => pruned);
    if (this.settings.dryRun) {
      this.log('Dry run complete, no function versions have been removed');
    } else if (didPrune.length > 0) {
      this.log(
        `Function version pruning complete, pruned versions from ${didPrune.length} of ${functionsToPrune.length} functions`
      );
    } else if (didPrune.length === 0) {
      this.log(`Function version pruning complete, no versions to prune in ${functionsToPrune.length} functions`);
    }
    return;
  }

  private async pruneLayers(): Promise<any> {
    const layers = this.settings.layer ? [this.settings.layer] : this.serverless.service.getAllLayers();
    const layersToPrune = layers.map(l => {
      const name = this.serverless.service.getLayer(l).name;
      return new LambdaLayer(name, this.settings, this.serverless);
    });
    const prunedLayers = await Promise.all(layersToPrune.map(l => l.deleteVersions()));
    const didPrune = prunedLayers.filter(pruned => pruned);
    if (this.settings.dryRun) {
      this.log('Dry run complete, no layer versions have been removed');
    } else if (didPrune.length > 0) {
      this.log(
        `Layer version pruning complete, pruned versions from ${didPrune.length} of ${layersToPrune.length} layers`
      );
    } else if (didPrune.length === 0) {
      this.log(`Layer version pruning complete, no versions to prune in ${layersToPrune.length} layers`);
    }
    return;
  }

  private log(message: string) {
    this.serverless.cli.log(`${LOG_PREFIX} ${message}`);
  }

  private debug(message: string) {
    if (process.env.SLS_DEBUG) {
      this.serverless.cli.log(`${LOG_PREFIX} ${message}`);
    }
  }
}
