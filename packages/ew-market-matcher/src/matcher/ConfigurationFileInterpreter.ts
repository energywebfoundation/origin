import * as RuleConf from '../schema-defs/RuleConf';
import { logger } from '../Logger';
import * as EwMarket from 'ew-market-lib';


export const getRanking = (ruleConf: RuleConf.RuleConf): string[] => {
    switch (ruleConf.ruleFormat) {
        case RuleConf.RuleFormat.SimpleHierarchy:
            return simpleRanking(ruleConf.rule as RuleConf.SimpleHierarchyRule);

        default:
            throw new Error('Unknown rule format ' + ruleConf.ruleFormat);
    }
};

const simpleRanking = (rule: RuleConf.SimpleHierarchyRule): string[] => {
    const propertyNames = [];

    rule.relevantProperties.forEach((property: RuleConf.SimpleHierarchyRelevantProperty, index: number) => {
        propertyNames.push(property.name);

    });

    let debugOutput = '';

    propertyNames.forEach((name, index) => debugOutput += (index + 1) + '. ' + name + '  ');

    logger.debug('Simple ranking ' + debugOutput);

    return propertyNames;
};

export const getSimpleRankingMappedValue = (
    simpleHierarchyRelevantProperty: RuleConf.SimpleHierarchyRelevantProperty,
    agreement: EwMarket.Agreement.Entity,
): number => {
    switch (simpleHierarchyRelevantProperty.mappingFormat) {
        case RuleConf.MappingFormat.Direct:
            return agreement[simpleHierarchyRelevantProperty.name];
        case RuleConf.MappingFormat.Defined:
            const value = agreement[simpleHierarchyRelevantProperty.name];
            const mapping = (simpleHierarchyRelevantProperty as RuleConf.MappedSimpleHierarchyRelevantProperty).mapping
                .find((item: RuleConf.SimpleHierarchyRelecantPropertyMapping) => item.valueToMap === value);
            return mapping ? mapping.mappedValue : getDefaultValue(simpleHierarchyRelevantProperty);

        default:
            throw new Error('Unknown mapping format ' + simpleHierarchyRelevantProperty.mappingFormat);
    }
};

const getDefaultValue = (simpleHierarchyRelevantProperty: RuleConf.SimpleHierarchyRelevantProperty): number => {
    switch (simpleHierarchyRelevantProperty.defaultValue.type) {
        case RuleConf.DefaultValueType.Infinite:
            return Infinity;
        case RuleConf.DefaultValueType.MinusInfinite:
            return -Infinity;
        case RuleConf.DefaultValueType.Set:
            return simpleHierarchyRelevantProperty.defaultValue.value;
        default:
            throw new Error('Unknown default value type ' + simpleHierarchyRelevantProperty.defaultValue.type);

    }

};
