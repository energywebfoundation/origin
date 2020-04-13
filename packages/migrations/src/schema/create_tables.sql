--
-- PostgreSQL database dump
--

-- Dumped from database version 12.1
-- Dumped by pg_dump version 12.1

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

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying NOT NULL,
    address character varying NOT NULL
);


--
-- Name: asset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asset (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    address character varying NOT NULL,
    "tokenId" character varying NOT NULL,
    "deviceId" character varying NOT NULL,
    "generationFrom" timestamp with time zone NOT NULL,
    "generationTo" timestamp with time zone NOT NULL
);


--
-- Name: certificate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certificate (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id integer NOT NULL,
    "currentOwnershipCommitmentRootHash" character varying,
    "pendingOwnershipCommitmentRootHash" character varying
);


--
-- Name: certification_request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certification_request (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id integer NOT NULL,
    energy integer NOT NULL,
    files text NOT NULL
);


--
-- Name: certification_request_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.certification_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: certification_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.certification_request_id_seq OWNED BY public.certification_request.id;


--
-- Name: configuration; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: demand; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.demand (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying NOT NULL,
    price integer NOT NULL,
    start timestamp with time zone NOT NULL,
    "end" timestamp with time zone NOT NULL,
    "volumePerPeriod" bigint NOT NULL,
    "periodTimeFrame" integer NOT NULL,
    product json NOT NULL,
    status integer NOT NULL
);


--
-- Name: device; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: device_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.device_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: device_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.device_id_seq OWNED BY public.device.id;


--
-- Name: order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."order" (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying NOT NULL,
    status integer NOT NULL,
    "startVolume" bigint NOT NULL,
    "currentVolume" bigint NOT NULL,
    side integer NOT NULL,
    price integer NOT NULL,
    type integer DEFAULT 0 NOT NULL,
    "directBuyId" uuid,
    "validFrom" timestamp with time zone NOT NULL,
    product json NOT NULL,
    "assetId" uuid,
    "demandId" uuid
);


--
-- Name: organization; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: organization_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organization_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organization_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organization_id_seq OWNED BY public.organization.id;


--
-- Name: organization_invitation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_invitation (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id integer NOT NULL,
    email character varying NOT NULL,
    status integer NOT NULL,
    "organizationId" integer
);


--
-- Name: organization_invitation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organization_invitation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organization_invitation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organization_invitation_id_seq OWNED BY public.organization_invitation.id;


--
-- Name: ownership_commitment; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: trade; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trade (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created timestamp with time zone NOT NULL,
    volume bigint NOT NULL,
    price integer NOT NULL,
    "bidId" uuid,
    "askId" uuid
);


