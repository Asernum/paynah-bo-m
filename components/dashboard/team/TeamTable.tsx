"use client"

import React, {useState, useEffect} from "react";
import { type ColumnDef } from "@tanstack/react-table"
import {
    filterableColumns,
    getColumns,
    searchableColumns
} from "@/components/dashboard/team/team-table-columns";
import {useDataTable} from "@/hooks/use-data-table";
import {TDataTable} from "@/components/dashboard/team/data-table/DataTable";

import { DateRange } from "react-day-picker"
import { addDays, startOfYear, endOfDay, format } from "date-fns"
import {IUser} from '@/core/interfaces/user';
import {IMerchantUser} from '@/core/interfaces/merchantUser';
import {getMerchantUsers} from '@/core/apis/merchant-user';
interface TeamTableProps {
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
    merchant: IUser,
    isTeamListLoading: boolean,
    setIsTeamListLoading: (value: (((prevState: boolean) => boolean) | boolean)) => void,
}

export type TeamDataType = {
    id: string
    username: string
    role: string
    phone: string
    email: string
    date: string
}

export default function TeamTable({ searchItems, lang, merchant, isTeamListLoading, setIsTeamListLoading }: TeamTableProps) {

    const [isLoading, setLoading] = useState(false);
    const [userAccounts, setUserAccounts] = useState<IMerchantUser[]>([]);
    const [userAccountsPagination, setUserAccountsPagination] = useState(1);
    const [pSearch, setPSearch] = useState(searchItems.search ?? '');
    const [pStatus, setPStatus] = useState(searchItems.status ?? '');
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: searchItems.from ? new Date(searchItems.from) : startOfYear(new Date()),
        to: searchItems.to ? new Date(searchItems.to) : endOfDay(new Date()),
    })

    const data = userAccounts;
    const pageCount = userAccountsPagination;

    const columns = React.useMemo<ColumnDef<IMerchantUser, unknown>[]>(
        () => getColumns(lang),
        []
    )

    const { table } = useDataTable({
        data,
        columns,
        pageCount,
        searchableColumns,
        filterableColumns,
        // selectedAccount,
        pSearch,
        pStatus,
        date
    })

    const id = React.useId()

    useEffect(() => {
        setLoading(true);
        getMerchantUsers(String(merchant.merchantsIds[0].id), String(merchant.accessToken))
            .then(data => {
                console.log('teamData', data);
                setLoading(false);
                setIsTeamListLoading(false);
                setUserAccounts(data);
            })
            .catch(err => {
                setLoading(false);
                setIsTeamListLoading(false);
                setUserAccounts([]);
            });
    }, [pSearch, isTeamListLoading]);

    console.log(isTeamListLoading);

    return (
        <div>
            <TDataTable
                isLoading={isLoading}
                table={table}
                columns={columns}
                pSearch={pSearch}
                setPSearch={setPSearch}
                pStatus={pStatus}
                setPStatus={setPStatus}
                date={date}
                setDate={setDate}
                lang={lang}
            />
        </div>
    );
}