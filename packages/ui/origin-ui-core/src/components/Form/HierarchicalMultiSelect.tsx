import React from 'react';
import {
    MultiSelectAutocomplete,
    IAutocompleteMultiSelectOptionType
} from './MultiSelectAutocomplete';
import { dataTest } from '../../utils';

type Level = 1 | 2 | 3;

type EncodedValueType = string[];
type DecodedValueType = string[][];

interface ISelectOptions {
    label: string;
    placeholder: string;
}

interface IOwnProps<T> {
    selectedValue: string[];
    onChange: (value: EncodedValueType) => void;
    selectOptions: ISelectOptions[];
    singleChoice?: boolean;

    options?: T;
    allValues?: string[][];
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
}

function decode(encodedValue: EncodedValueType) {
    return encodedValue.map((item) => item.split(';'));
}

function encode(decodedType: DecodedValueType) {
    return decodedType.map((group) => group.join(';'));
}

function getDisplayText(value: string) {
    return decode([value])[0].join(' - ');
}

function filterOutOrphanOptions(type: EncodedValueType) {
    if (!type) {
        return [];
    }

    const allTypesDecoded = decode(type);

    const levelOneTypes = allTypesDecoded.filter((i) => i.length === 1);
    const levelTwoTypes = allTypesDecoded.filter((i) => i.length === 2);
    const levelThreeTypes = allTypesDecoded.filter((i) => i.length === 3);

    if (levelOneTypes.length === 0) {
        return [];
    }

    const filteredLevelTwoTypes = levelTwoTypes.filter(
        (childType) =>
            levelOneTypes.filter((parentType) => parentType[0] === childType[0]).length === 1
    );

    const filteredLevelThreeTypes = levelThreeTypes.filter(
        (childType) =>
            filteredLevelTwoTypes.filter(
                (parentType) => parentType[0] === childType[0] && parentType[1] === childType[1]
            ).length === 1
    );

    return encode([...levelOneTypes, ...filteredLevelTwoTypes, ...filteredLevelThreeTypes]);
}

function filterSelected(
    currentType: string,
    types: string[],
    selected: IAutocompleteMultiSelectOptionType[]
) {
    const isSelected = (selected || []).find((type) => type.value === currentType);

    if (!isSelected) {
        return [];
    }

    return types.filter((t) => t.startsWith(`${currentType};`));
}

function valuesToSelectionOptions(types: EncodedValueType) {
    return types.map((t) => ({
        value: t,
        label: getDisplayText(t)
    }));
}

