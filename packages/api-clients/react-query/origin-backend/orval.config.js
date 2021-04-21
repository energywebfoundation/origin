module.exports = {
    exchangeRestClient: {
        input: {
            target: './src/schema.yaml'
        },
        output: {
            client: 'react-query',
            mode: 'tags',
            target: './src/client',
            // schemas: './src/schemas',
            override: {
                mutator: {
                    path: './src/mutator/customInstance.ts',
                    name: 'customInstance'
                }
            }
        }
    }
};
