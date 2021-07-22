module.exports = {
    issuerClient: {
        input: {
            target: './src/schema.yaml'
        },
        output: {
            client: 'react-query',
            mode: 'tags',
            target: './src/client',
            override: {
                mutator: './src/response-type.ts'
            }
        }
    }
};
