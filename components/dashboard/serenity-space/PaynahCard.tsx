"use client"

import {Locale} from "@/i18n.config";
import React, {useState, useEffect} from "react";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Send} from "lucide-react";
import Image from "next/image";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {formatCFA, hiddeBalance} from "@/lib/utils";
import {IUser} from "@/core/interfaces/user";
import {getMerchantBankAccounts} from "@/core/apis/bank-account";
import {Skeleton} from "@/components/ui/skeleton";
import {usePathname} from "next/navigation";

interface PaynahCardProps {
    lang: Locale,
    className?: string,
    onClick?: () => any,
    merchant: IUser,
}

export default function PaynahCard({ lang, className, onClick, merchant }: PaynahCardProps) {

    const [isLoading, setLoading] = useState(true);
    const [showConError, setShowConError] = useState(false);
    const [displayBalance, setDisplayBalance] = useState(true);
    const [displayAvailableBalance, setDisplayAvailableBalance] = useState(true);
    const [balance, setBalance] = useState(0);
    const [availableBalance, setAvailableBalance] = useState(0);
    const [isAccountActionLoading, setAccountActionLoading] = useState(false);

    const pathname = usePathname()

    function fetchMerchantBankAccounts() {
        setLoading(true)
        // @ts-ignore
        getMerchantBankAccounts(String(merchant.merchantsIds[0].id), String(merchant.accessToken))
        .then(data => {
            console.log('Paynah card', data);
            setBalance(data.total_balance);
            setAvailableBalance(data.total_skaleet_balance);
            setAccountActionLoading(true);
            setLoading(false)
        })
        .catch(err => {
            // setAccounts([]);
            setLoading(false)
        });
    }

    useEffect(() => {
        if (!isAccountActionLoading) {
            fetchMerchantBankAccounts()
        }
        console.log('1', pathname)
        console.log('1-2', balance)
    }, [pathname, isAccountActionLoading]);

    const showLoader = () => {
        return (
            <Skeleton className={`h-[20px] mt-[4px] w-[13rem] bg-[#afafaf] rounded-full`} />
        );
    }

    function toggleAllBalanceView() {
        setDisplayBalance(!displayBalance)
        setDisplayAvailableBalance(!displayAvailableBalance)
    }

    const formSchema = z.object({
        currency: z.string().min(1, {
            message: 'Le champ est requis'
        }),
    })

    const changeCurrency = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currency: "XOF",
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);

        setShowConError(true);
    }

    return (
        <div onClick={onClick} className={`card-design ${className}`}>
            <div
                className={`relative rounded-3xl flex flex-col justify-between ${className ? '' : 'aspect-video'} p-4`}>
                <div className={`bg-black w-full h-full rounded-3xl absolute z-[-1] top-0 right-0`}>
                </div>
                <Image className={`object-cover rounded-3xl z-[-1]`} src={`/${lang}/images/cover-test.png`} fill
                       alt={`cover-card`} priority={true} sizes={`100w`}/>
                <div className={`flex justify-between ${className ? 'mb-[2.4rem]' : 'mb-[3rem]'} `}>
                    <div className={`inline-flex`}>
                        <div>
                            <h2 className={`text-[#dbdbdb] text-sm uppercase mr-2`}>Compte Agregés</h2>
                            <h3 className={`text-xs text-[#afafaf] font-light`}>Tous les comptes</h3>
                        </div>
                        <div>
                            <Form {...changeCurrency}>
                                <form onSubmit={changeCurrency.handleSubmit(onSubmit)} className="space-y-5">
                                    <FormField
                                        control={changeCurrency.control}
                                        name="currency"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div>
                                                        <Select onValueChange={field.onChange} defaultValue={'XOF'}>
                                                            <SelectTrigger
                                                                className={`min-w-[2rem] h-[1.2rem] border-none pl-2 pr-1 rounded-full font-light text-[#afafaf] ${className ? 'text-[10px]' : 'text-xs'}`}
                                                                style={{
                                                                    backgroundColor: field.value ? '#2e2e2e' : '#2e2e2e',
                                                                }}>
                                                                <SelectValue placeholder="Choisir une devise"/>
                                                            </SelectTrigger>
                                                            <SelectContent className={`bg-[#f0f0f0]`}>
                                                                <SelectItem
                                                                    className={`font-light px-7 focus:bg-gray-100`}
                                                                    value={'XOF'}>
                                                                    F CFA
                                                                </SelectItem>
                                                                <SelectItem
                                                                    className={`font-light px-7 focus:bg-gray-100`}
                                                                    value={'Euro'}>
                                                                    Euro
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
                    </div>
                    <div>
                        <svg onClick={toggleAllBalanceView}
                             className={`w-3 h-3 mt-1 cursor-pointer ${displayBalance ? 'fill-white' : 'fill-[#adadad] fill-white'}`}
                             viewBox="0 0 21.656 27.07">
                            <path
                                d="M14.828,16.889a1.354,1.354,0,0,0-1.354,1.354V22.3a1.354,1.354,0,0,0,2.707,0V18.242A1.354,1.354,0,0,0,14.828,16.889ZM21.6,11.475V8.768a6.768,6.768,0,1,0-13.535,0v2.707A4.061,4.061,0,0,0,4,15.535V25.01A4.061,4.061,0,0,0,8.061,29.07H21.6a4.061,4.061,0,0,0,4.061-4.061V15.535A4.061,4.061,0,0,0,21.6,11.475ZM10.768,8.768a4.061,4.061,0,1,1,8.121,0v2.707H10.768ZM22.949,25.01A1.354,1.354,0,0,1,21.6,26.363H8.061A1.354,1.354,0,0,1,6.707,25.01V15.535a1.354,1.354,0,0,1,1.354-1.354H21.6a1.354,1.354,0,0,1,1.354,1.354Z"
                                transform="translate(-4 -2)"/>
                        </svg>
                    </div>
                </div>

                <div>
                    <div className={`flex flex-col space-y-2`}>
                        <div className={`flex flex-col`}>
                            <span
                                className={`${className ? 'text-[11px]' : 'text-xs'} font-light text-[#afafaf]`}>Solde</span>
                            {
                                isLoading ? showLoader() :
                                <span
                                    className={`font-semibold text-white ${className ? 'text-base' : 'text-base'}`}>{displayBalance ? formatCFA(balance) : hiddeBalance(formatCFA(balance))}</span>
                            }
                        </div>
                        <div className={`flex flex-col`}>
                            <span className={`${className ? 'text-[11px]' : 'text-xs'} font-light text-[#afafaf]`}>Solde disponible</span>
                            {
                                isLoading ? showLoader() :
                                <span
                                    className={`font-semibold text-white ${className ? 'text-base' : 'text-base'}`}>{displayAvailableBalance ? formatCFA(availableBalance) : hiddeBalance(formatCFA(availableBalance))}</span>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}