module.exports = {
  originEnergyApiClient: {
    output: {
      mode: 'tags',
      target: '.',
      client: 'react-query',
      override: {
        mutator: {
          path: '../mutator/custom-mutator.ts',
          name: 'customMutator',
        },
      },
    },
    input: {
      target: './origin-energy-api-client.yaml',
    },
  },
};
