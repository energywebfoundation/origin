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