import * as React from 'react';
import { IRECAssetService, EncodedAssetType } from '@energyweb/utils-general';
import {
    MultiSelectAutocomplete,
    IAutocompleteMultiSelectOptionType
} from './MultiSelectAutocomplete';
import { dataTest } from '../utils/Helper';

interface IOwnProps {
    selectedType: EncodedAssetType;
    onChange: (value: EncodedAssetType) => void;
    disabled?: boolean;
    readOnly?: boolean;
}

type Level = 1 | 2 | 3;

export function AssetTypeSelector(props: IOwnProps) {
    const irecAssetService = new IRECAssetService();
    const allTypes = irecAssetService.AssetTypes;
    const selectedTypeDecoded = irecAssetService.decode(props.selectedType);

    function allTypesByLevel(level: Level): EncodedAssetType {
        return allTypes
            .filter(t => t.length === level)
            .map(t => irecAssetService.encode([t]).pop());
    }

    function filterSelected(
        currentType: string,
        types: string[],
        selected: IAutocompleteMultiSelectOptionType[]
    ) {
        const isSelected = (selected || []).find(type => type.value === currentType);

        if (!isSelected) {
            return [];
        }

        return types.filter(t => t.startsWith(currentType));
    }

    function assetTypesToSelectionOptions(types: EncodedAssetType) {
        return types.map(t => ({
            value: t,
            label: irecAssetService.getDisplayText(t)
        }));
    }

    function selectedOptionsByLevel(level: Level): IAutocompleteMultiSelectOptionType[] {
        return (
            selectedTypeDecoded &&
            assetTypesToSelectionOptions(
                irecAssetService.encode(selectedTypeDecoded.filter(t => t.length === level))
            )
        );
    }

    function getAssetTypesOptions() {
        const selectedTypesLevelOne = selectedOptionsByLevel(1);
        const selectedTypesLevelTwo = selectedOptionsByLevel(2);

        const levelTwoTypes: string[] = [];
        const levelThreeTypes: string[] = [];

        const availableL1Types = allTypesByLevel(1);
        const availableL2Types = allTypesByLevel(2);
        const availableL3Types = allTypesByLevel(3);

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
            levelTwoTypes: assetTypesToSelectionOptions(levelTwoTypes),
            levelThreeTypes: assetTypesToSelectionOptions([...new Set(levelThreeTypes)])
        };
    }

    function getDerivedTypesFromType(type: string): string[] {
        const derivedTypes: string[] = [];

        const availableL2Types = allTypesByLevel(2);
        const availableL3Types = allTypesByLevel(3);

        const optionLevel2Types = filterSelected(
            type,
            availableL2Types,
            assetTypesToSelectionOptions([type])
        );

        derivedTypes.push(...optionLevel2Types);

        optionLevel2Types.map(t => {
            derivedTypes.push(
                ...filterSelected(
                    t,
                    availableL3Types,
                    assetTypesToSelectionOptions(optionLevel2Types)
                )
            );
        });

        return derivedTypes;
    }

    function setTypeByLevel(
        newSelectedOptions: IAutocompleteMultiSelectOptionType[] | null,
        level: Level
    ) {
        const newSelectedOptionsArray = newSelectedOptions || [];

        let newEncodedType: EncodedAssetType;

        if (newSelectedOptionsArray.length === 0 && level !== 3) {
            newEncodedType = irecAssetService.encode([
                ...selectedTypeDecoded.filter(t => t.length !== level && t.length !== level + 1),
                ...newSelectedOptionsArray.map(o => [o.value])
            ]);
        } else {
            newEncodedType = irecAssetService.encode([
                ...selectedTypeDecoded.filter(t => t.length !== level),
                ...newSelectedOptionsArray.map(o => [o.value])
            ]);
        }

        if (level === 1 && newSelectedOptionsArray.length > 0) {
            const alreadySelectedLevelOneOptions = selectedOptionsByLevel(1);

            const newOptions = newSelectedOptionsArray.filter(o =>
                alreadySelectedLevelOneOptions.every(
                    selectedOption => selectedOption.value !== o.value
                )
            );

            const selectedToAdd = newOptions.reduce(
                (a, b) => [...a, ...getDerivedTypesFromType(b.value)],
                []
            );

            newEncodedType = [...new Set([...newEncodedType, ...selectedToAdd])];
        }

        props.onChange(newEncodedType);
    }

    const { disabled, readOnly } = props;

    const allTypesLevelOne = assetTypesToSelectionOptions(allTypesByLevel(1));

    const { levelTwoTypes, levelThreeTypes } = getAssetTypesOptions();

    const selectedTypesLevelOne = selectedOptionsByLevel(1);
    const selectedTypesLevelTwo = selectedOptionsByLevel(2);
    const selectedTypesLevelThree = selectedOptionsByLevel(3);

    return (
        <>
            <MultiSelectAutocomplete
                label="Asset type"
                placeholder={readOnly ? '' : 'Select asset type'}
                options={allTypesLevelOne}
                onChange={value => setTypeByLevel(value, 1)}
                selectedValues={selectedTypesLevelOne}
                classes={{ root: 'mt-3' }}
                disabled={disabled}
                {...dataTest('asset-type-selector-level-1')}
            />
            {levelTwoTypes.length > 0 && (
                <MultiSelectAutocomplete
                    label="Asset type"
                    placeholder={readOnly ? '' : 'Select asset type'}
                    options={levelTwoTypes}
                    onChange={value => setTypeByLevel(value, 2)}
                    selectedValues={selectedTypesLevelTwo}
                    classes={{ root: 'mt-3' }}
                    disabled={disabled}
                    {...dataTest('asset-type-selector-level-2')}
                />
            )}
            {levelThreeTypes.length > 0 && (
                <MultiSelectAutocomplete
                    label="Asset type"
                    placeholder={readOnly ? '' : 'Select asset type'}
                    options={levelThreeTypes}
                    onChange={value => setTypeByLevel(value, 3)}
                    selectedValues={selectedTypesLevelThree}
                    classes={{ root: 'mt-3' }}
                    disabled={disabled}
                    {...dataTest('asset-type-selector-level-3')}
                />
            )}
        </>
    );
}
