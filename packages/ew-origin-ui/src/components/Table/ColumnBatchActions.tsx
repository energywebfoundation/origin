import React, { Component } from 'react';
import './ColumnBatchActions.scss';

export interface IBatchableAction {
    label: string;
    handler: Function; 
}

export type CustomCounterGeneratorFunction = (selectedIndexes: number[]) => string;

interface IProps {
    selectedIndexes: number[];
    batchableActions: IBatchableAction[];
    customCounterGenerator?: CustomCounterGeneratorFunction; 
}

export class ColumnBatchActions extends Component<IProps> {
    handleAction(action: IBatchableAction) {
        action.handler(this.props.selectedIndexes);
    }

    get counter(): string {
        const {
            customCounterGenerator,
            selectedIndexes
        } = this.props;

        if (customCounterGenerator) {
            return customCounterGenerator(selectedIndexes);
        }

        return `${selectedIndexes.length} selected`;
    }

    render() {
        const {
            batchableActions,
            selectedIndexes
        } = this.props;

        return selectedIndexes.length ? (
            <div className="ColumnBatchActions">
                <span className="ColumnBatchActions_counter">{this.counter}</span>
                <div className="ColumnBatchActions_list">
                    {batchableActions.map(action => 
                        <div onClick={() => this.handleAction(action)} className="ColumnBatchActions_list_item" key={action.label}>
                            {action.label}
                        </div>
                    )}
                </div>
            </div>
        ) : '';
    }
}