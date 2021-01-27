SET
    statement_timeout = 0;

SET
    lock_timeout = 0;

SET
    idle_in_transaction_session_timeout = 0;

SET
    client_encoding = 'UTF8';

SET
    standard_conforming_strings = on;

SELECT
    pg_catalog.set_config('search_path', '', false);

SET
    check_function_bodies = false;

SET
    xmloption = content;

SET
    client_min_messages = warning;

SET
    row_security = off;

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
        'GB',
        'Issuer',
        '1000',
        'UK1000',
        'Issuer signatory',
        'Address',
        'City',
        'Zip code',
        'GB',
        'issuer@mailinator.com',
        'Phone number',
        'Active'
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
        'GB',
        'Issuer',
        '1000',
        'UK1000',
        'Issuer signatory',
        'Address',
        'City',
        'Zip code',
        'GB',
        'devicemanager@mailinator.com',
        'Phone number',
        'Active'
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
        'GB',
        'Issuer',
        '1000',
        'UK1000',
        'Issuer signatory',
        'Address',
        'City',
        'Zip code',
        'GB',
        'devicemanager2@mailinator.com',
        'Phone number',
        'Active'
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
        'GB',
        'Issuer',
        '1000',
        'UK1000',
        'Issuer signatory',
        'Address',
        'City',
        'Zip code',
        'GB',
        'trader@mailinator.com',
        'Phone number',
        'Active'
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
        5,
        'Platform Operator Organization',
        'Address',
        'City',
        'Zip code',
        'GB',
        'Issuer',
        '1000',
        'UK1000',
        'Operator',
        'Address',
        'City',
        'Zip code',
        'GB',
        'admin@mailinator.com',
        'Phone number',
        'Active'
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
        'f',
        '8',
        '1',
        'Active',
        'Passed'
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
        't',
        '1',
        '2',
        'Active',
        'Passed'
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
        't',
        '1',
        '3',
        'Active',
        'Passed'
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
        'f',
        '1',
        '4',
        'Active',
        'Passed'
    );

INSERT INTO
    "public"."user"(
        "createdAt",
        "updatedAt",
        "id",
        "title",
        "firstName",
        "lastName",
        "email",
        "telephone",
        "password",
        "notifications",
        "rights",
        "organizationId",
        "status",
        "kycStatus"
    )
VALUES
    (
        '2020-03-30 08:08:33.510625+00',
        '2020-03-30 08:08:33.652639+00',
        5,
        'Mr',
        'Admin',
        'Surname',
        'admin@mailinator.com',
        '111-111-111',
        '$2a$08$j8LnGtFdbTfKN5F.0InfdO2gxMWXHbrjWvRziCIl0lRj.kxOKJ/b6',
        'f',
        '16',
        5,
        'Active',
        'Passed'
    );

INSERT INTO
    "public"."user"(
        "createdAt",
        "updatedAt",
        "id",
        "title",
        "firstName",
        "lastName",
        "email",
        "telephone",
        "password",
        "notifications",
        "rights",
        "organizationId",
        "status",
        "kycStatus"
    )
VALUES
    (
        '2020-03-30 08:08:33.510625+00',
        '2020-03-30 08:08:33.652639+00',
        6,
        'Mr',
        'Agents',
        'Surname',
        'agents@mailinator.com',
        '111-111-111',
        '$2a$08$j8LnGtFdbTfKN5F.0InfdO2gxMWXHbrjWvRziCIl0lRj.kxOKJ/b6',
        'f',
        '32',
        5,
        'Active',
        'Passed'
    );

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
        'Active',
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
        'Active',
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
        'Active',
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

SELECT
    setval(
        pg_get_serial_sequence('public.user', 'id'),
        (
            SELECT
                MAX("id")
            FROM
                public.user
        ) + 1
    );

SELECT
    setval(
        pg_get_serial_sequence('public.platform_organization', 'id'),
        (
            SELECT
                MAX("id")
            FROM
                public.platform_organization
        ) + 1
    );

SELECT
    setval(
        pg_get_serial_sequence('public.device', 'id'),
        (
            SELECT
                MAX("id")
            FROM
                public.device
        ) + 1
    );