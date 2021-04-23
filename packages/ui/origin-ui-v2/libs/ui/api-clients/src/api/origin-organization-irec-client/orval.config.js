module.exports = {
  originOrganizationIRecApiClient: {
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
      target: './origin-organization-irec-api-client.yaml',
    },
  },
};