export function HierarchicalMultiSelect<T>(props: IOwnProps<T>) {
    const selectedValueDecoded = decode(props.selectedValue);

    const { singleChoice } = props;

    const allValues = [];

    if (props.allValues) {
        allValues.push(...props.allValues);
    } else {
        Object.keys(props.options).map((key) => {
            allValues.push([key]);

            props.options[key].map((item) => {
                allValues.push([key, item]);
            });
        });
    }

    function allValuesByLevel(level: Level): EncodedValueType {
        return allValues.filter((t) => t.length === level).map((t) => encode([t]).pop());
    }

    function selectedOptionsByLevel(level: Level): IAutocompleteMultiSelectOptionType[] {
        return (
            selectedValueDecoded &&
            valuesToSelectionOptions(encode(selectedValueDecoded.filter((t) => t.length === level)))
        );
    }

    function getOptions() {
        const selectedTypesLevelOne = selectedOptionsByLevel(1);
        const selectedTypesLevelTwo = selectedOptionsByLevel(2);

        const levelTwoTypes: string[] = [];
        const levelThreeTypes: string[] = [];

        const availableL1Types = allValuesByLevel(1);
        const availableL2Types = allValuesByLevel(2);
        const availableL3Types = allValuesByLevel(3);

        for (const currentType of availableL1Types) {
            const level2Types = filterSelected(
                currentType,
                availableL2Types,
                selectedTypesLevelOne
            );

            if (!level2Types.length) {
                continue;
            }

            levelTwoTypes.push(...level2Types);

            for (const currentLevel2Type of level2Types) {
                const level3Types = filterSelected(
                    currentLevel2Type,
                    availableL3Types,
                    selectedTypesLevelTwo
                );

                if (level3Types.length > 0) {
                    levelThreeTypes.push(...level3Types);
                }
            }
        }

        for (const selectedLevelTwoOption of selectedTypesLevelTwo) {
            const level3Types = filterSelected(
                selectedLevelTwoOption.value,
                availableL3Types,
                selectedTypesLevelTwo
            );

            if (level3Types.length > 0) {
                levelThreeTypes.push(...level3Types);
            }
        }

        return {
            levelTwoValues: valuesToSelectionOptions(levelTwoTypes),
            levelThreeValues: valuesToSelectionOptions([...new Set(levelThreeTypes)])
        };
    }

    function getDerivedTypesFromType(type: string): string[] {
        const derivedTypes: string[] = [];

        const availableL2Types = allValuesByLevel(2);
        const availableL3Types = allValuesByLevel(3);

        const optionLevel2Types = filterSelected(
            type,
            availableL2Types,
            valuesToSelectionOptions([type])
        );

        derivedTypes.push(...optionLevel2Types);

        optionLevel2Types.map((t) => {
            derivedTypes.push(
                ...filterSelected(t, availableL3Types, valuesToSelectionOptions(optionLevel2Types))
            );
        });

        return derivedTypes;
    }

    function setValueByLevel(
        newSelectedOptions: IAutocompleteMultiSelectOptionType[],
        level: Level
    ) {
        const newSelectedOptionsArray = newSelectedOptions || [];
        let newEncodedType: EncodedValueType;

        if (singleChoice) {
            if (newSelectedOptionsArray.length > 1) {
                return;
            }

            if (level === 1 && newSelectedOptionsArray.length === 0) {
                newEncodedType = [];
            } else {
                newEncodedType = encode([
                    ...selectedValueDecoded.filter((t) => t.length !== level),
                    ...newSelectedOptionsArray.map((i) => [i.value])
                ]);
            }
        } else {
            newEncodedType = encode([
                ...selectedValueDecoded.filter((t) => t.length !== level),
                ...newSelectedOptionsArray.map((i) => [i.value])
            ]);

            if (level === 1 && newSelectedOptionsArray.length > 0) {
                const alreadySelectedLevelOneOptions = selectedOptionsByLevel(1);

                const newOptions = newSelectedOptionsArray.filter((o) =>
                    alreadySelectedLevelOneOptions.every(
                        (selectedOption) => selectedOption.value !== o.value
                    )
                );

                const selectedToAdd = newOptions.reduce(
                    (a, b) => [...a, ...getDerivedTypesFromType(b.value)],
                    []
                );

                newEncodedType = [...new Set([...newEncodedType, ...selectedToAdd])];
            }
        }

        newEncodedType = filterOutOrphanOptions(newEncodedType);

        props.onChange(newEncodedType);
    }

    const { disabled, readOnly, required } = props;

    const allValuesLevelOne = valuesToSelectionOptions(allValuesByLevel(1));

    const { levelTwoValues, levelThreeValues } = getOptions();

    const selectedValuesLevelOne = selectedOptionsByLevel(1);
    const selectedValuesLevelTwo = selectedOptionsByLevel(2);
    const selectedValuesLevelThree = selectedOptionsByLevel(3);

    return (
        <>
            <MultiSelectAutocomplete
                label={props.selectOptions[0].label}
                placeholder={readOnly ? '' : props.selectOptions[0].placeholder}
                options={allValuesLevelOne}
                onChange={(value) => setValueByLevel(value, 1)}
                selectedValues={selectedValuesLevelOne}
                className="mt-3"
                disabled={disabled}
                required={required}
                singleChoice={singleChoice}
                {...dataTest('hierarchical-multi-select-level-1')}
            />
            {props.selectOptions && props.selectOptions[1]?.label && levelTwoValues.length > 0 && (
                <div style={{ marginTop: '6px' }}>
                    <MultiSelectAutocomplete
                        label={props.selectOptions[1].label}
                        placeholder={readOnly ? '' : props.selectOptions[1].placeholder}
                        options={levelTwoValues}
                        onChange={(value) => setValueByLevel(value, 2)}
                        selectedValues={selectedValuesLevelTwo}
                        className="mt-3"
                        disabled={disabled}
                        required={required}
                        singleChoice={singleChoice}
                        {...dataTest('hierarchical-multi-select-level-2')}
                    />
                </div>
            )}
            {props.selectOptions && props.selectOptions[2]?.label && levelThreeValues.length > 0 && (
                <div style={{ marginTop: '6px' }}>
                    <MultiSelectAutocomplete
                        label={props.selectOptions[2].label}
                        placeholder={readOnly ? '' : props.selectOptions[2].placeholder}
                        options={levelThreeValues}
                        onChange={(value) => setValueByLevel(value, 3)}
                        selectedValues={selectedValuesLevelThree}
                        className="mt-3"
                        disabled={disabled}
                        required={required}
                        singleChoice={singleChoice}
                        {...dataTest('hierarchical-multi-select-level-3')}
                    />
                </div>
            )}
        </>
    );
}
