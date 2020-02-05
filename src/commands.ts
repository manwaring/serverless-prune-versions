export const commands = {
  prune: {
    usage: 'Remove older versions of Lambda function and layer versions',
    lifecycleEvents: ['prune'],
    options: {
      number: {
        usage: 'Number of versions to keep',
        shortcut: 'n',
        required: true
      },
      stage: {
        usage: 'Stage of the service to prune',
        shortcut: 's'
      },
      region: {
        usage: 'Region of the service to prune',
        shortcut: 'r'
      },
      function: {
        usage: 'Name of the function to prune (if left blank all functions will be pruned)',
        shortcut: 'f'
      },
      layer: {
        usage: 'Name of the layer to prune (if left blank all layers will be pruned)',
        shortcut: 'l'
      },
      includeLayers: {
        usage: 'Boolean indicating if layers should also be pruned',
        shortcut: 'i'
      },
      dryRun: {
        usage: 'List the resources that will be pruned without deleting or otherwise modifying anything',
        shortcut: 'd'
      }
    }
  }
};
