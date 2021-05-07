module.exports = {
  exchangeApiClient: {
    output: {
      mode: 'tags',
      target: '.',
      client: 'react-query',
      useQuery: false,
      override: {
        mutator: {
          path: '../mutator/custom-mutator.ts',
          name: 'customMutator',
        },
      },
    },
    input: {
      target: './exchange-api-client.yaml',
    },
  },
};
