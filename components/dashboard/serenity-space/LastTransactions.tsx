"use client"

import {Locale} from "@/i18n.config";
import React, {useState, useEffect} from "react";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {
    AlertTriangle,
    ChevronRight,
    ClipboardList,
    RotateCw,
} from "lucide-react";
import Link from "next/link";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {formatCFA, formatDate, getStatusBadge} from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

import {IUser} from "@/core/interfaces/user";
import {ITransaction} from "@/core/interfaces/transaction";
import {IAccount} from "@/core/interfaces/account";
import {getTransactions} from "@/core/apis/transaction";
import {getMerchantBankAccounts} from "@/core/apis/bank-account";
import Routes from "@/components/Routes";
import loadingData from "@/components/dashboard/lottie/loading-2.json";
import Lottie from "react-lottie";
import LoadingAnimation from "@/components/dashboard/lottie/LoadingAnimation";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import toast from "react-hot-toast";

interface LastTransactionsProps {
    lang: Locale,
    merchant: IUser
}

export enum TransactionsStatus {
    DONE = 'Approved',
    PENDING = 'Pending',
    DECLINED = 'Declined',
    EXPIRED = 'Expired',
}

export enum TransactionsType {
    DEBIT = 'PAYOUT',
    CREDIT = 'PAYIN',
}

