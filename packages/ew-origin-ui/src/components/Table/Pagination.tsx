import * as React from 'react';
import ReactPaginate from 'react-paginate';

import './Pagination.scss';
import { dataTest } from '../../utils/Helper';

interface IProps {
    displayedEntriesLength: number;
    loadPage: (page: number) => void;
    pageSize: number;
    total: number;
    currentPage: number;
}

export class Pagination extends React.Component<IProps, {}> {
    get offset() {
        const { currentPage, pageSize } = this.props;

        return (currentPage - 1) * pageSize;
    }

    get numberOfPages() {
        const { total, pageSize } = this.props;

        return total > 0 ? Math.ceil(total / pageSize) : 0;
    }

    render() {
        const { displayedEntriesLength, loadPage, total } = this.props;

        if (!this.numberOfPages) {
            return <></>;
        }

        return (
            <div className="Pagination row">
                <div
                    className={displayedEntriesLength ? 'col-md-6' : 'd-none'}
                    {...dataTest('pagination-helper-text')}
                >
                    Showing {this.offset + 1} to {this.offset + displayedEntriesLength} of {total}{' '}
                    entries
                </div>
                {this.numberOfPages > 1 && (
                    <div className="col-md-6 text-right">
                        <ReactPaginate
                            previousClassName={'d-none'}
                            nextClassName={'d-none'}
                            breakLabel="..."
                            breakClassName={'Pagination_list_entry'}
                            pageCount={this.numberOfPages}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3}
                            onPageChange={({ selected }) => loadPage(selected + 1)}
                            containerClassName={'Pagination_list'}
                            pageClassName={'Pagination_list_entry'}
                            pageLinkClassName={''}
                            activeClassName={'Pagination_list_entry-current'}
                        />
                    </div>
                )}
            </div>
        );
    }
}
