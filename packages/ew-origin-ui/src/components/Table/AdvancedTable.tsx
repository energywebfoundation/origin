import * as React from 'react';
import { Table, ITableProps, TableOnSelectFunction } from './Table';
import { ColumnBatchActions, IBatchableAction, CustomCounterGeneratorFunction } from './ColumnBatchActions';
import { FiltersHeader, ICustomFilterDefinition, ICustomFilter } from './FiltersHeader';

interface IState {
    selectedIndexes: number[];
}

interface IProps extends ITableProps {
    onSelect?: TableOnSelectFunction;
    batchableActions?: IBatchableAction[];
    customSelectCounterGenerator?: CustomCounterGeneratorFunction
    filters?: ICustomFilterDefinition[];
}

export class AdvancedTable extends React.Component<IProps, IState> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            selectedIndexes: []
        };

        this.itemSelectionChanged = this.itemSelectionChanged.bind(this);
        this.resetSelection = this.resetSelection.bind(this);
        this.filtersChanged = this.filtersChanged.bind(this);
        this.loadPage = this.loadPage.bind(this);
    }

    itemSelectionChanged(index: number, selected: boolean) {
        let selectedIndexes = this.state.selectedIndexes;

        if (selected) {
            if (!selectedIndexes.includes(index)) {
                selectedIndexes = [...selectedIndexes, index];
            }
        } else {
            if (selectedIndexes.includes(index)) {
                selectedIndexes = selectedIndexes.filter(selectedIndex => selectedIndex !== index);
            }
        }

        this.setState({
            selectedIndexes
        });
    }

    resetSelection() {
        this.setState({
            selectedIndexes: []
        });
    }

    componentDidUpdate(prevProps: IProps) {
        if (JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)) {
            this.resetSelection();
        }
    }

    filtersChanged(filters: ICustomFilter[]) {
        this.loadPage(1, filters);
    }

    loadPage(page: number, filters: ICustomFilter[]) {
        if (!this.props.loadPage) {
            return;
        }

        this.props.loadPage(page, filters);
    }

    render() {
        const {
            header,
            operationClicked,
            footer,
            data,
            operations,
            loadPage,
            total,
            pageSize,
            actionWidth,
            actions,
            batchableActions,
            customSelectCounterGenerator,
            filters,
            currentSort,
            sortAscending,
            toggleSort
        } = this.props;

        const {
            selectedIndexes
        } = this.state;

        return <>
            <FiltersHeader
                filters={filters}
                filtersChanged={this.filtersChanged}
            />
            
            <ColumnBatchActions
                batchableActions={batchableActions}
                selectedIndexes={selectedIndexes}
                customCounterGenerator={customSelectCounterGenerator}
            />
            <Table
                operationClicked={operationClicked}
                classNames={['bare-font', 'bare-padding']}
                header={header}
                footer={footer}
                actions={actions}
                data={data}
                actionWidth={actionWidth}
                operations={operations}
                loadPage={loadPage}
                total={total}
                pageSize={pageSize}
                onSelect={batchableActions && batchableActions.length ? this.itemSelectionChanged : null}
                currentSort={currentSort}
                sortAscending={sortAscending}
                toggleSort={toggleSort}
            />
        </>
    }
}