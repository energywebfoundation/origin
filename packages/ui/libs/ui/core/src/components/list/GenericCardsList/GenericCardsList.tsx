import React, { PropsWithChildren, ReactElement } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  Skeleton,
  Stack,
  Typography,
  BoxProps,
  TypographyProps,
  CheckboxProps,
} from '@material-ui/core';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ListCard, CardsListItem } from '../ListCard';
import { useStyles } from './GenericCardsList.styles';
import { useGenericCardsListEffects } from './GenericCardsList.effects';

const skeletonList = Array.from(Array(3).keys());

export interface GenericCardsListProps<Id> {
  checkedIds: Id[];
  handleCheck: (id: Id) => void;
  allItems: CardsListItem<Id>[];
  loading: boolean;
  listTitle?: string;
  listTitleProps?: TypographyProps;
  checkAllText?: string;
  allChecked?: boolean;
  handleAllCheck?: () => void;
  handleDrag?: (newOrder: CardsListItem<Id>[]) => Promise<void>;
  selectOnCardClick?: boolean;
  dragNdrop?: boolean;
  listWrapperProps?: BoxProps;
  headerWrapperProps?: BoxProps;
  selectAllCheckboxProps?: CheckboxProps;
}

export type TGenericCardsList = <Id>(
  props: PropsWithChildren<GenericCardsListProps<Id>>
) => ReactElement;

export const GenericCardsList: TGenericCardsList = ({
  checkedIds,
  handleCheck,
  checkAllText,
  listTitle,
  listTitleProps,
  allChecked,
  handleAllCheck,
  loading,
  allItems,
  handleDrag,
  selectOnCardClick,
  dragNdrop,
  listWrapperProps,
  headerWrapperProps,
  selectAllCheckboxProps,
  children,
}) => {
  const classes = useStyles();
  const { onCardDragEnd } = useGenericCardsListEffects(allItems, handleDrag);
  return (
    <Box {...listWrapperProps}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        {...headerWrapperProps}
      >
        {listTitle && (
          <Typography fontSize={20} {...listTitleProps}>
            {listTitle}
          </Typography>
        )}
        {checkAllText && (
          <FormControlLabel
            label={checkAllText}
            control={
              <Checkbox
                color="primary"
                checked={allChecked}
                onChange={handleAllCheck}
                {...selectAllCheckboxProps}
              />
            }
          />
        )}
      </Box>
      <DragDropContext onDragEnd={onCardDragEnd}>
        <Droppable
          isDropDisabled={!dragNdrop || !handleDrag}
          droppableId="droppable"
        >
          {(provided) => (
            <Grid
              ref={provided.innerRef}
              container
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="center"
            >
              {loading ? (
                <Stack>
                  {skeletonList.map((key) => (
                    <Skeleton
                      key={key}
                      className={classes.skeleton}
                      variant="rectangular"
                    />
                  ))}
                </Stack>
              ) : (
                allItems.map((item, idx) => {
                  const isCardSelected = checkedIds.indexOf(item.id) !== -1;
                  return (
                    <Draggable
                      isDragDisabled={!dragNdrop || !handleDrag}
                      key={`${item.id}`}
                      draggableId={`${item.id}`}
                      index={idx}
                    >
                      {(provided) => (
                        <Grid
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          item
                        >
                          <ListCard
                            selectOnCardClick={selectOnCardClick}
                            selected={isCardSelected}
                            handleSelect={handleCheck}
                            item={item}
                          />
                        </Grid>
                      )}
                    </Draggable>
                  );
                })
              )}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>
      {children}
    </Box>
  );
};
