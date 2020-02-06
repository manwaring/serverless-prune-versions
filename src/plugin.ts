import { ok, deepStrictEqual } from 'assert';
import { commands } from './commands';
import { LambdaFunction } from './function';
import { LOG_PREFIX } from './log';

export class PrunePlugin {
  private config: PruneConfig;
  private hooks = {
    'prune:prune': this.standalonePrune.bind(this),
    'after:deploy:deploy': this.postDeployPrune.bind(this)
  };
  private commands = commands;

  constructor(private serverless: Serverless, private options?: Serverless.Options) {
    this.config = this.getConfig(serverless.service?.custom?.prune, options);
    this.validateServerlessYml();
    this.validatePruneConfig(this.config);
  }

  postDeployPrune(): Promise<any> {
    return this.shouldPostDeployPrune() && this.prune();
  }

  standalonePrune(): Promise<any> {
    return this.prune();
  }

  private prune(): Promise<any> {
    if (this.config.includeLayers) {
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

  private validatePruneConfig({ automatic, includeLayers, number }: PruneConfig) {
    ok(typeof automatic === 'boolean', this.validationMsg('automatic', 'true or false', typeof automatic));
    ok(typeof includeLayers === 'boolean', this.validationMsg('includeLayers', 'true or false', typeof includeLayers));
    ok(typeof number === 'number', this.validationMsg('number', 'an integer greater than 1', typeof number));
    ok(number > 1, this.validationMsg('number', 'an integer greater than 1', number));
  }

  private validationMsg(property: string, expected: string, actual: any): string {
    return `The prune config '${property}' property can only be ${expected}, not ${actual}`;
  }

  private getConfig(customConfig: any, configOptions?: Serverless.Options): PruneConfig {
    const defaultConfig: PruneConfig = {
      automatic: false,
      includeLayers: false,
      number: 5
    };
    this.debug(`Default config ${JSON.stringify(defaultConfig)}`);
    this.debug(`Custom config ${JSON.stringify(customConfig)}`);
    this.debug(`Config options ${JSON.stringify(configOptions)}`);
    const config = { ...defaultConfig, ...customConfig, ...configOptions };
    this.debug(`Config ${JSON.stringify(config)}`);
    return config;
  }

  private shouldPostDeployPrune(): boolean {
    const noDeploy = this.options.noDeploy === true;
    if (noDeploy) {
      this.log("Skipping pruning because 'noDeploy' was set to true");
    }
    const automaticPruning = this.config.automatic === true;
    if (!automaticPruning) {
      this.log("Skipping pruning because 'automatic' wasn't set to true");
    }
    return !noDeploy && automaticPruning;
  }

  private async pruneVersions(): Promise<any> {
    const functions = this.options.function ? [this.options.function] : this.serverless.service.getAllFunctions();
    const functionsToPrune = functions.map(f => {
      const name = this.serverless.service.getFunction(f).name;
      return new LambdaFunction(name, this.config, this.options, this.serverless);
    });
    await Promise.all(functionsToPrune.map(f => f.deleteVersions()));
    if (this.options.dryRun) {
      this.log('Dry run complete, no versions have been removed');
    } else {
      this.log(`Pruning complete, pruned ${functionsToPrune.length} functions`);
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

//  PrunePlugin;
