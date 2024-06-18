"use client"

import {Locale} from "@/i18n.config";
import React, {useState} from "react";
import TransactionsTable from "@/components/dashboard/transactions/TransactionsTable";
import {Button} from "@/components/ui/button";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {IUser} from "@/core/interfaces/user";
import Link from "next/link";
import Routes from "@/components/Routes";
import {ChevronRight} from "lucide-react";
import SupportShortcut from "@/components/dashboard/serenity-space/SupportShortcut";

interface FilterableTransactionsProps {
    lang: Locale,
    searchItems: {
        per_page: number,
        page: number,
        search?: string,
        from?: string,
        sort?: string,
        to?: string,
        status?: string,
        type?: string,
        period?: string,
        terminalId?: string,
    },
    merchant: IUser
}

export default function FilterableTransactions({lang, searchItems, merchant}: FilterableTransactionsProps) {
    const [selectedAccount, setSelectedAccount] = useState('all');

    const formSchema = z.object({
        search: z.string()
    })

    const filterableForm = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            search: "",
        }
    });

    return (
        <>
            <TransactionsTable searchItems={searchItems} lang={lang} selectedAccount={selectedAccount} merchant={merchant}/>
        </>
    );
}