import { ok } from 'assert';

export class Settings implements PruneSettings {
  automatic?: boolean;
  number?: number;
  stage?: string;
  region?: string;
  function?: string;
  layer?: string;
  includeLayers?: boolean;
  dryRun?: boolean;
  noDeploy?: boolean;

  constructor(config: PruneConfig, rawOptions?: Serverless.Options) {
    const settings = this.getSettings(config, rawOptions);
    this.validate(settings);
    Object.assign(this, settings);
  }

  private getSettings(config: Serverless.Options, rawOptions?: Serverless.Options): PruneSettings {
    const options = this.mapOptionShortcutsToFullProperties(rawOptions);
    const defaultConfig: PruneConfig = {
      automatic: false,
      includeLayers: false,
      number: 5
    };
    const settings = options ? { ...defaultConfig, ...config, ...options } : { ...defaultConfig, ...config };
    return settings;
  }

  private mapOptionShortcutsToFullProperties(rawOptions?: Serverless.Options): PruneSettings {
    if (rawOptions?.d) {
      rawOptions['dryRun'] = rawOptions.d;
      delete rawOptions.d;
    }
    if (rawOptions?.n) {
      rawOptions['number'] = rawOptions.n;
      delete rawOptions.n;
    }
    if (rawOptions?.i) {
      rawOptions['includeLayers'] = rawOptions.i;
      delete rawOptions.i;
    }
    return rawOptions;
  }

  private validate({ automatic, includeLayers, number }: PruneConfig) {
    ok(typeof automatic === 'boolean', this.validationMsg('automatic', 'true or false', typeof automatic));
    ok(typeof includeLayers === 'boolean', this.validationMsg('includeLayers', 'true or false', typeof includeLayers));
    ok(typeof number === 'number', this.validationMsg('number', 'an integer greater than 1', typeof number));
    ok(number > 1, this.validationMsg('number', 'an integer greater than 1', number));
  }

  private validationMsg(property: string, expected: string, actual: any): string {
    return `The prune config '${property}' property can only be ${expected}, not ${actual}`;
  }
}
