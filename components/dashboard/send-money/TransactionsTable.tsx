"use client"

import AccountListAndTransactionsProps from "@/components/dashboard/send-money/AccountListAndTransactions";
import React, {useState, useEffect} from "react";
import { type ColumnDef } from "@tanstack/react-table"
import {
    filterableColumns,
    getColumns,
    searchableColumns
} from "@/components/dashboard/send-money/transactions-table-columns";
import {useDataTable} from "@/hooks/use-data-table";
import {TDataTable} from "@/components/dashboard/send-money/data-table/DataTable";
import {ITransaction} from "@/core/interfaces/transaction";
import {IUser} from "@/core/interfaces/user";
import { DateRange } from "react-day-picker"
import { addDays, startOfYear, endOfDay, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { getFilterableTransactions, getTransactions } from "@/core/apis/transaction";
import toast from "react-hot-toast";
import { downloadFile } from "@/core/apis/download-file";
import {formatNumber} from "@/lib/utils";

interface TransactionsTableProps {
    searchItems: {
        per_page: number;
        page: number;
        search?: string;
        account?: string;
        from?: string;
        sort?: string;
        to?: string;
        status?: string
    },
    lang: string,
    selectedAccount: string,
    merchant: IUser,
}

// export type TransactionsDataType = {
//     id: string
//     transactionId: string
//     date: string
//     amount: number
//     beneficiary: string
//     account: string
//     status: "pending" | "approved" | "declined"
// }

export default function TransactionsTable({ searchItems, lang, selectedAccount, merchant }: TransactionsTableProps) {
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);

    const [isLoading, setLoading] = useState(false);
    const [isExportDataLoading, setExportDataLoading] = useState(false);
    const [pSearch, setPSearch] = useState(searchItems.search ?? '');
    const [pStatus, setPStatus] = useState(searchItems.status ?? '');
    const [transactions, setTransactions] = useState<ITransaction[]>([]);
    const [transactionsPagination, setTransactionsPagination] = useState<any>();
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: searchItems.from ? new Date(searchItems.from) : startOfYear(new Date()),
        to: searchItems.to ? new Date(searchItems.to) : endOfDay(currentDate),
    })

    const query = {
        // @ts-ignore
        merchantId : merchant.merchantsIds[0].id,
        search : searchItems.search,
        page : searchItems.page,
        perPage : searchItems.per_page,
        from: date?.from,
        to: date?.to,
        status : pStatus
    }

    const startPeriod = new Date(query.from ?? "");
    const endPeriod = new Date(query.to ?? "");
    const formatStartPeriod = startPeriod.toLocaleDateString('en-GB');
    const formatEndPeriod = endPeriod.toLocaleDateString('en-GB');
    const url = `/transactions/all-transactions/with-filters?merchantId=${query.merchantId}&searchTerm=${query.search ?? ""}&status=${query.status ?? ""}&page=${query.page}&perPage=${query.perPage}&from=${formatStartPeriod}&to=${formatEndPeriod}&csv=false`;

    const urlDownload = `/transactions/all-transactions/with-filters?merchantId=${query.merchantId}&searchTerm=${query.search ?? ""}&status=${query.status ?? ""}&page=${query.page}&perPage=${query.perPage}&from=${formatStartPeriod}&to=${formatEndPeriod}&csv=true`;
    const exportTransactionsData = (e: any) => {
        setExportDataLoading(true);
        e.preventDefault();
        downloadFile(urlDownload, 'GET', null, String(merchant.accessToken), false)
            .then(response => response.blob())
            .then(blob => {
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = 'transactions.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                setExportDataLoading(false);
            }).catch(err => {
            setExportDataLoading(false);

            return toast.error(err.message, {
                className: '!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium'
            });
        });
    }

    useEffect(() => {
        setLoading(true);
        // console.log(url);
        getFilterableTransactions(url, query, String(merchant.accessToken))
            .then(res => {
                // console.log(res.data);
                setLoading(false);
                setTransactions(res.data ?? []);
                setTransactionsPagination(res.pagination ?? {});
            })
            .catch(err => {
                setLoading(false);
                setTransactions([]);
                setTransactionsPagination({});
            });
    }, [searchItems, pStatus, date, pSearch]);

    const data = transactions;
    const pageCount = transactionsPagination?.totalPages ?? 1;

    // console.log(query.status);
    const columns = React.useMemo<ColumnDef<ITransaction, unknown>[]>(
        () => getColumns(lang),
        []
    )

    const { table } = useDataTable({
        data,
        columns,
        pageCount,
        searchableColumns,
        filterableColumns,
        selectedAccount,
        pSearch,
        pStatus,
        date
    })

    const id = React.useId()

    return (
        <div>
            <TDataTable
                isLoading={isLoading}
                table={table}
                columns={columns}
                selectedAccount={selectedAccount}
                pSearch={pSearch}
                setPSearch={setPSearch}
                pStatus={pStatus}
                setPStatus={setPStatus}
                date={date}
                setDate={setDate}
                lang={lang}
                exportTransactionsData={exportTransactionsData}
                isExportDataLoading={isExportDataLoading}
                totalCount={formatNumber(transactionsPagination?.totalCount ?? 0)}
            />
        </div>
    );
}