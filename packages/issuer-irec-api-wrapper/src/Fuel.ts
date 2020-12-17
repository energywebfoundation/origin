/* eslint-disable max-classes-per-file */
import { IsNotEmpty, IsString } from 'class-validator';

export class CodeName {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}

export class Fuel extends CodeName {}

export class FuelType extends CodeName {}
