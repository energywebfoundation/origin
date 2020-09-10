SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

/*
    ORGANIZATIONS
 */
INSERT INTO
    public."platform_organization" (
        "createdAt",
        "updatedAt",
        
        id,
        name,
        address,
        city,
        "zipCode",
        country,
        "businessType",
        "tradeRegistryCompanyNumber",
        "vatNumber",
        
        "signatoryFullName",
        "signatoryAddress",
        "signatoryCity",
        "signatoryZipCode",
        "signatoryCountry",
        "signatoryEmail",
        "signatoryPhoneNumber",
        status
    )
VALUES
    (
        '2020-03-30 09:55:25.962333+02',
        '2020-03-30 09:55:25.962333+02',
        1,
        'Issuer Organization',
        'Address',
        'City',
        'Zip code',
        235,
        'Issuer',
        '1000',
        'UK1000',

        'Issuer signatory'
        'Address',
        'City',
        'Zip code',
        'CEO name',
        235,
        'issuer@mailinator.com',
        'Phone number',
        2
    );

INSERT INTO
    public."platform_organization" (
        "createdAt",
        "updatedAt",
        
        id,
        name,
        address,
        city,
        "zipCode",
        country,
        "businessType",
        "tradeRegistryCompanyNumber",
        "vatNumber",
        
        "signatoryFullName",
        "signatoryAddress",
        "signatoryCity",
        "signatoryZipCode",
        "signatoryCountry",
        "signatoryEmail",
        "signatoryPhoneNumber",
        status
    )
VALUES
    (
        '2020-03-30 09:55:25.962333+02',
        '2020-03-30 09:55:25.962333+02',
        2,
        'Device Manager Organization',
        'Address',
        'City',
        'Zip code',
        235,
        'Issuer',
        '1000',
        'UK1000',

        'Issuer signatory'
        'Address',
        'City',
        'Zip code',
        'CEO name',
        235,
        'devicemanager@mailinator.com',
        'Phone number',
        2
    );

INSERT INTO
    public."platform_organization" (
        "createdAt",
        "updatedAt",
        
        id,
        name,
        address,
        city,
        "zipCode",
        country,
        "businessType",
        "tradeRegistryCompanyNumber",
        "vatNumber",
        
        "signatoryFullName",
        "signatoryAddress",
        "signatoryCity",
        "signatoryZipCode",
        "signatoryCountry",
        "signatoryEmail",
        "signatoryPhoneNumber",
        status
    )
VALUES
    (
        '2020-03-30 09:55:25.962333+02',
        '2020-03-30 09:55:25.962333+02',
        3,
        'Device Manager Second Organization',
        'Address',
        'City',
        'Zip code',
        235,
        'Issuer',
        '1000',
        'UK1000',

        'Issuer signatory'
        'Address',
        'City',
        'Zip code',
        'CEO name',
        235,
        'devicemanager2@mailinator.com',
        'Phone number',
        2
    );

INSERT INTO
    public."platform_organization" (
        "createdAt",
        "updatedAt",
        
        id,
        name,
        address,
        city,
        "zipCode",
        country,
        "businessType",
        "tradeRegistryCompanyNumber",
        "vatNumber",
        
        "signatoryFullName",
        "signatoryAddress",
        "signatoryCity",
        "signatoryZipCode",
        "signatoryCountry",
        "signatoryEmail",
        "signatoryPhoneNumber",
        status
    )
VALUES
    (
        '2020-03-30 09:55:25.962333+02',
        '2020-03-30 09:55:25.962333+02',
        4,
        'Trader Organization',
        'Address',
        'City',
        'Zip code',
        235,
        'Issuer',
        '1000',
        'UK1000',

        'Issuer signatory'
        'Address',
        'City',
        'Zip code',
        'CEO name',
        235,
        'trader@mailinator.com',
        'Phone number',
        2
    );

/*
    USERS
 */
INSERT INTO
    public."user" (
        "createdAt",
        "updatedAt",
        id,
        title,
        "firstName",
        "lastName",
        email,
        telephone,
        password,
        "blockchainAccountAddress",
        "blockchainAccountSignedMessage",
        notifications,
        rights,
        "organizationId",
        status,
        "kycStatus"
    )
VALUES
    (
        '2020-03-30 10:08:33.510625+02',
        '2020-03-30 10:08:33.652639+02',
        1,
        'Mr',
        'Issuer',
        'Surname',
        'issuer@mailinator.com',
        '111-111-111',
        '$2a$08$R5nXlTeycdggncK6ElVtDehsv3ZUcBfyekPv5uYdt6dS76.rcAB.m',
        '0xd173313a51f8fc37bcf67569b463abd89d81844f',
        '0x09790e96275e023b965f6b267512b5267bcb18f5b5fdaaf46de899a0f91f2a8d006c7fbaebddf5ad36c116775c961aca3c32525b6dd1529bdee41eee5e9730a71c',
        'f',
        '8',
        '1',
        '1',
        '1'
    );
