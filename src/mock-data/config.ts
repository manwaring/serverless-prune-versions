export const defaultConfig: PruneConfig = {
  automatic: true,
  includeLayers: false,
  number: 2
};

export const disabledConfig: PruneConfig = {
  automatic: false,
  includeLayers: false,
  number: 2
};

export const invalidConfig = {
  automatic: 5,
  includeLayers: 'string',
  number: 'invalid'
};
