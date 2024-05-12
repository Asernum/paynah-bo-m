"use client"

import React, {useEffect, useState} from "react";
import { type ColumnDef } from "@tanstack/react-table"
import {
    filterableColumns,
    getColumns,
    searchableColumns
} from "@/components/dashboard/transactions/transactions-table-columns";
import {useDataTable} from "@/hooks/use-data-table-filterable-transactions";
import {TDataTable} from "@/components/dashboard/transactions/data-table/DataTable";

import { DateRange } from "react-day-picker"
import { addDays, startOfYear, endOfDay, format } from "date-fns"
import {IUser} from "@/core/interfaces/user";
import { getFilterableTransactions, getTransactions} from "@/core/apis/transaction";
import {TransactionsStatus} from "@/components/dashboard/serenity-space/LastTransactions";
import Link from "next/link";
import Routes from "@/components/Routes";
import {ChevronRight} from "lucide-react";
import SupportShortcut from "@/components/dashboard/serenity-space/SupportShortcut";
import {Button} from "@/components/ui/button";
import {Locale} from "@/i18n.config";
import {ScaleLoader} from "react-spinners";
import toast from "react-hot-toast";
import {downloadFile} from "@/core/apis/download-file";

interface TransactionsProps {
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
    lang: Locale,
    selectedAccount: string,
    merchant: IUser
}

export type TransactionsDataType = {
    id: string
    transactionId: string
    date: string
    createdAt: string
    amount: number
    beneficiary: string
    account: string
    status: TransactionsStatus,
    transaction_type: any,
    tId: string,
    pos: string,
    customer_firstname: string,
    customer_lastname: string,
    reference: string,
    operator: string,
    number: string,
    description: string,
}

