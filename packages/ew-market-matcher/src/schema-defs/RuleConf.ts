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

export enum RuleFormat {
    SimpleHierarchy = 'SIMPLE_HIERARCHY',
}

export enum MappingFormat {
    Direct = 'DIRECT',
    Defined = 'DEFINED',
}

export enum DefaultValueType {
    Infinite = 'INFINITE',
    MinusInfinite = 'MINUS_INFINITE',
    Set = 'SET',

}

export interface RuleConf {
    ruleFormat: RuleFormat;
    rule: SimpleHierarchyRule;
}

export interface SimpleHierarchyRule {
    relevantProperties: SimpleHierarchyRelevantProperty[];
}

export interface DefaultValue {
    type: DefaultValueType;
    value?: number;
}

export interface SimpleHierarchyRelevantProperty {
    name: string;
    mappingFormat: MappingFormat;
    preferHigherValues: boolean;
    defaultValue: DefaultValue;
}

export interface PriorityComparisonVectorElement {
    name: string;
    priority: number;
}
export interface MappedSimpleHierarchyRelevantProperty extends SimpleHierarchyRelevantProperty {
    mapping: SimpleHierarchyRelecantPropertyMapping[];
}

export interface SimpleHierarchyRelecantPropertyMapping {
    valueToMap: string;
    mappedValue: number;
}