INSERT INTO
    public."user" (
        "createdAt",
        "updatedAt",
        id,
        title,
        "firstName",
        "lastName",
        email,
        telephone,
        password,
        "blockchainAccountAddress",
        "blockchainAccountSignedMessage",
        notifications,
        rights,
        "organizationId",
        status,
        "kycStatus"
    )
VALUES
    (
        '2020-03-30 10:08:33.510625+02',
        '2020-03-30 10:08:33.652639+02',
        2,
        'Mr',
        'Device',
        'Manager',
        'devicemanager@mailinator.com',
        '111-111-111',
        '$2a$08$kBdGu/H3pAHzGupU2qB0NeHIBtRVCOFpLXkQay.LxnjGVm2oFxUSK',
        '0x5b1b89a48c1fb9b6ef7fb77c453f2aaf4b156d45',
        '0xe6f70568571f331ae431bb4d3249aaf4a01c548ddd6e0a1fbefdd207cf31b13d419f43ff28cf011df17697eb7856c470e361b4239898f53613cacbcc589e5d6a1c',
        't',
        '1',
        '2',
        '1',
        '1'
    );
INSERT INTO
    public."user" (
        "createdAt",
        "updatedAt",
        id,
        title,
        "firstName",
        "lastName",
        email,
        telephone,
        password,
        "blockchainAccountAddress",
        "blockchainAccountSignedMessage",
        notifications,
        rights,
        "organizationId",
        status,
        "kycStatus"
    )
VALUES
    (
        '2020-03-30 10:08:33.510625+02',
        '2020-03-30 10:08:33.652639+02',
        3,
        'Mr',
        'Device',
        'Manager 2',
        'devicemanager2@mailinator.com',
        '111-111-111',
        '$2a$08$hxfSpn5Y7mZ9MjmcV5QdZemmi3aST8U2RFmod4bjpTZbWcwxAFgaO',
        '0xfd863c662307fcf0c15f0b9f74f1d06544f19908',
        '0x617ba0b0b20d547272001e2b1d9a9ef7da24b5e58c2a97767fb2e65a294010906862458c503dbe1a6db0db782cddf9bd98409bdaa0930754b3bd18863c8d99ab1b',
        't',
        '1',
        '3',
        '1',
        '1'
    );
INSERT INTO
    public."user" (
        "createdAt",
        "updatedAt",
        id,
        title,
        "firstName",
        "lastName",
        email,
        telephone,
        password,
        "blockchainAccountAddress",
        "blockchainAccountSignedMessage",
        notifications,
        rights,
        "organizationId",
        status,
        "kycStatus"
    )
VALUES
    (
        '2020-03-30 10:08:33.510625+02',
        '2020-03-30 10:08:33.652639+02',
        4,
        'Mr',
        'Trader',
        'Surname',
        'trader@mailinator.com',
        '111-111-111',
        '$2a$08$j8LnGtFdbTfKN5F.0InfdO2gxMWXHbrjWvRziCIl0lRj.kxOKJ/b6',
        '0x7672fa3f8c04abbcbad14d896aad8bedece72d2b',
        '0xb0a804f410f2934278703eb992e5ba12f9e8b9068b68ff6d1246a56cf52e48677d3648057453d86f4372b2ffd98fa189aee1562d8c564ac62bc416d6cdc474051c',
        'f',
        '1',
        '4',
        '1',
        '1'
    );
    
INSERT INTO "public"."user"("createdAt", "updatedAt", "id", "title", "firstName", "lastName", "email", "telephone", "password", "blockchainAccountAddress", "blockchainAccountSignedMessage", "notifications", "rights", "organizationId", "status", "kycStatus") VALUES ('2020-03-30 08:08:33.510625+00', '2020-03-30 08:08:33.652639+00', 5, 'Mr', 'Admin', 'Surname', 'admin@mailinator.com', '111-111-111', '$2a$08$j8LnGtFdbTfKN5F.0InfdO2gxMWXHbrjWvRziCIl0lRj.kxOKJ/b6', '0x7672fa3f8c04abbcbad14d896aad8bedece72d2b', '0xb0a804f410f2934278703eb992e5ba12f9e8b9068b68ff6d1246a56cf52e48677d3648057453d86f4372b2ffd98fa189aee1562d8c564ac62bc416d6cdc474051c', 'f', '16', '4', '1', '1');

