import { ok, deepStrictEqual } from 'assert';
import { commands } from './commands';
import { LambdaFunction } from './function';
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
    const functionsToPrune = functions
      .map(f => {
        const name = this.serverless.service.getFunction(f).name;
        return new LambdaFunction(name, this.settings, this.serverless);
      })
      .filter(lambda => lambda.shouldDeleteVersions());
    await Promise.all(functionsToPrune.map(f => f.deleteVersions()));
    if (this.settings.dryRun) {
      this.log('Dry run complete, no versions have been removed');
    } else if (functionsToPrune.length > 0) {
      this.log(`Pruning complete, pruned ${functionsToPrune.length} of ${functions.length} functions`);
    } else if (functionsToPrune.length === 0) {
      this.log(`Pruning complete, no versions to prune of ${functions.length} functions`);
    }
    return;
  }

  private pruneLayers(): Promise<any> {
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