export default function TransactionsTable({ searchItems, lang, selectedAccount, merchant }: TransactionsProps) {

    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);

    const [isLoading, setLoading] = useState(true);
    const [isExportDataLoading, setExportDataLoading] = useState(false);
    const [pSearch, setPSearch] = useState(searchItems.search ?? '');
    const [pStatus, setPStatus] = useState(searchItems.status ?? '');
    const [transactions, setTransactions] = useState<TransactionsDataType[]>([]);
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
        status : searchItems.status
    }

    const startPeriod = new Date(query.from ?? "");
    const endPeriod = new Date(query.to ?? "");
    const formatStartPeriod = startPeriod.toLocaleDateString('en-GB');
    const formatEndPeriod = endPeriod.toLocaleDateString('en-GB');
    const url = `/transactions/all-transactions/with-filters?merchantId=${query.merchantId}&search=${query.search ?? ""}&status=${query.status ?? ""}&page=${query.page}&perPage=${query.perPage}&from=${formatStartPeriod}&to=${formatEndPeriod}&csv=false`;

    const urlDownload = `/transactions/all-transactions/with-filters?merchantId=${query.merchantId}&search=${query.search ?? ""}&status=${query.status ?? ""}&page=${query.page}&perPage=${query.perPage}&from=${formatStartPeriod}&to=${formatEndPeriod}&csv=true`;
    function exportTransactionsData() {
        setExportDataLoading(true);

        downloadFile(urlDownload, String(merchant.accessToken), false)
            .then(response => response.blob())
            .then(blob => {
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                // a.download = 'data.csv';
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

        // exportTransactions(urlDownload, String(merchant.accessToken))
        //     .then(blob => {
        //         const downloadUrl = window.URL.createObjectURL(blob);
        //         const a = document.createElement('a');
        //         a.href = downloadUrl;
        //         a.download = 'data.csv';
        //         document.body.appendChild(a);
        //         a.click();
        //         document.body.removeChild(a);
        //
        //         setExportDataLoading(false);
        //     })
        //     .catch(err => {
        //         setExportDataLoading(false);
        //
        //         return toast.error(err.message, {
        //             className: '!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium'
        //         });
        //     });
    }

    useEffect(() => {
        setLoading(true);

        getFilterableTransactions(url, query, String(merchant.accessToken))
            .then(res => {
                console.log(res.data);
                setLoading(false);
                setTransactions(res.data ?? []);
                setTransactionsPagination(res.pagination ?? {});
            })
            .catch(err => {
                setLoading(false);
                setTransactions([]);
                setTransactionsPagination({});
            });
    }, [date, searchItems]);

    // const data: TransactionsDataType[] = [
    //     {
    //         id: "1",
    //         transactionId: "245653FS34S",
    //         date: "2024-04-20T11:00:00",
    //         amount: 3493774,
    //         beneficiary: "Didier Aney",
    //         account: "+225 07 77 40 41 36",
    //         status: "approved"
    //     },
    //     {
    //         id: "2",
    //         transactionId: "245653FS34S",
    //         date: "2023-04-20T11:00:00",
    //         amount: 1493774,
    //         beneficiary: "Didier Aney",
    //         account: "CI059093873683764849837",
    //         status: "approved"
    //     },
    //     {
    //         id: "3",
    //         transactionId: "245653FS34S",
    //         date: "2024-02-20T08:00:00",
    //         amount: 3493774,
    //         beneficiary: "Didier Aney",
    //         account: "CI059093873683764849837",
    //         status: "pending"
    //     },
    //     {
    //         id: "4",
    //         transactionId: "245653FS34S",
    //         date: "2024-04-20T11:00:00",
    //         amount: 3493774,
    //         beneficiary: "Koffi Olivier",
    //         account: "+225 07 73 44 11 00",
    //         status: "declined"
    //     },
    //     {
    //         id: "5",
    //         transactionId: "245653FS34S",
    //         date: "2024-01-20T11:00:00",
    //         amount: 3493774,
    //         beneficiary: "Didier Aney",
    //         account: "+225 07 77 40 41 36",
    //         status: "approved"
    //     },
    //     {
    //         id: "6",
    //         transactionId: "245653FS34S",
    //         date: "2024-04-20T11:00:00",
    //         amount: 3493774,
    //         beneficiary: "Didier Aney",
    //         account: "+225 07 77 40 41 36",
    //         status: "approved"
    //     },
    //     {
    //         id: "7",
    //         transactionId: "245653FS34S",
    //         date: "2024-04-20T11:00:00",
    //         amount: 3493774,
    //         beneficiary: "Didier Aney",
    //         account: "+225 07 77 40 41 36",
    //         status: "approved"
    //     }
    // ];
    const data = transactions;
    const pageCount = transactionsPagination?.totalPages ?? 1;

    const columns = React.useMemo<ColumnDef<TransactionsDataType, unknown>[]>(
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
        <>
            <div className={`flex justify-between items-center`}>
                <div className={`inline-flex items-center space-x-0.5`}>
                    <Link href={Routes.dashboard.home.replace('{lang}', lang)}
                          className={`text-base text-[#767676] tracking-tight`}>Serenity Space</Link>
                    <ChevronRight className={`h-4 w-4 text-[#767676]`}/>
                    <h2 className={`text-base text-black tracking-tight`}>{`Transactions`}</h2>
                </div>
                <div className={`py-2 px-3 bg-white rounded-xl inline-flex items-center space-x-3`}>
                    <span className={`text-xs`}>Avez vous des préoccupations ?</span>
                    <SupportShortcut lang={lang}/>
                </div>
            </div>
            <div className={`gap-3 mt-2.5 flex-grow`}>
                <div className={`flex flex-col h-full space-y-3`}>
                    <div className={`account-list`}>
                        <div className={`mb-4 mt-3`}>
                            <div className={`flex justify-between items-center`}>
                                <div className={`inline-flex items-center`}>
                                    <h1 className={`text-2xl font-medium mr-4`}>Historique des transactions</h1>
                                </div>
                                <div>
                                    <Button onClick={() => exportTransactionsData()} className={`px-6 text-xs inline-flex space-x-2 items-center`} disabled={isExportDataLoading}>
                                        {isExportDataLoading ? <ScaleLoader color="#fff" height={15} width={3} /> :
                                            <>
                                                <svg className={`h-4 w-4`} viewBox="0 0 24 24" fill="none"
                                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                     strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                    <polyline points="7 10 12 15 17 10"/>
                                                    <line x1="12" x2="12" y1="15" y2="3"/>
                                                </svg>
                                                <span>Exporter</span>
                                            </>
                                        }
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`h-full`}>
                        <div className={`flex-grow rounded-3xl h-full`}>
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
                                    />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}