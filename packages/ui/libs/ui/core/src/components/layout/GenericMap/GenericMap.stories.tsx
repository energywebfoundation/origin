/* deepscan-disable */
import React from 'react';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  PRIMARY_STORY,
  Stories,
} from '@storybook/addon-docs';
import { GenericMap, GenericMapProps, MapItem } from './GenericMap';
import { Typography } from '@mui/material';

const description =
  'Component displaying items on a map. Built with `@react-google-maps/api`. ' +
  'To properly test the component - insert a valid Google Maps API key in the appropriate field below.';

const mapItemsTypeDetail = `{
  id: string;
  latitude: string;
  longitude: string;
  // if supplied will be displayed as <Marker label={label} /> from @react-google-maps/api
  label?: string;
  [key: string]: any;
}`;

export default {
  title: 'Layout / GenericMap',
  component: GenericMap,
  parameters: {
    docs: {
      page: () => (
        <>
          <Title />
          <Description>{description}</Description>
          <Primary />
          <ArgsTable story={PRIMARY_STORY} />
          <Stories />
        </>
      ),
    },
  },
  argTypes: {
    apiKey: {
      description: 'Google Maps API key',
    },
    mapItems: {
      description: 'An array of items to be displayed on map',
      table: { type: { detail: mapItemsTypeDetail } },
    },
    infoWindowContent: {
      description:
        'If supplied - will display the Info Window on each Marker click',
      control: false,
    },
    containerClassName: {
      description:
        'Class used in root `GoogleMap` component instead of the default one',
      control: false,
    },
    mapProps: {
      description: 'Props supplied to `GoogleMap` component',
      control: false,
    },
    markerProps: {
      description: 'Props supplied to the `Marker` component',
      control: false,
    },
  },
} as Meta;

const Template: Story<GenericMapProps> = (args) => <GenericMap {...args} />;

const mapItems: MapItem[] = [
  {
    id: '1',
    latitude: '10.3',
    longitude: '15.4',
  },
  {
    id: '2',
    latitude: '27.8',
    longitude: '22',
  },
];

export const Default = Template.bind({});
Default.args = {
  apiKey: '',
  mapItems,
};

export const WithLabels = Template.bind({});
WithLabels.args = {
  apiKey: '',
  mapItems: mapItems.map((item) => ({
    ...item,
    label: item.id,
  })),
};

const InfoWindowContent = (props: MapItem) => {
  return (
    <>
      <Typography color="black">Item ID: {props.id}</Typography>
      <Typography color="black">Latitude: {props.latitude}</Typography>
      <Typography color="black">Longitude: {props.longitude}</Typography>
    </>
  );
};

export const WithInfoWindow = Template.bind({});
WithInfoWindow.args = {
  apiKey: '',
  mapItems,
  infoWindowContent: InfoWindowContent,
};
