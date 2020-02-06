export const defaultOptions: Serverless.Options = {
  stage: '',
  region: '',
  number: '5'
};

export const invalidOptions = {
  number: '0'
};

export const dryRunOptions = {
  dryRun: true
};

export const noDeployOptions = {
  noDeploy: true
};
