CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

CREATE TABLE public.certificate (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id integer NOT NULL,
    "currentOwnershipCommitmentRootHash" character varying,
    "pendingOwnershipCommitmentRootHash" character varying
);

CREATE TABLE public.certification_request (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id integer NOT NULL,
    energy integer NOT NULL,
    files text NOT NULL
);

CREATE SEQUENCE public.certification_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.certification_request_id_seq OWNED BY public.certification_request.id;

CREATE TABLE public.configuration (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id integer DEFAULT 1 NOT NULL,
    "countryName" character varying,
    currencies text,
    regions text,
    "externalDeviceIdTypes" text,
    "contractsLookup" text,
    "complianceStandard" character varying,
    "deviceTypes" text,
    "gridOperators" text,
    CONSTRAINT "CHK_3c3716a6563ee58bdf448a8c4e" CHECK ((id = 1))
);

CREATE TABLE public.device (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id integer NOT NULL,
    status integer NOT NULL,
    "facilityName" character varying NOT NULL,
    description character varying NOT NULL,
    images character varying NOT NULL,
    address character varying NOT NULL,
    region character varying NOT NULL,
    province character varying NOT NULL,
    country character varying NOT NULL,
    "operationalSince" integer NOT NULL,
    "capacityInW" integer NOT NULL,
    "gpsLatitude" character varying NOT NULL,
    "gpsLongitude" character varying NOT NULL,
    timezone character varying NOT NULL,
    "deviceType" character varying NOT NULL,
    "complianceRegistry" character varying NOT NULL,
    "otherGreenAttributes" character varying NOT NULL,
    "typeOfPublicSupport" character varying NOT NULL,
    "lastSmartMeterReading" text,
    "deviceGroup" character varying NOT NULL,
    "smartMeterReads" text NOT NULL,
    "externalDeviceIds" text,
    "organizationId" integer NOT NULL,
    "gridOperator" character varying
);

CREATE SEQUENCE public.device_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.device_id_seq OWNED BY public.device.id;

CREATE TABLE public.organization (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id integer NOT NULL,
    "activeCountries" character varying NOT NULL,
    code character varying NOT NULL,
    name character varying NOT NULL,
    contact character varying NOT NULL,
    telephone character varying NOT NULL,
    email character varying NOT NULL,
    address character varying NOT NULL,
    shareholders character varying NOT NULL,
    "ceoPassportNumber" character varying,
    "ceoName" character varying NOT NULL,
    "companyNumber" character varying,
    "vatNumber" character varying NOT NULL,
    postcode character varying NOT NULL,
    "headquartersCountry" integer NOT NULL,
    country integer NOT NULL,
    "businessTypeSelect" character varying NOT NULL,
    "businessTypeInput" character varying,
    "yearOfRegistration" integer NOT NULL,
    "numberOfEmployees" integer NOT NULL,
    website character varying NOT NULL,
    status integer NOT NULL,
    "leadUserId" integer
);

CREATE SEQUENCE public.organization_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.organization_id_seq OWNED BY public.organization.id;

CREATE TABLE public.organization_invitation (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id integer NOT NULL,
    email character varying NOT NULL,
    status integer NOT NULL,
    "organizationId" integer
);

CREATE SEQUENCE public.organization_invitation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.organization_invitation_id_seq OWNED BY public.organization_invitation.id;

CREATE TABLE public.ownership_commitment (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "rootHash" character varying NOT NULL,
    commitment text NOT NULL,
    leafs text NOT NULL,
    salts text NOT NULL,
    "txHash" character varying NOT NULL,
    "certificateId" integer
);

CREATE TABLE public."user" (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id integer NOT NULL,
    title character varying NOT NULL,
    "firstName" character varying NOT NULL,
    "lastName" character varying NOT NULL,
    email character varying NOT NULL,
    telephone character varying NOT NULL,
    password character varying NOT NULL,
    "blockchainAccountAddress" character varying,
    "blockchainAccountSignedMessage" character varying,
    notifications boolean,
    "autoPublish" text,
    rights integer DEFAULT 0 NOT NULL,
    "organizationId" integer
);

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;

ALTER TABLE ONLY public.certification_request ALTER COLUMN id SET DEFAULT nextval('public.certification_request_id_seq'::regclass);

ALTER TABLE ONLY public.device ALTER COLUMN id SET DEFAULT nextval('public.device_id_seq'::regclass);

ALTER TABLE ONLY public.organization ALTER COLUMN id SET DEFAULT nextval('public.organization_id_seq'::regclass);

ALTER TABLE ONLY public.organization_invitation ALTER COLUMN id SET DEFAULT nextval('public.organization_invitation_id_seq'::regclass);

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);

ALTER TABLE ONLY public.configuration
    ADD CONSTRAINT "PK_03bad512915052d2342358f0d8b" PRIMARY KEY (id);

ALTER TABLE ONLY public.device
    ADD CONSTRAINT "PK_2dc10972aa4e27c01378dad2c72" PRIMARY KEY (id);

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY (id);

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT "PK_8daddfc65f59e341c2bbc9c9e43" PRIMARY KEY (id);

ALTER TABLE ONLY public.ownership_commitment
    ADD CONSTRAINT "PK_aadd36f3a503014b8affd64b664" PRIMARY KEY ("rootHash");

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);

ALTER TABLE ONLY public.organization_invitation
    ADD CONSTRAINT "PK_cc1ac752952740b92ead1ee9249" PRIMARY KEY (id);

ALTER TABLE ONLY public.certification_request
    ADD CONSTRAINT "PK_dfc23ef2bf22d33b9edf5e4e2c6" PRIMARY KEY (id);

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT "REL_70190678ef25666fe0ebc10795" UNIQUE ("pendingOwnershipCommitmentRootHash");

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT "REL_b57ff7e8249b18beb91d9965fd" UNIQUE ("leadUserId");

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT "REL_d26b726af5b2e21bc1cc1ad947" UNIQUE ("currentOwnershipCommitmentRootHash");

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_6f73e3508ecb836bd99ec2ea6a0" UNIQUE (email, "blockchainAccountAddress");

ALTER TABLE ONLY public.ownership_commitment
    ADD CONSTRAINT "FK_2c91ff348c6ae125a1343269e6d" FOREIGN KEY ("certificateId") REFERENCES public.certificate(id);

ALTER TABLE ONLY public.organization_invitation
    ADD CONSTRAINT "FK_58d9ca5d9f882ad8be530d247f1" FOREIGN KEY ("organizationId") REFERENCES public.organization(id);

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT "FK_70190678ef25666fe0ebc10795e" FOREIGN KEY ("pendingOwnershipCommitmentRootHash") REFERENCES public.ownership_commitment("rootHash");

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT "FK_b57ff7e8249b18beb91d9965fd4" FOREIGN KEY ("leadUserId") REFERENCES public."user"(id);

ALTER TABLE ONLY public.device
    ADD CONSTRAINT "FK_c48c741b40e9f453eb1602928d6" FOREIGN KEY ("organizationId") REFERENCES public.organization(id);

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT "FK_d26b726af5b2e21bc1cc1ad947c" FOREIGN KEY ("currentOwnershipCommitmentRootHash") REFERENCES public.ownership_commitment("rootHash");

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_dfda472c0af7812401e592b6a61" FOREIGN KEY ("organizationId") REFERENCES public.organization(id);
