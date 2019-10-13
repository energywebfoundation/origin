import * as React from 'react';
import { IRECAssetService, EncodedAssetType, DecodedAssetType } from '@energyweb/utils-general';
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

type Props = IOwnProps;

type Level = 1 | 2 | 3;

export class AssetTypeSelector extends React.Component<Props> {
    irecAssetService = new IRECAssetService();

    get allTypes() {
        return this.irecAssetService.AssetTypes;
    }

    get selectedTypeDecoded(): DecodedAssetType {
        return this.irecAssetService.decode(this.props.selectedType);
    }

    allTypesByLevel(level: Level): EncodedAssetType {
        return this.allTypes
            .filter(t => t.length === level)
            .map(t => this.irecAssetService.encode([t]).pop());
    }

    filterSelected(
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

    assetTypesToSelectionOptions(types: EncodedAssetType) {
        return types.map(t => ({
            value: t,
            label: this.irecAssetService.getDisplayText(t)
        }));
    }

    selectedOptionsByLevel(level: Level): IAutocompleteMultiSelectOptionType[] {
        return (
            this.selectedTypeDecoded &&
            this.assetTypesToSelectionOptions(
                this.irecAssetService.encode(
                    this.selectedTypeDecoded.filter(t => t.length === level)
                )
            )
        );
    }

    get assetTypesOptions() {
        const selectedTypesLevelOne = this.selectedOptionsByLevel(1);
        const selectedTypesLevelTwo = this.selectedOptionsByLevel(2);

        const levelTwoTypes: string[] = [];
        const levelThreeTypes: string[] = [];

        const availableL1Types = this.allTypesByLevel(1);
        const availableL2Types = this.allTypesByLevel(2);
        const availableL3Types = this.allTypesByLevel(3);

        for (const currentType of availableL1Types) {
            const level2Types = this.filterSelected(
                currentType,
                availableL2Types,
                selectedTypesLevelOne
            );

            if (!level2Types.length) {
                continue;
            }

            levelTwoTypes.push(...level2Types);

            for (const currentLevel2Type of level2Types) {
                const level3Types = this.filterSelected(
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
            const level3Types = this.filterSelected(
                selectedLevelTwoOption.value,
                availableL3Types,
                selectedTypesLevelTwo
            );

            if (level3Types.length > 0) {
                levelThreeTypes.push(...level3Types);
            }
        }

        return {
            levelTwoTypes: this.assetTypesToSelectionOptions(levelTwoTypes),
            levelThreeTypes: this.assetTypesToSelectionOptions([...new Set(levelThreeTypes)])
        };
    }

    getDerivedTypesFromType(type: string): string[] {
        const derivedTypes: string[] = [];

        const availableL2Types = this.allTypesByLevel(2);
        const availableL3Types = this.allTypesByLevel(3);

        const optionLevel2Types = this.filterSelected(
            type,
            availableL2Types,
            this.assetTypesToSelectionOptions([type])
        );

        derivedTypes.push(...optionLevel2Types);

        optionLevel2Types.map(t => {
            derivedTypes.push(
                ...this.filterSelected(
                    t,
                    availableL3Types,
                    this.assetTypesToSelectionOptions(optionLevel2Types)
                )
            );
        });

        return derivedTypes;
    }

    setTypeByLevel(newSelectedOptions: IAutocompleteMultiSelectOptionType[] | null, level: Level) {
        const newSelectedOptionsArray = newSelectedOptions || [];

        let newEncodedType: EncodedAssetType;

        if (newSelectedOptionsArray.length === 0 && level !== 3) {
            newEncodedType = this.irecAssetService.encode([
                ...this.selectedTypeDecoded.filter(
                    t => t.length !== level && t.length !== level + 1
                ),
                ...newSelectedOptionsArray.map(o => [o.value])
            ]);
        } else {
            newEncodedType = this.irecAssetService.encode([
                ...this.selectedTypeDecoded.filter(t => t.length !== level),
                ...newSelectedOptionsArray.map(o => [o.value])
            ]);
        }

        if (level === 1 && newSelectedOptionsArray.length > 0) {
            const alreadySelectedLevelOneOptions = this.selectedOptionsByLevel(1);

            const newOptions = newSelectedOptionsArray.filter(o =>
                alreadySelectedLevelOneOptions.every(
                    selectedOption => selectedOption.value !== o.value
                )
            );

            const selectedToAdd = newOptions.reduce(
                (a, b) => [...a, ...this.getDerivedTypesFromType(b.value)],
                []
            );

            newEncodedType = [...new Set([...newEncodedType, ...selectedToAdd])];
        }

        this.props.onChange(newEncodedType);
    }

    render() {
        const { disabled, readOnly } = this.props;

        const allTypesLevelOne = this.assetTypesToSelectionOptions(this.allTypesByLevel(1));

        const {
            assetTypesOptions: { levelTwoTypes, levelThreeTypes }
        } = this;

        const selectedTypesLevelOne = this.selectedOptionsByLevel(1);
        const selectedTypesLevelTwo = this.selectedOptionsByLevel(2);
        const selectedTypesLevelThree = this.selectedOptionsByLevel(3);

        return (
            <>
                <MultiSelectAutocomplete
                    label="Asset type"
                    placeholder={readOnly ? '' : 'Select asset type'}
                    options={allTypesLevelOne}
                    onChange={value => this.setTypeByLevel(value, 1)}
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
                        onChange={value => this.setTypeByLevel(value, 2)}
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
                        onChange={value => this.setTypeByLevel(value, 3)}
                        selectedValues={selectedTypesLevelThree}
                        classes={{ root: 'mt-3' }}
                        disabled={disabled}
                        {...dataTest('asset-type-selector-level-3')}
                    />
                )}
            </>
        );
    }
}
