import { LOG_PREFIX } from './log';

export class LambdaFunction {
  private provider: Serverless.Provider.Aws;
  constructor(
    private name: string,
    private config: PruneConfig,
    private options: Serverless.Options,
    private serverless: Serverless
  ) {
    this.provider = serverless.getProvider('aws');
  }

  public async deleteVersions(): Promise<any> {
    const versionsToDelete = await this.getVersionsToDelete();
    if (!this.options.dryRun) {
      await Promise.all(versionsToDelete.map(version => this.deleteVersion(version)));
    }
  }

  private async getVersionsToDelete(): Promise<string[]> {
    const versions = await this.getVersions();
    const aliases = await this.getAliases();
    const versionsToDelete = versions
      .filter(version => version !== '$LATEST')
      .filter(version => aliases.indexOf(version) === -1)
      .sort((version1, version2) => {
        const v1 = parseInt(version1);
        const v2 = parseInt(version2);
        return v1 === v2 ? 0 : v1 > v2 ? -1 : 1;
      })
      .slice(this.config.number);

    const message = `The ${this.name} function has ${versions.length - 1} versions and ${aliases.length} aliases: ${
      versionsToDelete.length
    } versions will be pruned`;
    if (this.options.dryRun) {
      this.log(message);
    } else {
      this.debug(message);
    }

    return versionsToDelete;
  }

  private async deleteVersion(version: string): Promise<any> {
    try {
      const params = {
        FunctionName: this.name,
        Qualifier: version
      };
      await this.provider.request('Lambda', 'deleteFunction', params);
    } catch (err) {
      if (this.errorIsFromReplicatedLambdaAtEdge(err)) {
        this.log(`Couldn't prune version v${version} from ${this.name} because it is replicated to Lambda@Edge`);
      } else {
        throw err;
      }
    }
  }

  private async getVersions(): Promise<string[]> {
    let output;
    let versions: string[] = [];
    do {
      const params = { FunctionName: this.name };
      if (output?.NextMarker) {
        params['Marker'] = output.NextMarker;
      }
      try {
        output = await this.provider.request('Lambda', 'listVersionsByFunction', params);
        if (output?.Versions?.length) {
          versions = [...versions, ...output.Versions.map(version => version.Version)];
        }
      } catch (err) {
        if (this.errorIsFromFunctionNotDeployed(err)) {
          this.debug(`Couldn't get ${this.name} versions because the function isn't deployed`);
        } else {
          throw err;
        }
      }
    } while (output?.NextMarker);
    return versions;
  }

  private async getAliases(): Promise<string[]> {
    let output;
    let aliases: string[] = [];
    do {
      const params = { FunctionName: this.name };
      if (output?.NextMarker) {
        params['Marker'] = output.NextMarker;
      }
      try {
        output = await this.provider.request('Lambda', 'listAliases', params);
        if (output?.Aliases?.length) {
          aliases = [...aliases, ...output.Aliases.map(alias => alias.FunctionVersion)];
        }
      } catch (err) {
        if (!this.errorIsFromFunctionNotDeployed(err)) {
          throw err;
        }
      }
    } while (output?.NextMarker);
    return aliases;
  }

  private errorIsFromReplicatedLambdaAtEdge(err): boolean {
    return (
      err.statusCode === 400 &&
      err?.message.startsWith('Lambda was unable to delete') &&
      err?.message.indexOf('because it is a replicated function') > -1
    );
  }

  private errorIsFromFunctionNotDeployed(err): boolean {
    return err?.statusCode === 404;
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
