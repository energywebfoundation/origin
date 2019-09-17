import * as React from 'react';
import { IRECAssetService, EncodedAssetType, DecodedAssetType } from '@energyweb/utils-general';
import {
    MultiSelectAutocomplete,
    IAutocompleteMultiSelectOptionType
} from './MultiSelectAutocomplete';

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

    filterSelected(currentType: string, types: string[], selected) {
        const isSelected = (selected || []).find(type => type.value === currentType);

        if (!isSelected) {
            return [];
        }

        return types.filter(t => t.startsWith(currentType));
    }

    assetTypesToSelectionOptions(types: EncodedAssetType) {
        return types.map(t => ({
            value: t,
            label: this.irecAssetService
                .decode([t])
                .pop()
                .join(' - ')
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

        const levelTwoTypes = [];
        const levelThreeTypes = [];

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

            levelTwoTypes.push(...this.assetTypesToSelectionOptions(level2Types));

            for (const currentLevel2Type of level2Types) {
                const level3Types = this.filterSelected(
                    currentLevel2Type,
                    availableL3Types,
                    selectedTypesLevelTwo
                );

                if (!level3Types.length) {
                    continue;
                }

                levelThreeTypes.push(...this.assetTypesToSelectionOptions(level3Types));
            }
        }

        return { levelTwoTypes, levelThreeTypes };
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
                    />
                )}
            </>
        );
    }
}
