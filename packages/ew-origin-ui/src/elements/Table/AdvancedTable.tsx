import * as React from 'react';
import { Table, ITableProps, TableOnSelectFunction } from './Table';
import { ColumnBatchActions, IBatchableAction, CustomCounterGeneratorFunction } from '../../components/Table/ColumnBatchActions';

interface IProps extends ITableProps {
    onSelect?: TableOnSelectFunction;
    batchableActions?: IBatchableAction[];
    customSelectCounterGenerator?: CustomCounterGeneratorFunction
}


interface IState {
    selectedIndexes: number[];
}

export class AdvancedTable extends React.Component<IProps, IState> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            selectedIndexes: []
        };

        this.itemSelectionChanged = this.itemSelectionChanged.bind(this);
        this.resetSelection = this.resetSelection.bind(this);
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
            customSelectCounterGenerator
        } = this.props;

        const {
            selectedIndexes
        } = this.state;

        return <>
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
            />
        </>
    }
}