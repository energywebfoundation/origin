module.exports = {
  originDeviceRegistryIrecLocalApiClient: {
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
      target: './origin-device-registry-irec-local-api-client.yaml',
    },
  },
};
