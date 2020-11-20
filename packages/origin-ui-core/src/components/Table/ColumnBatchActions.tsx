import React, { Component } from 'react';
import { Button } from '@material-ui/core';

export interface IBatchableAction {
    label: string;
    handler: (selectedIds: string[]) => void;
}

export type CustomCounterGeneratorFunction = (selectedIds: string[]) => string;

interface IProps {
    selectedIds: string[];
    batchableActions: IBatchableAction[];
    customCounterGenerator?: CustomCounterGeneratorFunction;
}

export class ColumnBatchActions extends Component<IProps> {
    handleAction(action: IBatchableAction) {
        action.handler(this.props.selectedIds);
    }

    get counter(): string {
        const { customCounterGenerator, selectedIds } = this.props;

        if (customCounterGenerator) {
            return customCounterGenerator(selectedIds);
        }

        return `${selectedIds.length} selected`;
    }

    render() {
        const { batchableActions, selectedIds } = this.props;

        return selectedIds.length ? (
            <div className="ColumnBatchActions">
                <span color="primary">{this.counter}</span>
                <div className="ColumnBatchActions_list">
                    {batchableActions.map((action) => (
                        <Button
                            onClick={() => this.handleAction(action)}
                            key={action.label}
                            color="primary"
                            variant="outlined"
                        >
                            {action.label}
                        </Button>
                    ))}
                </div>
            </div>
        ) : (
            ''
        );
    }
}