INSERT INTO "public"."user"("createdAt", "updatedAt", "id", "title", "firstName", "lastName", "email", "telephone", "password", "blockchainAccountAddress", "blockchainAccountSignedMessage", "notifications", "rights", "organizationId", "status", "kycStatus") VALUES ('2020-03-30 08:08:33.510625+00', '2020-03-30 08:08:33.652639+00', 6, 'Mr', 'Agents', 'Surname', 'agents@mailinator.com', '111-111-111', '$2a$08$j8LnGtFdbTfKN5F.0InfdO2gxMWXHbrjWvRziCIl0lRj.kxOKJ/b6', '0x7672fa3f8c04abbcbad14d896aad8bedece72d2b', '0xb0a804f410f2934278703eb992e5ba12f9e8b9068b68ff6d1246a56cf52e48677d3648057453d86f4372b2ffd98fa189aee1562d8c564ac62bc416d6cdc474051c', 'f', '32', '4', '1', '1');    

/*
    DEVICES
 */
INSERT INTO
    public.device (
        "createdAt",
        "updatedAt",
        id,
        status,
        "facilityName",
        "description",
        images,
        address,
        region,
        province,
        country,
        "operationalSince",
        "capacityInW",
        "gpsLatitude",
        "gpsLongitude",
        timezone,
        "deviceType",
        "complianceRegistry",
        "otherGreenAttributes",
        "typeOfPublicSupport",
        "deviceGroup",
        "smartMeterReads",
        "externalDeviceIds",
        "organizationId",
        "gridOperator"
    )
VALUES
    (
        '2020-03-30 09:36:02.607206+02',
        '2020-03-30 09:36:02.607206+02',
        1,
        '2',
        'Wuthering Heights Windfarm',
        '',
        '',
        '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
        'Central',
        'Nakhon Pathom',
        'Thailand',
        '1514764800',
        '10000',
        '14.059500',
        '99.977800',
        'Asia/Bangkok',
        'Wind;Onshore',
        'I-REC',
        'N.A.',
        'N.A.',
        '',
        '[]',
        '[{"id":123,"type":"Smart Meter Readings API ID"},{"id":"ABQ123-1","type":"Issuer ID"}]',
        '2',
        'TH-PEA'
    );

INSERT INTO
    public.device (
        "createdAt",
        "updatedAt",
        id,
        status,
        "facilityName",
        "description",
        images,
        address,
        region,
        province,
        country,
        "operationalSince",
        "capacityInW",
        "gpsLatitude",
        "gpsLongitude",
        timezone,
        "deviceType",
        "complianceRegistry",
        "otherGreenAttributes",
        "typeOfPublicSupport",
        "deviceGroup",
        "smartMeterReads",
        "externalDeviceIds",
        "organizationId",
        "gridOperator"
    )
VALUES
    (
        '2020-03-30 09:36:02.607206+02',
        '2020-03-30 09:36:02.607206+02',
        2,
        '2',
        'Solar Facility A',
        '',
        '',
        'Phuket',
        'South',
        'Phuket',
        'Thailand',
        '1483228800',
        '70000',
        '15.1739',
        '101.4928',
        'Asia/Bangkok',
        'Solar;Photovoltaic;Roof mounted',
        'I-REC',
        'N.A.',
        'N.A.',
        '',
        '[]',
        '[{"id":"ABQ123-2","type":"Issuer ID"}]',
        '3',
        'TH-MEA'
    );

INSERT INTO
    public.device (
        "createdAt",
        "updatedAt",
        id,
        status,
        "facilityName",
        "description",
        images,
        address,
        region,
        province,
        country,
        "operationalSince",
        "capacityInW",
        "gpsLatitude",
        "gpsLongitude",
        timezone,
        "deviceType",
        "complianceRegistry",
        "otherGreenAttributes",
        "typeOfPublicSupport",
        "deviceGroup",
        "smartMeterReads",
        "externalDeviceIds",
        "organizationId",
        "gridOperator"
    )
VALUES
    (
        '2020-03-30 09:36:02.607206+02',
        '2020-03-30 09:36:02.607206+02',
        3,
        '2',
        'Biomass Facility',
        '',
        '',
        '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
        'Central',
        'Nakhon Pathom',
        'Thailand',
        '1514764800',
        '10000',
        '14.059500',
        '99.977800',
        'Asia/Bangkok',
        'Solid;Biomass from agriculture;Agricultural products',
        'I-REC',
        'N.A.',
        'N.A.',
        '',
        '[]',
        '[{"id":"ABQ123-3","type":"Issuer ID"}]',
        '2',
        'TH-PEA'
    );

SELECT setval(
    pg_get_serial_sequence('public.user', 'id'),
    (SELECT MAX("id") FROM public.user) + 1
);

SELECT setval(
    pg_get_serial_sequence('public.platform_organization', 'id'),
    (SELECT MAX("id") FROM public.platform_organization) + 1
);

SELECT setval(
    pg_get_serial_sequence('public.device', 'id'),
    (SELECT MAX("id") FROM public.device) + 1
);