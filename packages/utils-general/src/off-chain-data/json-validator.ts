import * as Jsonschema from 'jsonschema';
import * as Winston from 'winston';

export const validateJson = (
    input: any,
    schema: any,
    description: string,
    logger: Winston.Logger
) => {
    const validationResult = Jsonschema.validate(input, schema);
    if (validationResult.valid) {
        logger.verbose(`${description} json is valid`);
    } else {
        const error = new Error();
        const errorAt = validationResult.errors
            .map(
                (validationError: Jsonschema.ValidationError, index: number) =>
                    `\n${index}. error at ${JSON.stringify(validationError.instance)}`
            )
            .reduce((previous: string, current: string) => (previous += current));
        error.message = `${description} json is invalid${errorAt}`;
        throw error;
    }
};
