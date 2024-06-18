import * as React from "react"
import type {
    DataTableFilterableColumn,
    DataTableSearchableColumn,
} from "@/core/interfaces"
import {
    flexRender,
    type ColumnDef,
    type Table as TanstackTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {DataTablePagination} from "./data-table-pagination"
import {DataTableToolbar} from "./data-table-toolbar"
import {DateRange} from "react-day-picker";
import TransactionsTableProps from "@/components/dashboard/send-money/TransactionsTable";

import Lottie from "react-lottie";
import loadingData from "@/components/dashboard/lottie/loading-2.json";
interface TDataTableProps<TData, TValue> {
    /**
     * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
     * @type TanstackTable<TData>
     */
    table: TanstackTable<TData>,
    /**
     * The columns of the table.
     * @default []
     * @type ColumnDef<TData, TValue>[]
     */
    columns: ColumnDef<TData, TValue>[],
    /**
     * The search for table.
     */
    searchableColumns?: DataTableSearchableColumn[],
    /**
     * The filterable columns of the table. When provided, renders dynamic faceted filters, and the advancedFilter prop is ignored.
     * @default []
     * @type {id: keyof TData, title: string, options: { label: string, value: string, icon?: React.ComponentType<{ className?: string }> }[]}[]
     * @example filterableColumns={[{ id: "status", title: "Status", options: ["todo", "in-progress", "done", "canceled"]}]}
     */
    filterableColumns?: DataTableFilterableColumn<TData>[],
    /**
     * Enables notion like filters when enabled.
     * @default false
     * @type boolean
     */
    selectedAccount?: string,
    /**
     * The link to create a new row, will be rendered as a button.
     * @default undefined
     * @type string
     * @example newRowLink="/tasks/new"
     */
    newRowLink?: string,
    /**
     * The action to delete rows, will be rendered as a button.
     * @default undefined
     * @type React.MouseEventHandler<HTMLButtonElement> | undefined
     * @example deleteRowsAction={(event) => deleteSelectedRows(dataTable, event)}
     */
    deleteRowsAction?: React.MouseEventHandler<HTMLButtonElement>,
    pSearch: string,
    setPSearch: (value: (((prevState: string) => string) | string)) => void,
    pStatus: string,
    setPStatus: (value: (((prevState: string) => string) | string)) => void,
    date: DateRange | undefined,
    setDate: (value: (((prevState: (DateRange | undefined)) => (DateRange | undefined)) | DateRange | undefined)) => void,
    lang: string,
    isLoading?: boolean
    exportTransactionsData: (e: any) => void,
    isExportDataLoading: boolean,
    totalCount: string,
}

export function TDataTable<TData, TValue>({ table, columns, searchableColumns = [], filterableColumns = [], selectedAccount = 'all', newRowLink, deleteRowsAction, pSearch, setPSearch, pStatus, setPStatus, date, setDate, lang, isLoading, exportTransactionsData, isExportDataLoading, totalCount }: TDataTableProps<TData, TValue>) {
    
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: loadingData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <div className="w-full space-y-2.5 overflow-auto">
            <DataTableToolbar
                table={table}
                pSearch={pSearch}
                setPSearch={setPSearch}
                pStatus={pStatus}
                setPStatus={setPStatus}
                date={date}
                setDate={setDate}
                lang={lang}
                newRowLink={newRowLink}
                deleteRowsAction={deleteRowsAction}
                exportTransactionsData={exportTransactionsData}
                isExportDataLoading={isExportDataLoading}
                totalCount={totalCount}
            />
            <div className="">
                {isLoading ? <div className={`flex justify-center items-center border border-[#f0f0f0] rounded h-[24rem]`}>
                    <Lottie options={defaultOptions} height={110} width={110} />
                </div> :
                <Table>
                    <TableHeader className={`bg-[#f0f0f0]`}>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead className={`h-9 text-[#737373]`} key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    className={`border-[#fafafa]`}
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell className={`!py-3 text-[13px] font-normal`} key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Aucune transactions.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                }
            </div>
            <div className="space-y-2.5">
                <DataTablePagination table={table}/>
            </div>
        </div>
    )
}
