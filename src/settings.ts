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

  private getSettings(config: PruneConfig, rawOptions?: Serverless.Options): PruneSettings {
    const options = this.cleanRawOptions(rawOptions);
    const defaultConfig: PruneConfig = {
      automatic: false,
      includeLayers: false,
      number: 5
    };
    const settings = options ? { ...defaultConfig, ...config, ...options } : { ...defaultConfig, ...config };
    return settings;
  }

  private cleanRawOptions(rawOptions?: Serverless.Options): PruneSettings {
    if (rawOptions && Object.keys(rawOptions).length > 0) {
      const replacementKeys = { n: 'number', d: 'dryRun', i: 'includeLayers' };
      const replacedOptions = Object.keys(rawOptions).map(key => {
        const newKey = replacementKeys[key] || key;
        const value = rawOptions[key];
        const numberValue = parseInt(value);
        const newValue = isNaN(numberValue) ? value : numberValue;
        return { [newKey]: newValue };
      });
      const options = replacedOptions?.reduce((option1, option2) => Object.assign({}, option1, option2));
      return options;
    } else {
      return undefined;
    }
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