export default function LastTransactions({lang, merchant}: LastTransactionsProps) {

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: loadingData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const [isLoading, setLoading] = useState(true);
    const [showConError, setShowConError] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [currentAccount, setCurrentAccount] = useState('');

    const handleChangeAccount = async (value: any) => {
        console.log(value);
        const selectedCoreBankId = value == "all" ? "" : value;
        fecthTransactions(selectedCoreBankId);
        setCurrentAccount(selectedCoreBankId);
    }
    
    function fecthTransactions(coreBankId: string) {
        // @ts-ignore
        const query = {coreBankId: coreBankId, merchantId: merchant.merchantsIds[0].id}
        getTransactions(query, String(merchant.accessToken))
            .then(data => {
                console.log(data);
                setTransactions(data ?? []);
                setLoading(false);
            })
            .catch(err => {
                setTransactions([]);
                setLoading(false);
            });
    }

    // console.log(isLoading);

    function fetchMerchantBankAccounts() {
        // @ts-ignore
        getMerchantBankAccounts(String(merchant.merchantsIds[0].id), String(merchant.accessToken))
        .then(data => {
            console.log(data.accounts);
            setAccounts(data.accounts ?? []);
        })
        .catch(err => {
            setAccounts([]);
        });
    }

    useEffect(() => {
        fetchMerchantBankAccounts()
        fecthTransactions("");
    }, []);


    const formSchema = z.object({
        pAccount: z.string().min(1, {
            message: 'Le champ est requis'
        }),
    });

    const selectAccount = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            pAccount: "",
        }
    });

    const copyPaymentLink = async (label: string, dataToCopy: string) => {
        try {
            await navigator.clipboard.writeText(dataToCopy);
            toast.success(`${label} copié!`, {
                className: '!bg-green-50 !max-w-xl !text-green-600 !shadow-2xl !shadow-green-50/50 text-sm font-medium'
            });
        } catch (err) {
            return toast.error("une erreur est survenue!", {
                className: '!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium'
            });
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        setLoading(true);

        setShowConError(true);
    }

    return (
        <div className={`bg-white sales-point flex-grow rounded-2xl px-6 py-5`}>
            <div className={`flex items-center justify-between pb-1.5`}>
                <div className={`inline-flex items-center space-x-3`}>
                    <h2 className={`font-medium text-base`}>Transactions récentes</h2>
                    <Form {...selectAccount}>
                        <form onSubmit={selectAccount.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={selectAccount.control}
                                name="pAccount"
                                render={({field}) => (
                                    <FormItem>
                                        <FormControl>
                                            <div>
                                                <Select onValueChange={(value) => handleChangeAccount(value)} defaultValue={"all"}>
                                                    <SelectTrigger className={`h-[2.2rem] text-xs rounded-xl border border-[#f4f4f7] pl-2.5 pr-1 font-normal`} style={{
                                                        backgroundColor: field.value ? '#f4f4f7' : '#f4f4f7',
                                                    }}>
                                                        <SelectValue  placeholder="Choisir un compte"/>
                                                    </SelectTrigger>
                                                    <SelectContent className={`bg-[#f0f0f0]`}>
                                                        {accounts.map((account: IAccount, index) => (
                                                            <SelectItem key={account.id}
                                                                        className={`font-normal text-xs px-7 focus:bg-gray-100`}
                                                                        value={account.id}>
                                                                {account.name ? account.name : (account.isMain ? 'Compte Principal' : 'Compte')}
                                                            </SelectItem>
                                                        ))}
                                                        <SelectItem key={`all`}
                                                                    className={`font-normal text-xs px-7 focus:bg-gray-100`}
                                                                    value="all">
                                                            Tous
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>
                <div>
                    <Link className={`inline-flex cursor-pointer text-xs text-[#909090] hover:underline duration-200 mb-1`} href={Routes.dashboard.transactions.replace('{lang}', lang)}>
                        <span>Voir tout</span>
                        <ChevronRight className={`h-4 w-auto`} />
                    </Link>
                </div>
            </div>
            {isLoading ?
                (<div className={`flex justify-center items-center h-full`}>
                    <div className={`inline-flex flex-col justify-center`}>
                        <div className={`mb-[5rem]`}>
                            <div>
                                <Lottie options={defaultOptions} height={120} width={120} />
                            </div>
                        </div>
                    </div>
                </div>) :
                (<div className={`mt-3 h-full  ${transactions.length == 0 ? 'pb-12' : 'pb-0'}`}>
                    {transactions && transactions.length == 0 ?
                        <div className={`flex justify-center items-center h-full`}>
                            <div className={`inline-flex flex-col justify-center`}>
                                <svg className={`h-[4rem] w-auto`} viewBox="0 0 169.57 119">
                                    <g>
                                        <g>
                                            <path className="t-cls-1"
                                                  d="M67.24,34.31c-.09.84-.03,1.63,1.07,1.91,1.03.26,2.07.59,3.01,1.07,1.69.86,2.24.31,2.01-1.34.45-1.26-.03-1.7-1.21-1.77-1.06-.06-2.11-.37-3.18-.41-.57-.02-1.56-.79-1.7.54Z"/>
                                            <path className="t-cls-1"
                                                  d="M103.75,82.04c1.39.05,2.13-1.53,2.26-2.79.12-1.21-1.06-1.71-2.25-1.98-1.18.25-2.6.82-2.55,2.1.04,1.25,1.28,2.63,2.54,2.67Z"/>
                                            <path className="t-cls-1"
                                                  d="M65.85,25.87c.76.16,1.4.44,1.83-.56,1.02-2.33,2.12-4.63,3.23-7.04-7.24-.7-14.35-1.39-21.47-2.08,5.86-.74,11.61.15,17.33.89,3.46.46,6.14.1,7.67-3.36.03-.06.02-.14.06-.46H6.36c7.07,1.77,14.18,3.24,21.28,4.71,12.74,2.63,25.48,5.25,38.21,7.9Z"/>
                                            <path className="t-cls-1"
                                                  d="M118.41,12.17c-13.24-8.08-29.76-4.07-38.36,9.47-2.2,3.46-3.88,7.11-4.63,11.16-.11.58-.05,1.32-.59,1.67,0,.03.01.06.02.09.17,1.48-.44,3.22,1.73,3.9,1.94.61,2.42.43,2.43-1.6,0-1.09.1-2.16.27-3.2-.38.03-.76.05-1.13.08-1.61.11-1.6-2.89,0-3,.59-.04,1.21-.08,1.86-.12.43-1.35.99-2.67,1.68-3.97,2-3.77,4.46-6.84,7.37-9.26-.32-.5-.63-1.01-.95-1.51-.97-1.54,1.2-3.04,2.16-1.52l.9,1.43c3.92-2.64,8.55-4.2,13.88-4.67,8.97-.8,16.9,6.56,17.25,15.52,1.57-.37,2.24,2.52.66,2.89-.26.06-.49.11-.72.16-.54,7.16-4.02,12.88-9.56,17.69-.08.9-.78,1.72-1.56,1.34-1.46,1.3-1.21,1.45,1.02,2.39.12-.81.92-1.17,1.44-1.69,2.47-2.45,5.01-4.84,6.87-7.82,2.81-4.51,4.7-9.3,4.49-14.73-.03-.91-.01-1.82.22-2.72.05-.13.09-.27.14-.4-.75-.92-.74-2.13-.95-3.23-.71-3.71-2.61-6.35-5.93-8.37Z"/>
                                            <path className="t-cls-1"
                                                  d="M110.14,7.06c3.95.77,7.45,2.62,11.18,5.11-1.5-4.81-9.07-10.4-12.9-9.92.22,1.04.5,2.09.64,3.15.1.77.1,1.47,1.08,1.66Z"/>
                                            <path className="t-cls-1"
                                                  d="M71.02,73.65c.08,1.17-.89,1.13-1.77,1.13-4.09.02-5.85,1.8-5.7,5.96.05,1.38-.27,1.88-1.73,1.97-3.16.19-4.4,1.63-4.38,4.8.02,1.83.34,3.64.72,5.41.46,2.17,2.52,3.99,4.48,4.15,1.96.16,3.32-.8,4.24-2.48.76-1.37.65-2.68-.16-4-1.14-1.84-2.09-3.78-2.61-5.89-.17-.69-.49-1.6.53-1.88.82-.22,1.1.58,1.38,1.17.83,1.71,1.38,3.55,2.48,5.14,1.9,2.74,3.83,3.48,5.74,2.15,1.6-1.12,1.89-4.54.46-6.6-.9-1.3-1.92-2.51-2.53-3.98-.31-.76-.74-1.75.22-2.19.81-.37,1.29.56,1.62,1.2.79,1.48,1.85,2.75,2.9,4.03.91,1.12,2.1,1.59,3.52,1.49,1.37-.09,2.71-.36,3.28-1.81.52-1.32-.43-2.18-1.26-3.01-1.35-1.35-2.7-2.71-3.67-4.37-.29-.5-.58-1.1,0-1.57.6-.49,1.1-.05,1.51.36.99,1,2.07,1.94,2.94,3.03,1.78,2.21,3.84,2.87,6.29,1.88-.94-.74-1.84-1.52-3.22-1.13-.59.17-1.27.08-1.18-.77.16-1.57-1-2.15-1.97-2.89-1.91-1.46-3.97-2.75-5.74-4.35-2.05-1.85-3.99-2.45-6.22-.48.38,1.18-.27,2.31-.19,3.5ZM65.15,90.61c-2.22.33-4.09,1.04-4.32,3.65-.87-2.92,1.18-4.71,4.32-3.65ZM78.65,81.13c.8-1.03,1.65-1.11,3.14-.25-.76.53-1.88.11-2.4.99-.22.37-.26,1.2-.92.76-.63-.42-.19-1.03.18-1.5ZM74.48,86.25c-2.55-1.11-4.19-.75-4.69,2.21-.56-1.95-.31-2.77.76-3.42,1.23-.75,2.27-.51,3.92,1.22Z"/>
                                            <path className="t-cls-1"
                                                  d="M109.02,52.46c-18.2-6.54-36.45-12.96-54.67-19.46-13.22-4.72-26.44-9.42-39.67-14.09-2.06-.73-4.12-1.46-5.84-2.22,3.87,1.98,7.98,4.61,12.18,7.05,14.94,8.67,29.82,17.42,44.73,26.13,17.49,10.22,34.99,20.42,52.47,30.65,1.13.66,2.43,1.14,3.02,2.48,0,0,0,0,0,0,1.14-.45,1.92.41,2.76.9,8.05,4.65,16.06,9.36,24.33,14.08.17-1.18-.25-2.08-.54-2.97-3.4-10.15-7.01-20.23-10.45-30.36-.62-1.83-1.79-2.85-3.58-3.46-6.05-2.07-12.07-4.23-18.09-6.38-1.25-.45-2.79-.55-3.54-1.91-1.09.37-2.11-.09-3.11-.44Z"/>
                                            <path className="t-cls-1"
                                                  d="M87.44,10.96c1.97-1.37,4.08-2.5,6.33-3.31,1.21-.44,1.5-1.12,1.01-2.27-.35-.81-.75-1.64-.49-2.55-1.39-.4-2.69-.06-4,.54-2.33,1.08-4.51,2.41-6.54,3.97-.7.54-1.43.97-2.24,1.27,1.43.19,2.35,1.2,3.3,2.12.87.84,1.67.89,2.63.22Z"/>
                                            <path className="t-cls-1"
                                                  d="M95.86,2.65c.94,3.36,3.11,4.04,6.21,3.02.85-.28,1.82-.02,2.71-.14.84-.11,2.26.75,2.36-.84.09-1.42-.64-2.6-2.29-2.7-1.98-.11-3.91-.68-5.92-.54-.04,0-.09-.01-.13-.02-.97.87-2.48.17-3.55.73.02,0,.04,0,.07,0,.22.13.49.27.55.48Z"/>
                                            <path className="t-cls-1"
                                                  d="M88.56,82.25c-1.18.31-2.12.72-2.65,1.97-1.03,2.45-3.12,3.39-5.63,3.31-1.57-.05-2.35.24-2.6,2.04-.39,2.84-2.8,4.75-5.63,4.54-1.63-.12-2.58.26-3.43,1.69-1.6,2.68-3.97,4.14-7.84,3.41,2.77,2.37,4.04,5.07,5.6,7.6,2.62,4.25,6.5,6.4,11.63,6.4,13.56.01,21.49-5.5,27.23-19.16.39-.92.77-1.84,1.18-2.75-.07.01-.14.02-.2.04-1.43.07-2.45-.69-3.37-1.65-.03-.03-.05-.07-.07-.1-1.02.87-1.47,2.39-3.27,3.04.76-1.78,1.76-2.93,2.82-4.01-.01-.08-.03-.16-.03-.25.36-2.15,2.04-3.53,3.13-5.25.35-.56.72-1.1,1.09-1.65.97-1.46,1.5-2.99.27-4.55-1.13-1.43-3.34-1.78-5.19-.65-3.13,1.92-5.41,4.8-7.86,7.47-1.1,1.2-1.92,2.69-3.48,3.42-.09,0-.17-.02-.25-.04-1.64,2.61-3.87,4.3-7.01,5.04-3.9.92-7.64,2.35-10.67,5.27.36-1.72,1.72-2.37,2.86-3.19,1.57-1.11,3.34-1.87,5.19-2.29,3.62-.82,6.87-2.19,9.09-5.31,0-.02-.02-.03-.03-.04-.04-1.46,1.08-2.31,1.85-3.29.78-.98.65-1.65-.23-2.26-.5.93-1.61.94-2.52,1.18ZM100.03,79.34c.45-1.74,1.88-2.59,3.44-3,1.91.15,3.17.98,3.52,2.75.25,1.31-1.94,4.09-3.1,4.12-1.02.03-4.11-2.88-3.86-3.87ZM94.01,85.91c1.6,1.07,3.05,2.32,4.38,3.7-.18.22-.35.44-.53.66-1.46-1.25-2.93-2.49-4.39-3.74.18-.21.36-.41.55-.62ZM95.99,91.31c-1.09-.6-2.26-1.12-3-2.79,1.66.68,2.72,1.3,3,2.79Z"/>
                                            <path className="t-cls-1"
                                                  d="M73.66,30.84c.32-1.53.8-3.04,1.44-4.47.76-1.72.33-2.64-1.49-3.01-.4-.08-.78-.26-1.13-.48-.57-.35-1.22-.74-.83-1.53.31-.64,1.08-.64,1.53-.35,3.47,2.25,4.93-.19,6.49-2.62.93-1.47,2.3-2.59,3.51-3.82.8-.81.81-1.48-.03-2.3-.91-.9-2.14-1.63-2.23-3.13,0,0,0,0,0,0-1.17,1.7-2.28,3.47-4.47,4.05.01.07.02.14.02.22-.37,1.41-1.41,2.41-2.25,3.51-2.89,3.82-4.83,8.06-5.91,12.7-.54,2.28-.27,2.65,1.98,2.86,1.1.11,2.2.25,3.3.42-.47-.65-.07-1.37.07-2.05Z"/>
                                            <path className="t-cls-2"
                                                  d="M103.85,29.14c3.81-.26,7.53-.7,11.3-1.39,3.58-.65,3.59-.28,7.14-1.11-.35-8.96-8.28-16.32-17.25-15.52-5.33.47-9.95,2.03-13.88,4.67,2.86,4.55,5.72,9.09,8.57,13.64,1.37-.09,2.74-.19,4.11-.28Z"/>
                                            <path className="t-cls-2"
                                                  d="M89.06,17.38c-2.9,2.41-5.36,5.49-7.37,9.26-.69,1.3-1.25,2.62-1.68,3.97,5.2-.33,11.99-.65,16.75-.98-2.57-4.08-5.13-8.17-7.7-12.25Z"/>
                                            <path className="t-cls-2"
                                                  d="M104.34,32.11c-.93.06-1.86.13-2.79.19,3.11,4.96,6.21,10.18,10.57,13.68.45.36.6.9.56,1.41,5.54-4.81,9.02-10.54,9.56-17.69-2.94.64-3.26.37-6.66.99-3.75.69-7.45,1.16-11.24,1.42Z"/>
                                            <path className="t-cls-2"
                                                  d="M121.24,83s0,0,0,0c-.59-1.34-1.89-1.82-3.02-2.48-17.48-10.23-34.98-20.43-52.47-30.65-14.91-8.71-29.79-17.46-44.73-26.13-4.2-2.44-8.31-5.07-12.18-7.05,1.72.76,3.78,1.49,5.84,2.22,13.23,4.67,26.45,9.37,39.67,14.09,18.22,6.5,36.47,12.92,54.67,19.46,1,.35,2.02.81,3.11.44-.05-.09-.11-.17-.15-.27.49-.29.69-.63.14-1.06-.02-.16-.02-.31,0-.44-2.23-.95-2.48-1.09-1.02-2.39-.08-.04-.17-.09-.25-.16-4.55-3.65-7.8-8.91-11.05-14.09-.41-.66-.83-1.31-1.24-1.97-5.58.38-13.43.77-19.28,1.15-.17,1.04-.27,2.11-.27,3.2-.01,2.03-.49,2.21-2.43,1.6-2.17-.68-1.56-2.42-1.73-3.9,0-.03-.01-.06-.02-.09-.15.1-.34.17-.6.2-.11-.51.05-1.11-.41-1.53-.1-.08-.17-.17-.23-.25-1.09-.16-2.2-.31-3.3-.42-2.25-.21-2.52-.58-1.98-2.86,1.08-4.64,3.02-8.88,5.91-12.7.84-1.1,1.88-2.1,2.25-3.51,0-.08,0-.15-.02-.22-.08.02-.14.05-.22.07-.34-.31-.67-.62-1.01-.94,0,0,0,0-.01,0-.91-.04-1.82-.1-2.73-.1H15.38c-4.4,0-8.81-.08-13.21-.06-.74.01-1.9-.5-2.15.57-.2.82.92,1.02,1.52,1.39,2.83,1.72,5.74,3.29,8.41,5.29,14.25,10.73,28.54,21.41,42.81,32.1,6.8,5.1,13.6,10.19,20.43,15.31-.85,1.08-2.04,1.53-2.48,2.67,0,0,0,0,0,0,0,0,0,0,0,0,.15.17.29.34.44.51.02.05.03.1.04.15,2.23-1.97,4.17-1.38,6.22.48,1.77,1.6,3.83,2.89,5.74,4.35.97.74,2.13,1.32,1.97,2.89-.09.85.59.94,1.18.77,1.38-.39,2.28.39,3.22,1.13.24-.1.48-.19.72-.32.34.36.69.72,1.03,1.08-.05.21-.12.39-.2.55.88.61,1.01,1.27.23,2.26-.77.98-1.89,1.83-1.85,3.29,0,.02.02.03.03.04.06-.08.12-.15.18-.24.16.17.32.34.49.51-.04.07-.09.13-.13.2.08.02.16.03.25.04,1.56-.73,2.38-2.22,3.48-3.42,2.45-2.67,4.73-5.55,7.86-7.47,1.85-1.13,4.06-.78,5.19.65,1.23,1.56.7,3.09-.27,4.55-.37.55-.74,1.09-1.09,1.65-1.09,1.72-2.77,3.1-3.13,5.25,0,.09.02.17.03.25.09-.09.17-.18.26-.26.18.32.37.64.55.96-.13.08-.25.18-.37.27.03.03.05.07.07.1.92.96,1.94,1.72,3.37,1.65.07-.02.14-.03.2-.04.07-.15.13-.3.2-.44.51-.71.97-.14,1.44.05,0,0,0,0,0,0,0,0,0,0,0,0,.63-2.1,1.92-3.8,3.3-5.45,1.27-1.51,2.23-3.81,3.82-4.39,1.64-.59,3.28,1.66,5.07,2.38.07.03.16.03.24.04,0,0,0,0,0,0,.2-.14.39-.29.59-.43.05-.03.1-.03.15-.05ZM68.94,33.77c1.07.04,2.12.35,3.18.41,1.18.07,1.66.51,1.21,1.77.23,1.65-.32,2.2-2.01,1.34-.94-.48-1.98-.81-3.01-1.07-1.1-.28-1.16-1.07-1.07-1.91.14-1.33,1.13-.56,1.7-.54ZM74.5,13.26c-.04.32-.03.4-.06.46-1.53,3.46-4.21,3.82-7.67,3.36-5.72-.74-11.47-1.63-17.33-.89,7.12.69,14.23,1.38,21.47,2.08-1.11,2.41-2.21,4.71-3.23,7.04-.43,1-1.07.72-1.83.56-12.73-2.65-25.47-5.27-38.21-7.9-7.1-1.47-14.21-2.94-21.28-4.71h68.14Z"/>
                                            <path className="t-cls-2"
                                                  d="M105.26,94.05c-5.74,13.65-13.68,19.17-27.23,19.16-5.13,0-9.01-2.15-11.63-6.4-1.56-2.53-2.83-5.23-5.6-7.6,3.86.73,6.24-.73,7.84-3.41.86-1.43,1.8-1.82,3.43-1.69,2.83.21,5.24-1.7,5.63-4.54.25-1.8,1.02-2.09,2.6-2.04,2.51.08,4.59-.86,5.63-3.31.53-1.25,1.47-1.65,2.65-1.97.9-.24,2.01-.26,2.52-1.18-.05-.03-.09-.07-.15-.1-.44-.35-.83-.76-1.28-1.11-.04-.03-.08-.06-.12-.09-2.45.98-4.51.33-6.29-1.88-.88-1.09-1.95-2.03-2.94-3.03-.41-.41-.92-.85-1.51-.36-.58.47-.29,1.07,0,1.57.97,1.66,2.32,3.02,3.67,4.37.82.83,1.77,1.68,1.26,3.01-.57,1.45-1.91,1.72-3.28,1.81-1.41.09-2.6-.37-3.52-1.49-1.05-1.29-2.11-2.56-2.9-4.03-.34-.63-.81-1.57-1.62-1.2-.96.44-.53,1.43-.22,2.19.61,1.47,1.63,2.68,2.53,3.98,1.42,2.06,1.14,5.48-.46,6.6-1.92,1.34-3.85.59-5.74-2.15-1.1-1.59-1.65-3.43-2.48-5.14-.28-.58-.56-1.39-1.38-1.17-1.03.28-.7,1.18-.53,1.88.51,2.12,1.47,4.05,2.61,5.89.81,1.31.92,2.62.16,4-.92,1.68-2.28,2.63-4.24,2.48-1.96-.16-4.02-1.98-4.48-4.15-.38-1.77-.7-3.58-.72-5.41-.03-3.16,1.21-4.61,4.38-4.8,1.46-.09,1.78-.59,1.73-1.97-.15-4.16,1.61-5.94,5.7-5.96.88,0,1.86.04,1.77-1.13-.08-1.19.57-2.32.19-3.5,0,0-.01,0-.02.02-.38-.07-.69-.18-.47-.67-.8.58-1.07,1.46-1.2,2.34-.11.75-.27,1.06-1.16,1.17-3.8.46-6.13,2.78-6.57,6.52-.11.95-.24,1.31-1.3,1.54-2.89.63-4.53,2.29-4.58,5.11-.11,5.76,1.03,11.24,5.28,15.53,1.2,1.21,2.06,2.52,2.76,4.04,2.3,5.01,6.1,8.4,11.66,8.94,9.76.94,18.42-1.57,24.94-9.39,3.53-4.24,5.94-9.1,7.53-14.38-.51.29-1.08.28-1.63.39-.41.91-.79,1.83-1.18,2.75Z"/>
                                            <path className="t-cls-2"
                                                  d="M90.93,80.96c.05.03.1.07.15.1.09-.16.16-.33.2-.55-.34-.36-.69-.72-1.03-1.08-.25.13-.48.22-.72.32.04.03.08.06.12.09.45.35.84.76,1.28,1.11Z"/>
                                            <path className="t-cls-2"
                                                  d="M71.18,70.16s.01,0,.02-.02c-.02-.05-.02-.1-.04-.15-.15-.17-.29-.34-.44-.51,0,0,0,0,0,0-.22.49.09.6.47.67Z"/>
                                            <path className="t-cls-2"
                                                  d="M106.63,90.86c-.07.15-.13.3-.2.44.55-.11,1.13-.1,1.63-.39,0,0,0,0,0,0-.47-.19-.93-.76-1.44-.05Z"/>
                                            <path className="t-cls-2"
                                                  d="M138.59,63.4c-.58-1.73-1.56-2.74-3.28-3.33-6.72-2.3-13.42-4.69-20.1-7.1-.7-.25-1.68-.16-2.07-1.19,2.69-2.1,5.14-4.45,7.17-7.19,4.88-6.57,7.44-13.76,5.85-22.04-.1.56.03,1.18-.47,1.62-.15-.12-.28-.26-.39-.39-.05.13-.09.27-.14.4-.24.89-.26,1.81-.22,2.72.21,5.43-1.68,10.23-4.49,14.73-1.86,2.98-4.4,5.37-6.87,7.82-.52.51-1.32.88-1.44,1.69.06.03.12.05.18.08.62.51.75,1.04.08,1.61-.09.04-.17.06-.26.09.75,1.36,2.29,1.46,3.54,1.91,6.02,2.15,12.04,4.31,18.09,6.38,1.79.61,2.96,1.63,3.58,3.46,3.44,10.13,7.05,20.21,10.45,30.36.3.89.72,1.79.54,2.97-8.28-4.73-16.29-9.44-24.33-14.08-.84-.49-1.62-1.35-2.76-.9-.07.42-.21.74-.74.49,0,0,0,0,0,0,8.9,5.23,17.8,10.47,26.72,15.68.86.5,1.75,1.54,2.88.53,1-.9.18-1.89-.11-2.75-3.78-11.19-7.64-22.35-11.4-33.54Z"/>
                                            <path className="t-cls-2"
                                                  d="M121.24,83c-.05.02-.1.03-.15.05-.2.14-.39.29-.59.43.52.26.67-.07.74-.49Z"/>
                                            <path className="t-cls-2"
                                                  d="M112.13,51.57c.54.43.35.77-.14,1.06.04.1.1.18.15.27.09-.03.17-.05.26-.09.67-.57.54-1.1-.08-1.61-.06-.03-.12-.05-.18-.08-.02.14-.03.28,0,.44Z"/>
                                            <path className="t-cls-2"
                                                  d="M99.26.81c-.13.27-.29.47-.46.63.04,0,.09,0,.13.02,2.01-.14,3.94.43,5.92.54,1.65.1,2.38,1.28,2.29,2.7-.1,1.59-1.52.73-2.36.84-.89.12-1.86-.14-2.71.14-3.1,1.02-5.27.34-6.21-3.02-.06-.21-.33-.35-.55-.48-.02,0-.04,0-.07,0-.06.03-.11.06-.17.09-.17.22-.34.44-.5.66-.1-.03-.19-.05-.28-.08-.26.9.14,1.73.49,2.55.49,1.15.2,1.83-1.01,2.27-2.25.81-4.36,1.94-6.33,3.31-.96.67-1.76.62-2.63-.22-.95-.92-1.88-1.94-3.3-2.12-.1.04-.21.08-.31.12-.09.13-.18.26-.27.39,0,0,0,0,0,0,.09,1.5,1.32,2.23,2.23,3.13.84.82.83,1.49.03,2.3-1.21,1.23-2.58,2.35-3.51,3.82-1.56,2.43-3.02,4.87-6.49,2.62-.45-.29-1.22-.29-1.53.35-.39.79.26,1.18.83,1.53.35.22.73.4,1.13.48,1.82.37,2.25,1.29,1.49,3.01-.64,1.43-1.12,2.94-1.44,4.47-.14.67-.54,1.4-.07,2.05.13.02.26.03.38.05.63.33.77.92.86,1.53.53-.35.48-1.09.59-1.67.75-4.05,2.43-7.7,4.63-11.16,8.6-13.54,25.12-17.55,38.36-9.47,3.32,2.02,5.22,4.66,5.93,8.37.21,1.09.2,2.31.95,3.23.17-.48.37-.94.86-1.23,0,0,0,0,0,0,0,0,0,0,0,0-.76-10.32-8.06-19.32-17.62-21.62-4.07-.97-8.2-1.18-12.35-.56.94.74,2.08.14,3.08.46ZM121.32,12.17c-3.73-2.49-7.23-4.34-11.18-5.11-.98-.19-.98-.89-1.08-1.66-.14-1.06-.42-2.11-.64-3.15,3.83-.48,11.4,5.11,12.9,9.92Z"/>
                                            <path className="t-cls-2"
                                                  d="M73.97,32.94c-.13-.02-.26-.04-.38-.05.06.09.14.17.23.25.46.42.3,1.02.41,1.53.26-.02.45-.1.6-.2-.09-.62-.24-1.2-.86-1.53Z"/>
                                            <path className="t-cls-2"
                                                  d="M125.29,23.77c.11.14.24.27.39.39.5-.44.37-1.06.47-1.62,0,0,0,0,0,0-.49.29-.69.75-.86,1.23Z"/>
                                            <path className="t-cls-2"
                                                  d="M154.55,47.42c-8.78-3.59-17.56-7.18-26.34-10.76-.11.3-.22.61-.34.91,8.78,3.58,17.55,7.15,26.33,10.73l.35-.87Z"/>
                                            <path className="t-cls-2"
                                                  d="M144.04,59.78l-.35.78c8.48,3.92,16.97,7.85,25.45,11.77.14-.29.29-.59.43-.88-8.51-3.89-17.02-7.78-25.53-11.67Z"/>
                                            <path className="t-cls-2"
                                                  d="M76.45,13.18c2.2-.58,3.3-2.35,4.47-4.05.06-.24.2-.42.41-.53.06,0,.12.02.18.03.81-.3,1.55-.73,2.24-1.27,2.03-1.56,4.21-2.89,6.54-3.97,1.31-.61,2.61-.94,4-.54.03-.1.06-.2.1-.29.22-.31.49-.46.85-.38,1.08-.56,2.59.14,3.55-.73-.96-.14-2.18.35-2.62-1.08h0s0,0,0,0c-7.24.67-12.66,4.73-17.78,9.4-1,.91-1.6,2.36-3.18,2.56,0,0,0,0,0,0,.5.18,1.13.22,1.23.87Z"/>
                                            <path className="t-cls-2"
                                                  d="M76.45,13.18c-.1-.64-.73-.69-1.23-.87.34.31.67.62,1.01.94.08-.02.15-.05.22-.07Z"/>
                                            <path className="t-cls-2"
                                                  d="M81.17,8.75l.06-.06s-.02.03-.03.05c.11-.03.21-.08.31-.12-.06,0-.11-.02-.18-.03-.21.12-.35.3-.41.53.09-.13.18-.26.27-.39,0,0-.02,0-.03.01Z"/>
                                            <path className="t-cls-2"
                                                  d="M81.17,8.75s.02,0,.03-.01c.01-.02.02-.03.03-.05l-.06.06Z"/>
                                            <path className="t-cls-2"
                                                  d="M95.08,2.25c.05-.04.11-.06.17-.09-.36-.08-.64.07-.85.38-.04.1-.07.2-.1.29.09.03.19.05.28.08.17-.22.34-.44.5-.66Z"/>
                                            <path className="t-cls-2"
                                                  d="M98.8,1.43c.17-.16.33-.36.46-.63-1-.32-2.14.28-3.08-.46h0c.44,1.43,1.65.94,2.62,1.08Z"/>
                                            <path className="t-cls-2"
                                                  d="M148.09,106.58c-.1,1.92-.54,3.77-1.1,5.59-.56,1.83-1.35,3.53-2.79,4.91-1.59,1.52-3.35.99-5.46.28,2.41,2.57,5.38,2.05,7.37-1.06,2.19-3.43,2.92-7.3,2.99-11.53-1.24.44-.98,1.2-1.01,1.81Z"/>
                                            <path className="t-cls-2"
                                                  d="M153.2,101.6c2.34,3.68,7.38,6.04,10.71,5.25,1.58-.37,2.97-1.1,2.58-2.99-5.1,5.02-8.85.15-13.29-2.26Z"/>
                                            <path className="t-cls-2"
                                                  d="M147.72,55.76c.1-.28.2-.56.31-.84-2.86-1.21-5.58-2.77-8.61-3.55-.09.21-.18.42-.26.63,2.86,1.25,5.72,2.51,8.57,3.76Z"/>
                                            <path className="t-cls-2"
                                                  d="M153.01,108.07c.4,2.3,1.32,4.38,2.63,6.29.2-.09.41-.17.61-.26l-2.62-6.29-.62.26Z"/>
                                            <path className="t-cls-2"
                                                  d="M80.4,91.96c-1.85.42-3.63,1.17-5.19,2.29-1.15.81-2.5,1.47-2.86,3.19,3.03-2.92,6.77-4.35,10.67-5.27,3.13-.74,5.36-2.43,7.01-5.04-.24-.06-.42-.22-.53-.47-2.23,3.11-5.47,4.48-9.09,5.31Z"/>
                                            <path className="t-cls-2"
                                                  d="M90.02,87.12c.04-.07.09-.13.13-.2-.16-.17-.32-.34-.49-.51-.06.08-.12.15-.18.24.12.25.29.4.53.47Z"/>
                                            <path className="t-cls-2"
                                                  d="M102.79,89.59c-.22-.29-.38-.61-.44-.97-1.06,1.08-2.06,2.24-2.82,4.01,1.79-.65,2.25-2.17,3.27-3.04Z"/>
                                            <path className="t-cls-2"
                                                  d="M103.16,89.32c-.18-.32-.37-.64-.55-.96-.09.09-.17.17-.26.26.06.36.22.68.44.97.12-.1.23-.19.37-.27Z"/>
                                            <path className="t-cls-2"
                                                  d="M103.89,83.21c1.16-.03,3.35-2.81,3.1-4.12-.35-1.77-1.61-2.6-3.52-2.75-1.56.41-2.99,1.26-3.44,3-.25.99,2.84,3.9,3.86,3.87ZM103.76,77.27c1.19.27,2.37.77,2.25,1.98-.13,1.26-.87,2.84-2.26,2.79-1.26-.04-2.5-1.42-2.54-2.67-.05-1.28,1.37-1.85,2.55-2.1Z"/>
                                            <path className="t-cls-2"
                                                  d="M98.38,89.61c-1.33-1.38-2.78-2.63-4.38-3.7-.18.21-.36.41-.55.62,1.46,1.25,2.93,2.49,4.39,3.74.18-.22.35-.44.53-.66Z"/>
                                            <path className="t-cls-2"
                                                  d="M95.99,91.31c-.28-1.5-1.34-2.12-3-2.79.74,1.68,1.91,2.19,3,2.79Z"/>
                                            <path className="t-cls-2"
                                                  d="M60.84,94.26c.23-2.61,2.1-3.32,4.32-3.65-3.14-1.05-5.19.73-4.32,3.65Z"/>
                                            <path className="t-cls-2"
                                                  d="M69.8,88.46c.49-2.95,2.14-3.31,4.69-2.21-1.65-1.73-2.69-1.97-3.92-1.22-1.07.65-1.32,1.47-.76,3.42Z"/>
                                            <path className="t-cls-2"
                                                  d="M78.47,82.64c.66.44.71-.38.92-.76.51-.89,1.64-.46,2.4-.99-1.49-.87-2.34-.78-3.14.25-.37.47-.81,1.08-.18,1.5Z"/>
                                            <path className="t-cls-3"
                                                  d="M122.24,29.7c.22-.05.46-.1.72-.16,1.58-.37.91-3.26-.66-2.89.04,1.05.02,2.07-.05,3.06Z"/>
                                            <path className="t-cls-3"
                                                  d="M90.27,14.36c-.96-1.52-3.13-.03-2.16,1.52.32.5.63,1.01.95,1.51.68-.57,1.38-1.1,2.11-1.59l-.9-1.43Z"/>
                                            <path className="t-cls-3"
                                                  d="M112.68,47.39s-.05.05-.08.07c-.25.21-.51.42-.76.64-.28.24-.52.45-.73.63.79.38,1.48-.44,1.56-1.34Z"/>
                                            <path className="t-cls-3"
                                                  d="M78.16,30.73c-1.6.11-1.61,3.11,0,3,.37-.03.74-.05,1.13-.08.17-1.04.41-2.05.73-3.05-.64.04-1.27.08-1.86.12Z"/>
                                        </g>
                                    </g>
                                </svg>
                                <span className={`text-xs text-[#7d7d7d] mt-1`}>Aucune transaction retrouvée</span>
                            </div>
                        </div> :
                        <Table>
                            <TableHeader>
                                <TableRow className={`text-xs border-[#f4f4f4]`}>
                                    <TableHead className={`text-[#afafaf] font-normal h-9 min-w-[8rem] max-w-[9rem]`}>ID
                                        Transactions</TableHead>
                                    <TableHead
                                        className={`text-[#afafaf] font-normal h-9 max-w-[7rem]`}>Descritpion</TableHead>
                                    <TableHead className={`text-[#afafaf] font-normal h-9`}>Montant</TableHead>
                                    <TableHead
                                        className={`text-[#afafaf] font-normal h-9 max-w-[7rem]`}>Date</TableHead>
                                    <TableHead className={`text-[#afafaf] font-normal h-9`}>Statut</TableHead>
                                    <TableHead
                                        className={`text-[#afafaf] font-normal h-9 text-center`}>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((transaction: ITransaction) => (
                                    <TableRow className={`border-[#f4f4f4]`} key={transaction.transactionId}>
                                        <TableCell className="">
                                            <TooltipProvider delayDuration={10}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span
                                                            className={`text-sm cursor-pointer leading-3 line-clamp-1`}>{transaction.transactionId}</span>
                                                    </TooltipTrigger>
                                                    <TooltipContent onClick={() => copyPaymentLink('ID Transaction', transaction.transactionId as string)}>
                                                        <p className={`text-xs`}>{transaction.transactionId}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                        <TableCell className="text-xs !py-3.5 text-ellipsis overflow-hidden">{transaction.description}</TableCell>
                                        <TableCell className="text-xs font-medium !py-3.5">
                                            <div
                                                className={`${transaction.transaction_type.name == TransactionsType.DEBIT ? 'text-[#ff0000]' : 'text-[#19b2a6]'}`}>{transaction.transaction_type.name == TransactionsType.DEBIT ? '-' : ''}{formatCFA(transaction.amount)}</div>
                                        </TableCell>
                                        <TableCell
                                            className="text-xs !py-3.5">{formatDate(transaction.createdAt, lang)}</TableCell>
                                        {/*<TableCell className="text-xs !py-3.5">*/}
                                        {/*    <div>*/}
                                        {/*        {transaction.type == "debit" ?*/}
                                        {/*            <div className="inline-flex space-x-1 items-center">*/}
                                        {/*                <span>Débit</span>*/}
                                        {/*                <MoveUpRight className="h-4" />*/}
                                        {/*            </div> : <div className="inline-flex space-x-1 items-center">*/}
                                        {/*                <span>Crédit</span>*/}
                                        {/*                <MoveDownLeft className="h-4" />*/}
                                        {/*            </div>*/}
                                        {/*        }*/}
                                        {/*    </div>*/}
                                        {/*</TableCell>*/}
                                        <TableCell className="text-xs !py-3.5">
                                            <div
                                                dangerouslySetInnerHTML={{__html: getStatusBadge(transaction.status)}}></div>
                                        </TableCell>
                                        <TableCell className="text-xs !py-3 text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger className={`focus:outline-none`} asChild>
                                                    <button
                                                        className={`rounded-full bg-[#f0f0f0] hover:bg-gray-200 duration-200 p-1`}>
                                                        <svg className={`h-3 w-auto`} viewBox="0 0 24 24"
                                                             fill="none" stroke="currentColor" strokeWidth="2"
                                                             strokeLinecap="round"
                                                             strokeLinejoin="round">
                                                            <circle cx="12" cy="12" r="1"/>
                                                            <circle cx="12" cy="5" r="1"/>
                                                            <circle cx="12" cy="19" r="1"/>
                                                        </svg>
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-48 rounded-xl z-[100] shadow-md"
                                                                     align={"end"}>
                                                    <DropdownMenuItem className={`text-xs cursor-pointer`}>
                                                        <ClipboardList className="mr-2 h-3.5 w-3.5"/>
                                                        <span className={`mt-[1.5px]`}>{`Détails de l'opération`}</span>
                                                    </DropdownMenuItem>
                                                    {/*<DropdownMenuSeparator/>*/}
                                                    {/*<DropdownMenuItem className={`text-xs cursor-pointer`}>*/}
                                                    {/*    <AlertTriangle className="mr-2 h-3.5 w-3.5"/>*/}
                                                    {/*    <span className={`mt-[1.5px]`}>Faire une réclamation</span>*/}
                                                    {/*</DropdownMenuItem>*/}
                                                    {/*<DropdownMenuSeparator/>*/}
                                                    {/*<DropdownMenuItem className={`text-xs cursor-pointer`}>*/}
                                                    {/*    <RotateCw className="mr-2 h-3.5 w-3.5"/>*/}
                                                    {/*    <span className={`mt-[1.5px]`}>{`Refaire l'opération`}</span>*/}
                                                    {/*</DropdownMenuItem>*/}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    }
                </div>)}
        </div>
    );
}