import { LOG_PREFIX } from './log';
import { Settings } from './settings';

export class LambdaLayer {
  private provider: Serverless.Provider.Aws;
  constructor(private name: string, private settings: Settings, private serverless: Serverless) {
    this.provider = serverless.getProvider('aws');
  }

  public async deleteVersions(): Promise<boolean> {
    const versionsToDelete = await this.getVersionsToDelete();
    if (!this.settings.dryRun) {
      await Promise.all(versionsToDelete.map(version => this.deleteVersion(version)));
    }
    return versionsToDelete.length > 0;
  }

  private async getVersionsToDelete(): Promise<string[]> {
    const versions = await this.getVersions();
    const versionsToDelete = versions
      .sort((version1, version2) => {
        const v1 = parseInt(version1);
        const v2 = parseInt(version2);
        return v1 === v2 ? 0 : v1 > v2 ? -1 : 1;
      })
      .slice(this.settings.number);

    const message = `The ${this.name} layer has ${versions.length - 1} versions: ${
      versionsToDelete.length
    } versions will be pruned`;
    if (this.settings.dryRun) {
      this.log(message);
    } else {
      this.debug(message);
    }

    return versionsToDelete;
  }

  private async deleteVersion(version: string): Promise<any> {
    try {
      const params = {
        LayerName: this.name,
        VersionNumber: version
      };
      await this.provider.request('Lambda', 'deleteLayerVersion', params);
    } catch (err) {
      throw err;
    }
  }

  private async getVersions(): Promise<string[]> {
    let output;
    let versions: string[] = [];
    do {
      const params = { LayerName: this.name };
      if (output?.NextMarker) {
        params['Marker'] = output.NextMarker;
      }
      try {
        output = await this.provider.request('Lambda', 'listLayerVersions', params);
        if (output?.Versions?.length) {
          versions = [...versions, ...output.Versions.map(version => version.Version)];
        }
      } catch (err) {
        if (this.errorIsFromLayerNotDeployed(err)) {
          this.debug(`Couldn't get ${this.name} versions because the function isn't deployed`);
        } else {
          throw err;
        }
      }
    } while (output?.NextMarker);
    return versions;
  }

  private errorIsFromLayerNotDeployed(err): boolean {
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
