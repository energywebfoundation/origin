module.exports = {
  issuerApiClient: {
    output: {
      mode: 'tags',
      target: '.',
      client: 'react-query',
      override: {
        mutator: {
          path: '../mutator/custom-mutator.ts',
          name: 'customMutator',
        },
        title: (title) => {
          return `${title}Api`;
        },
      },
    },
    input: {
      target: './issuer-api-client.yaml',
    },
  },
};
