import { RuleConf, RuleFormat, PriorityComparisonVectorElement, SimpleHierarchyRelevantProperty, SimpleHierarchyRule, MappingFormat, SimpleHierarchyRelecantPropertyMapping, MappedSimpleHierarchyRelevantProperty, DefaultValueType } from "../schemas/RuleConf";
import { logger } from "..";
import { DemandData } from "../schemas/simulation-flow/RegisterDemand";


export namespace ConfigurationFileInterpreter {
  

    export const getRanking = (ruleConf: RuleConf): string[] => {
        switch (ruleConf.ruleFormat) {
            case RuleFormat.SimpleHierarchy:
                return simpleRanking(ruleConf.rule as SimpleHierarchyRule)
 
            default:
                throw new Error("Unknown rule format " + ruleConf.ruleFormat)
        }
    }

    const simpleRanking = (rule: SimpleHierarchyRule): string[] => {
        const propertyNames = []
   
        rule.relevantProperties.forEach((property: SimpleHierarchyRelevantProperty, index: number) =>{
            propertyNames.push(property.name)

        })

        let debugOutput = ''

        propertyNames.forEach( (name, index) => debugOutput += (index + 1) + '. ' + name + '  ')

        logger.debug('Simple ranking ' + debugOutput)

        return propertyNames
    }

    export const getSimpleRankingMappedValue = (simpleHierarchyRelevantProperty: SimpleHierarchyRelevantProperty, demand: DemandData): number => {
        switch (simpleHierarchyRelevantProperty.mappingFormat) {
            case MappingFormat.Direct:
                return demand[simpleHierarchyRelevantProperty.name]
            case MappingFormat.Defined:
                const value = demand[simpleHierarchyRelevantProperty.name]
                const mapping = (simpleHierarchyRelevantProperty as MappedSimpleHierarchyRelevantProperty).mapping
                    .find((item: SimpleHierarchyRelecantPropertyMapping) => item.valueToMap === value)
                return mapping ? mapping.mappedValue : getDefaultValue(simpleHierarchyRelevantProperty)

            default:
                throw new Error("Unknown mapping format " + simpleHierarchyRelevantProperty.mappingFormat)
        }
    }

    const getDefaultValue = (simpleHierarchyRelevantProperty: SimpleHierarchyRelevantProperty): number => {
        switch (simpleHierarchyRelevantProperty.defaultValue.type) {
            case DefaultValueType.Infinite:
                return Infinity
            case DefaultValueType.MinusInfinite:
                return -Infinity
            case DefaultValueType.Set:
                return simpleHierarchyRelevantProperty.defaultValue.value
            default:
                throw new Error("Unknown default value type " + simpleHierarchyRelevantProperty.defaultValue.type)
            
        }

    }
}