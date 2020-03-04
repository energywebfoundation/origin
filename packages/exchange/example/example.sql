--
-- PostgreSQL database dump
--

-- Dumped from database version 11.2 (Debian 11.2-1.pgdg90+1)
-- Dumped by pg_dump version 11.3

-- Started on 2020-03-04 12:36:12 CET

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
-- TOC entry 2925 (class 0 OID 91478)
-- Dependencies: 202
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.account (id, "userId", address) VALUES ('d24531e8-a14e-48fb-9434-06dfef292d6d', '2', '0x4dc3c0838CB50dbA753f3aE583a61655019c40e1');


--
-- TOC entry 2920 (class 0 OID 91434)
-- Dependencies: 197
-- Data for Name: asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.asset (id, address, "tokenId", "deviceId") VALUES ('e7ce7521-aea0-49a0-bed3-deb7db357cd2', '0x9876', '0', '0');


--
-- TOC entry 2921 (class 0 OID 91443)
-- Dependencies: 198
-- Data for Name: demand; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.demand (id, "userId", price, start, "volumePerPeriod", periods, "timeFrame", product) VALUES ('87406dfd-1757-4ef9-ab28-c89ab8dadf90', '1', 1000, '2020-03-04 11:20:05.171441+00', 250, 1, NULL, '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}');


--
-- TOC entry 2923 (class 0 OID 91459)
-- Dependencies: 200
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('c6463d76-bd4e-4015-beef-0834c7fb682a', '2', 3, 500, 250, 1, 1000, '2020-03-04 11:20:05.648397+00', '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}', 'e7ce7521-aea0-49a0-bed3-deb7db357cd2', NULL);
INSERT INTO public."order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('d91d2450-ec5c-4819-9237-6582b6858ef4', '1', 2, 250, 0, 0, 1000, '2020-03-04 11:20:05.648397+00', '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}', NULL, '87406dfd-1757-4ef9-ab28-c89ab8dadf90');

INSERT INTO public."order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('ed4649f2-20f8-4589-a8be-296d4fe38d9c', '1', 0, 2500000, 2500000, 0, 900, '2020-03-04 11:20:05.648397+00', '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}', NULL, NULL);
INSERT INTO public."order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('47527400-26be-4830-aaa7-307e9a889b4e', '1', 0, 2500000, 2500000, 0, 850, '2020-03-04 11:20:05.648397+00', '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}', NULL, NULL);
INSERT INTO public."order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('6ec0593e-7810-4164-96a6-954b2e441172', '1', 0, 2500000, 2500000, 0, 750, '2020-03-04 11:20:05.648397+00', '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}', NULL, NULL);


INSERT INTO public."order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('d34ca8db-fa66-47fa-9d3f-6d9d278c03b2', '2', 0, 5000000, 5000000, 1, 1100, '2020-03-04 11:20:05.648397+00', '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}', NULL, '87406dfd-1757-4ef9-ab28-c89ab8dadf90');
INSERT INTO public."order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('a15e2d4c-f9d8-432e-8635-21b6c9aadcdf', '2', 0, 5000000, 5000000, 1, 1200, '2020-03-04 11:20:05.648397+00', '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}', NULL, '87406dfd-1757-4ef9-ab28-c89ab8dadf90');
INSERT INTO public."order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('b2a8a14c-ddf7-45cf-bc4e-108ba19d11eb', '2', 0, 15000000, 15000000, 1, 1300, '2020-03-04 11:20:05.648397+00', '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}', NULL, '87406dfd-1757-4ef9-ab28-c89ab8dadf90');


--
-- TOC entry 2922 (class 0 OID 91453)
-- Dependencies: 199
-- Data for Name: trade; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.trade (id, created, volume, price, "bidId", "askId") VALUES ('6bd15adf-f1ce-4003-b38e-9a560a2c5e2e', '2020-03-04 11:20:05.628+00', 250, 1000, 'd91d2450-ec5c-4819-9237-6582b6858ef4', 'c6463d76-bd4e-4015-beef-0834c7fb682a');


--
-- TOC entry 2924 (class 0 OID 91469)
-- Dependencies: 201
-- Data for Name: transfer; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.transfer (id, "userId", amount, "transactionHash", address, status, "confirmationBlock", direction, "assetId") VALUES ('7877df6a-79f0-4599-b92a-673754d1e6a2', '2', 100000000, '0x4a84a', '0x4dc3c0838CB50dbA753f3aE583a61655019c40e1', 3, 10000, 0, 'e7ce7521-aea0-49a0-bed3-deb7db357cd2');


-- Completed on 2020-03-04 12:36:13 CET

--
-- PostgreSQL database dump complete
--

