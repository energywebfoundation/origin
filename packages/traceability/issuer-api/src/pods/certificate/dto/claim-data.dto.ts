import { IClaimData } from '@energyweb/issuer';
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsClaimData(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isClaimData',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    const isPlainObject = (value: any) =>
                        typeof value === 'object' && value !== null;
                    const validate = (value: any): boolean => {
                        if (Array.isArray(value)) {
                            return value.every(validate);
                        }

                        if (isPlainObject(value)) {
                            return Object.values(value).every(validate);
                        }

                        return (
                            typeof value === 'string' || typeof value === 'number' || value === null
                        );
                    };

                    if (isPlainObject(value)) {
                        return validate(value);
                    } else {
                        return false;
                    }
                }
            }
        });
    };
}

export type ClaimDataDTO = IClaimData;
