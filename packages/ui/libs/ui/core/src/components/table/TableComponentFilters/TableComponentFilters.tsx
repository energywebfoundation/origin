import React, { useState, FC, memo } from 'react';
import {
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
} from '@material-ui/core';
import { FilterList } from '@material-ui/icons';
import { useStyles } from './TableComponentFilters.styles';
import { CloseButton } from '../../buttons';
import { TableFilter } from '../../../containers/TableComponent';

interface TableComponentFiltersProps {
  filters: TableFilter[];
  setFilters: (newValues: TableFilter[]) => void;
}

export const TableComponentFilters: FC<TableComponentFiltersProps> = memo(
  ({ filters, setFilters }) => {
    const classes = useStyles();
    const [showFilters, setShowFilters] = useState(false);

    const firstSliceRange = Math.ceil(filters.length / 2);
    const firstColumn = filters.slice(0, firstSliceRange);
    const secondColumn = filters.slice(firstSliceRange, filters.length);

    const theme = useTheme();
    const mobileView = useMediaQuery(theme.breakpoints.down('md'));

    return (
      <Box mb={1}>
        {!showFilters && (
          <Button
            className={classes.button}
            onClick={() => setShowFilters(true)}
          >
            <Box display="flex" alignItems="center">
              <FilterList fontSize="medium" />
              <Typography>Filter</Typography>
            </Box>
          </Button>
        )}
        {showFilters && (
          <Paper>
            <Box>
              <CloseButton onClose={() => setShowFilters(false)} />
            </Box>
            <Grid container className={classes.filtersContainer}>
              <Grid item xs={12} md={6}>
                {firstColumn.map((filter) => {
                  const { value, name, component: Filter } = filter;
                  const filterChangeHandler = (newValue: any) => {
                    const updatedFilters = filters.map((fltr) => {
                      if (fltr.name !== name) return fltr;
                      return { ...fltr, value: newValue };
                    });
                    setFilters(updatedFilters);
                  };
                  return (
                    <div
                      className={!mobileView ? classes.filter : undefined}
                      key={`table-filter-${name}`}
                    >
                      <Filter
                        value={value}
                        handleFilterChange={filterChangeHandler}
                      />
                    </div>
                  );
                })}
              </Grid>
              <Grid item xs={12} md={6}>
                {secondColumn.map((filter) => {
                  const { value, name, component: Filter } = filter;
                  const filterChangeHandler = (newValue: any) => {
                    const updatedFilters = filters.map((fltr) => {
                      if (fltr.name !== name) return fltr;
                      return { ...fltr, value: newValue };
                    });
                    setFilters(updatedFilters);
                  };
                  return (
                    <Filter
                      key={`table-filter-${name}`}
                      value={value}
                      handleFilterChange={filterChangeHandler}
                    />
                  );
                })}
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    );
  }
);
