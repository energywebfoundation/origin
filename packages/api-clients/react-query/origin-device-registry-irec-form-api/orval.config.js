module.exports = {
    formDeviceRegistryClient: {
        input: {
            target: './src/schema.yaml'
        },
        output: {
            client: 'react-query',
            mode: 'tags',
            target: './src/client'
        }
    }
};
