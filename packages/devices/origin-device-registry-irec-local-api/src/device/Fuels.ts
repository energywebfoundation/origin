import { CodeNameDTO } from './dto';

export const IREC_DEVICE_TYPES: CodeNameDTO[] = [
    { code: 'ES200', name: 'Wind' },
    { code: 'ES100', name: 'Solar' },
    { code: 'ES300', name: 'Hydro-electric' },
    { code: 'ES410', name: 'Marine Tidal' },
    { code: 'ES420', name: 'Marine Wave' },
    { code: 'ES430', name: 'Marine Current' },
    { code: 'ES440', name: 'Marine Vertical Pressure' },
    { code: 'ES810', name: 'Renewable heat: Geothermal' },
    { code: 'ES820', name: 'Renewable heat: Aerothermal' },
    { code: 'ES830', name: 'Renewable heat: Hydrothermal' },
    { code: 'ES840', name: 'Renewable heat: Biogenic process heat' },
    {
        code: 'ES520',
        name: 'Biomass Solid: Industrial and commercial waste'
    },
    { code: 'ES530', name: 'Biomass Solid: Forestry products' },
    {
        code: 'ES540',
        name: 'Biomass Solid: Forestry by-products & waste'
    },
    { code: 'ES550', name: 'Biomass Solid: Animal fats' },
    { code: 'ES560', name: 'Biomass Solid: Agricultural products' },
    {
        code: 'ES610',
        name: 'Biomass Liquid: Municipal biodegradable waste'
    },
    { code: 'ES620', name: 'Biomass Liquid: Black liquor' },
    { code: 'ES630', name: 'Biomass Liquid: Pure plant oil' },
    { code: 'ES650', name: 'Biomass Liquid: Waste plant oil' },
    {
        code: 'ES660',
        name: 'Biomass Liquid: Refined vegetable oil: Other'
    },
    {
        code: 'ES670',
        name: 'Biomass Liquid: Biodiesel (mono-alkyl ester)'
    },
    {
        code: 'ES680',
        name: 'Biomass Liquid: Biogasoline (C6-C12 hydrocarbon)'
    },
    { code: 'ES710', name: 'Biogas: Landfill gas' },
    { code: 'ES720', name: 'Biogas: Sewage gas' },
    {
        code: 'ES730',
        name: 'Biogas: Gas from organic waste digestion'
    },
    { code: 'ES740', name: 'Biogas: Process gas: Biogenic' },
    {
        code: 'ES910',
        name: 'Co-fired with fossil: Municipal solid waste: Biomass fraction'
    },
    { code: 'ES930', name: 'Co-fired with fossil: Waste wood' },
    {
        code: 'ES940',
        name: 'Co-fired with fossil: Forestry products'
    },
    {
        code: 'ES950',
        name: 'Co-fired with fossil: Forestry by-products & waste'
    },
    { code: 'ES960', name: 'Co-fired with fossil: Animal fats' },
    {
        code: 'ES970',
        name: 'Co-fired with fossil: Agricultural products biomass fraction'
    },
    {
        code: 'ES980',
        name: 'Co-fired with fossil: Agricultural by-products & waste biomass fraction'
    },
    {
        code: 'ES990',
        name: 'Co-fired with fossil: Solar thermal concentration'
    },
    { code: 'ES510', name: 'Biomass Solid: Municipal Waste' },
    {
        code: 'ES570',
        name: 'Biomass Solid: Agricultural by-products & waste'
    },
    {
        code: 'ES920',
        name: 'Co-fired with fossil: Industrial and commercial waste: Biomass fraction'
    }
];

export const IREC_FUEL_TYPES: CodeNameDTO[] = [
    { code: 'T020001', name: 'Wind: Onshore' },
    { code: 'TC110', name: 'PV Ground mounted' },
    {
        code: 'TC120',
        name: 'PV Roof Mounted (single installation)'
    },
    { code: 'TC130', name: 'PV Floating' },
    { code: 'TC140', name: 'PV Aggregated' },
    { code: 'TC150', name: 'Solar Thermal Concentration' },
    { code: 'TC210', name: 'Onshore' },
    { code: 'TC220', name: 'Offshore' },
    { code: 'TC310', name: 'Dam' },
    { code: 'TC320', name: 'Run of river' },
    {
        code: 'TC330',
        name: 'Pumped Hydro Storage (Natural in-flow only)'
    },
    {
        code: 'TC410',
        name: 'Combined cycle gas turbine with heat recovery: Non CHP'
    },
    {
        code: 'TC411',
        name: 'Combined cycle gas turbine with heat recovery: CHP'
    },
    {
        code: 'TC421',
        name: 'Steam turbine with back-pressure turbine (open cycle): Non CHP'
    },
    {
        code: 'TC422',
        name: 'Steam turbine with back-pressure turbine (open cycle): CHP'
    },
    {
        code: 'TC423',
        name: 'Steam turbine with condensation turbine (closed cycle): Non CHP'
    },
    {
        code: 'TC424',
        name: 'Steam turbine with condensation turbine (closed cycle): CHP'
    },
    {
        code: 'TC431',
        name: 'Gas turbine with heat recovery: Non CHP'
    },
    {
        code: 'TC432',
        name: 'Gas turbine with heat recovery: CHP'
    },
    {
        code: 'TC441',
        name: 'Internal combustion engine: Non CHP'
    },
    { code: 'TC442', name: 'Internal combustion engine: CHP' },
    { code: 'TC451', name: 'Micro-turbine: Non CHP' },
    { code: 'TC452', name: 'Micro-turbine: CHP' },
    { code: 'TC461', name: 'Stirling engine: Non CHP' },
    { code: 'TC462', name: 'Stirling engine: CHP' },
    { code: 'TC471', name: 'Fuel cell: Non CHP' },
    { code: 'TC472', name: 'Fuel cell: CHP' },
    { code: 'TC481', name: 'Steam engine: Non CHP' },
    { code: 'TC482', name: 'Steam engine: CHP' },
    { code: 'TC491', name: 'Organic rankine cycle: Non CHP' },
    { code: 'TC492', name: 'Organic rankine cycle: CHP' }
];
