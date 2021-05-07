module.exports = {
  originDeviceRegistryIrecFormApiClient: {
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
      target: './origin-device-registry-irec-form-api-client.yaml',
    },
  },
};
