CREATE SCHEMA IF NOT EXISTS public;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

CREATE TABLE public.account (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying NOT NULL,
    address character varying NOT NULL
);

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

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY (id);

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY (id);

ALTER TABLE ONLY public.demand
    ADD CONSTRAINT "PK_2e27cd7b3d79c50d197cb0b3924" PRIMARY KEY (id);

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY (id);

ALTER TABLE ONLY public.trade
    ADD CONSTRAINT "PK_d4097908741dc408f8274ebdc53" PRIMARY KEY (id);

ALTER TABLE ONLY public.transfer
    ADD CONSTRAINT "PK_fd9ddbdd49a17afcbe014401295" PRIMARY KEY (id);

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "FK_7f2d092dc1c3229755959c49b45" FOREIGN KEY ("demandId") REFERENCES public.demand(id);

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "FK_8b2e2e46cf8773a56a0fd512856" FOREIGN KEY ("assetId") REFERENCES public.asset(id);

ALTER TABLE ONLY public.trade
    ADD CONSTRAINT "FK_9cb1744cacf77d85709606bb70e" FOREIGN KEY ("askId") REFERENCES public."order"(id);

ALTER TABLE ONLY public.trade
    ADD CONSTRAINT "FK_b71911724b2024af5ac4e8fc5bf" FOREIGN KEY ("bidId") REFERENCES public."order"(id);

ALTER TABLE ONLY public.transfer
    ADD CONSTRAINT "FK_ec4244fc73c558c2eae38ba8ea6" FOREIGN KEY ("assetId") REFERENCES public.asset(id);