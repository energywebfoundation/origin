// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

import { Agreement } from 'ew-market-lib';

import { logger } from '../Logger';
import * as RuleConf from '../schema-defs/RuleConf';

export const getRanking = (ruleConf: RuleConf.IRuleConf): string[] => {
    if (ruleConf.ruleFormat !== RuleConf.RuleFormat.SimpleHierarchy) {
        throw new Error('Unknown rule format ' + ruleConf.ruleFormat);
    }

    return simpleRanking(ruleConf.rule);
};

const simpleRanking = (rule: RuleConf.ISimpleHierarchyRule): string[] => {
    const propertyNames = [];

    rule.relevantProperties.forEach(
        (property: RuleConf.ISimpleHierarchyRelevantProperty, index: number) => {
            propertyNames.push(property.name);
        }
    );

    let debugOutput = '';

    propertyNames.forEach((name, index) => (debugOutput += `${index + 1}. ${name}  `));

    logger.debug('Simple ranking ' + debugOutput);

    return propertyNames;
};

export const getSimpleRankingMappedValue = (
    simpleHierarchyRelevantProperty: RuleConf.ISimpleHierarchyRelevantProperty,
    agreement: Agreement.Entity
): number => {
    switch (simpleHierarchyRelevantProperty.mappingFormat) {
        case RuleConf.MappingFormat.Direct:
            return agreement[simpleHierarchyRelevantProperty.name];
        case RuleConf.MappingFormat.Defined:
            const value = agreement[simpleHierarchyRelevantProperty.name];
            const mapping = (simpleHierarchyRelevantProperty as RuleConf.IMappedSimpleHierarchyRelevantProperty).mapping.find(
                (item: RuleConf.ISimpleHierarchyRelecantPropertyMapping) =>
                    item.valueToMap === value
            );

            return mapping ? mapping.mappedValue : getDefaultValue(simpleHierarchyRelevantProperty);

        default:
            throw new Error(
                'Unknown mapping format ' + simpleHierarchyRelevantProperty.mappingFormat
            );
    }
};

const getDefaultValue = (
    simpleHierarchyRelevantProperty: RuleConf.ISimpleHierarchyRelevantProperty
): number => {
    switch (simpleHierarchyRelevantProperty.defaultValue.type) {
        case RuleConf.DefaultValueType.Infinite:
            return Infinity;
        case RuleConf.DefaultValueType.MinusInfinite:
            return -Infinity;
        case RuleConf.DefaultValueType.Set:
            return simpleHierarchyRelevantProperty.defaultValue.value;
        default:
            throw new Error(
                'Unknown default value type ' + simpleHierarchyRelevantProperty.defaultValue.type
            );
    }
};
