import React, { useState } from 'react';
import { Meta } from '@storybook/react';
import { GenericItemsList, GenericItemsListProps } from './GenericItemsList';
import { Typography } from '@material-ui/core';

export default {
  title: 'List / GenericItemsList',
  component: GenericItemsList,
} as Meta;

export const WithCheckboxes = (args: GenericItemsListProps<number, number>) => {
  const [allSelected, setAllSelected] = useState(false);
  const [checkedContainers, setCheckedContainers] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);

  const handleSelectAllCheck = () => {
    return setAllSelected(!allSelected);
  };

  const handleContainerCheck = (id: number) => {
    const newArrayOfContainers = [...checkedContainers];

    if (checkedContainers.includes(id)) {
      const indexOfCheckedContainer = newArrayOfContainers.indexOf(id);
      newArrayOfContainers.splice(indexOfCheckedContainer, 1);
    } else {
      newArrayOfContainers.push(id);
    }
    setCheckedContainers(newArrayOfContainers);
  };

  const handleItemCheck = (id: number) => {
    const newArrayOfItems = [...checkedItems];

    if (checkedItems.includes(id)) {
      const indexOfCheckedItem = newArrayOfItems.indexOf(id);
      newArrayOfItems.splice(indexOfCheckedItem, 1);
    } else {
      newArrayOfItems.push(id);
    }
    setCheckedItems(newArrayOfItems);
  };

  const listContainers = [
    {
      id: 1,
      isChecked: checkedContainers.includes(1),
      handleContainerCheck: handleContainerCheck,
      containerHeader: <Typography variant="h5">First container</Typography>,
      containerItems: [
        {
          id: 1,
          itemChecked: checkedItems.includes(1),
          handleItemCheck: handleItemCheck,
          itemContent: (
            <Typography>This is the first item of first container</Typography>
          ),
        },
      ],
    },
    {
      id: 2,
      isChecked: checkedContainers.includes(2),
      handleContainerCheck: handleContainerCheck,
      containerHeader: <Typography variant="h5">Second container</Typography>,
      containerItems: [
        {
          id: 2,
          itemChecked: checkedItems.includes(2),
          handleItemCheck: handleItemCheck,
          itemContent: (
            <Typography>This is the first item of second container</Typography>
          ),
        },
        {
          id: 3,
          itemChecked: checkedItems.includes(3),
          handleItemCheck: handleItemCheck,
          itemContent: (
            <Typography>This is the second item of second container</Typography>
          ),
        },
      ],
    },
  ];

  return (
    <GenericItemsList
      selectAllHandler={handleSelectAllCheck}
      allSelected={allSelected}
      listContainers={listContainers}
      {...args}
    />
  );
};

WithCheckboxes.args = {
  listTitle: 'Generic list',
  selectAllText: 'Select all',
  checkboxes: true,
};

export const WithoutCheckboxes = (
  args: GenericItemsListProps<number, number>
) => {
  const listContainers = [
    {
      id: 1,
      containerHeader: <Typography variant="h5">First container</Typography>,
      containerItems: [
        {
          id: 1,
          itemContent: (
            <Typography>This is the first item of first container</Typography>
          ),
        },
      ],
    },
    {
      id: 2,
      containerHeader: <Typography variant="h5">Second container</Typography>,
      containerItems: [
        {
          id: 2,
          itemContent: (
            <Typography>This is the first item of second container</Typography>
          ),
        },
        {
          id: 3,
          itemContent: (
            <Typography>This is the second item of second container</Typography>
          ),
        },
      ],
    },
  ];

  return <GenericItemsList listContainers={listContainers} {...args} />;
};

WithoutCheckboxes.args = {
  listTitle: 'Generic list',
};
