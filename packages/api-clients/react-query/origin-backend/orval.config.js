module.exports = {
    backendClient: {
        input: {
            target: './src/schema.yaml'
        },
        output: {
            client: 'react-query',
            mode: 'tags',
            target: './src/client',
            override: {
                mutator: {
                    path: './src/mutator/customInstance.ts',
                    name: 'customInstance'
                }
            }
        }
    }
};
