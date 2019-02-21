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
