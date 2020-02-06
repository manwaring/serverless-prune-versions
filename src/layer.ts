import { LOG_PREFIX } from './log';

export class Layer {
  private provider: Serverless.Provider.Aws;
  constructor(private name: string, private numberToRetain: number, private serverless: Serverless) {
    this.provider = serverless.getProvider('aws');
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