--
-- Name: transfer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transfer (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying NOT NULL,
    amount bigint NOT NULL,
    "transactionHash" character varying,
    address character varying NOT NULL,
    status integer NOT NULL,
    "confirmationBlock" integer,
    direction integer NOT NULL,
    "assetId" uuid
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: certification_request id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certification_request ALTER COLUMN id SET DEFAULT nextval('public.certification_request_id_seq'::regclass);


--
-- Name: device id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device ALTER COLUMN id SET DEFAULT nextval('public.device_id_seq'::regclass);


--
-- Name: organization id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization ALTER COLUMN id SET DEFAULT nextval('public.organization_id_seq'::regclass);


--
-- Name: organization_invitation id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_invitation ALTER COLUMN id SET DEFAULT nextval('public.organization_invitation_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: configuration PK_03bad512915052d2342358f0d8b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration
    ADD CONSTRAINT "PK_03bad512915052d2342358f0d8b" PRIMARY KEY (id);


--
-- Name: order PK_1031171c13130102495201e3e20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY (id);


--
-- Name: asset PK_1209d107fe21482beaea51b745e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY (id);


--
-- Name: device PK_2dc10972aa4e27c01378dad2c72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT "PK_2dc10972aa4e27c01378dad2c72" PRIMARY KEY (id);


--
-- Name: demand PK_2e27cd7b3d79c50d197cb0b3924; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demand
    ADD CONSTRAINT "PK_2e27cd7b3d79c50d197cb0b3924" PRIMARY KEY (id);


--
-- Name: organization PK_472c1f99a32def1b0abb219cd67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY (id);


--
-- Name: account PK_54115ee388cdb6d86bb4bf5b2ea; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY (id);


--
-- Name: certificate PK_8daddfc65f59e341c2bbc9c9e43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT "PK_8daddfc65f59e341c2bbc9c9e43" PRIMARY KEY (id);


--
-- Name: ownership_commitment PK_aadd36f3a503014b8affd64b664; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ownership_commitment
    ADD CONSTRAINT "PK_aadd36f3a503014b8affd64b664" PRIMARY KEY ("rootHash");


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: organization_invitation PK_cc1ac752952740b92ead1ee9249; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_invitation
    ADD CONSTRAINT "PK_cc1ac752952740b92ead1ee9249" PRIMARY KEY (id);


--
-- Name: trade PK_d4097908741dc408f8274ebdc53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trade
    ADD CONSTRAINT "PK_d4097908741dc408f8274ebdc53" PRIMARY KEY (id);


--
-- Name: certification_request PK_dfc23ef2bf22d33b9edf5e4e2c6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certification_request
    ADD CONSTRAINT "PK_dfc23ef2bf22d33b9edf5e4e2c6" PRIMARY KEY (id);


--
-- Name: transfer PK_fd9ddbdd49a17afcbe014401295; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfer
    ADD CONSTRAINT "PK_fd9ddbdd49a17afcbe014401295" PRIMARY KEY (id);


--
-- Name: certificate REL_70190678ef25666fe0ebc10795; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT "REL_70190678ef25666fe0ebc10795" UNIQUE ("pendingOwnershipCommitmentRootHash");


--
-- Name: organization REL_b57ff7e8249b18beb91d9965fd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT "REL_b57ff7e8249b18beb91d9965fd" UNIQUE ("leadUserId");


--
-- Name: certificate REL_d26b726af5b2e21bc1cc1ad947; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT "REL_d26b726af5b2e21bc1cc1ad947" UNIQUE ("currentOwnershipCommitmentRootHash");


--
-- Name: user UQ_6f73e3508ecb836bd99ec2ea6a0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_6f73e3508ecb836bd99ec2ea6a0" UNIQUE (email, "blockchainAccountAddress");


--
-- Name: ownership_commitment FK_2c91ff348c6ae125a1343269e6d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ownership_commitment
    ADD CONSTRAINT "FK_2c91ff348c6ae125a1343269e6d" FOREIGN KEY ("certificateId") REFERENCES public.certificate(id);


--
-- Name: organization_invitation FK_58d9ca5d9f882ad8be530d247f1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_invitation
    ADD CONSTRAINT "FK_58d9ca5d9f882ad8be530d247f1" FOREIGN KEY ("organizationId") REFERENCES public.organization(id);


--
-- Name: certificate FK_70190678ef25666fe0ebc10795e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT "FK_70190678ef25666fe0ebc10795e" FOREIGN KEY ("pendingOwnershipCommitmentRootHash") REFERENCES public.ownership_commitment("rootHash");


--
-- Name: order FK_7f2d092dc1c3229755959c49b45; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "FK_7f2d092dc1c3229755959c49b45" FOREIGN KEY ("demandId") REFERENCES public.demand(id);


--
-- Name: order FK_8b2e2e46cf8773a56a0fd512856; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "FK_8b2e2e46cf8773a56a0fd512856" FOREIGN KEY ("assetId") REFERENCES public.asset(id);


--
-- Name: trade FK_9cb1744cacf77d85709606bb70e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trade
    ADD CONSTRAINT "FK_9cb1744cacf77d85709606bb70e" FOREIGN KEY ("askId") REFERENCES public."order"(id);


--
-- Name: organization FK_b57ff7e8249b18beb91d9965fd4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT "FK_b57ff7e8249b18beb91d9965fd4" FOREIGN KEY ("leadUserId") REFERENCES public."user"(id);


--
-- Name: trade FK_b71911724b2024af5ac4e8fc5bf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trade
    ADD CONSTRAINT "FK_b71911724b2024af5ac4e8fc5bf" FOREIGN KEY ("bidId") REFERENCES public."order"(id);


--
-- Name: device FK_c48c741b40e9f453eb1602928d6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT "FK_c48c741b40e9f453eb1602928d6" FOREIGN KEY ("organizationId") REFERENCES public.organization(id);


--
-- Name: certificate FK_d26b726af5b2e21bc1cc1ad947c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT "FK_d26b726af5b2e21bc1cc1ad947c" FOREIGN KEY ("currentOwnershipCommitmentRootHash") REFERENCES public.ownership_commitment("rootHash");


--
-- Name: user FK_dfda472c0af7812401e592b6a61; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_dfda472c0af7812401e592b6a61" FOREIGN KEY ("organizationId") REFERENCES public.organization(id);


--
-- Name: transfer FK_ec4244fc73c558c2eae38ba8ea6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfer
    ADD CONSTRAINT "FK_ec4244fc73c558c2eae38ba8ea6" FOREIGN KEY ("assetId") REFERENCES public.asset(id);


--
-- PostgreSQL database dump complete
--

