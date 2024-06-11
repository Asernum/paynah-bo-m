"use client"

import {Locale} from "@/i18n.config";
import React, {useState, useEffect} from "react";
import { AlertTriangle, ChevronRight, ClipboardList, Plus, RotateCw, Send } from "lucide-react";
import {formatCFA} from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Routes from "@/components/Routes";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { IUser } from '@/core/interfaces/user';
import {IBeneficiary} from "@/core/interfaces/beneficiary";
import { getMerchantBeneficiaries } from "@/core/apis/beneficiary";
import {Skeleton} from "@/components/ui/skeleton";
import { IAccount } from "@/core/interfaces/account";
import PaymentLinkActions from '@/components/dashboard/payment-link/modals/PaymentLinkActions';
interface AccountsProps {
    lang: Locale,
    merchant: IUser,
    isLoading: boolean,
    accounts: IAccount[],
}

export const RANDOM_AVATAR_COLORS_CONFIG = [
    {bg: '#ffc5ae', text: '#ff723b'},
    {bg: '#aedaff', text: '#31a1ff'},
    {bg: '#e0aeff', text: '#bc51ff'},
    {bg: '#aeffba', text: '#02b71a'},
    {bg: '#ffadae', text: '#e03c3e'},
]

export default function Accounts({lang, merchant, isLoading, accounts}: AccountsProps) {

    // const [isLoading, setLoading] = useState(false);
    // const [beneficiaries, setBeneficiaries] = useState([]);

    const transformBeneficiaryFullNameToBeneficiaryAvatar = (beneficiaryFullName: string) => {
        const beneficiaryFullNameSplit = beneficiaryFullName.trim().length > 0 ? beneficiaryFullName.split(' ') : [];
        const beneficiaryFullNameAvatar = beneficiaryFullNameSplit.length > 0 ? ( beneficiaryFullNameSplit.length >= 2 ? `${beneficiaryFullNameSplit[0][0]}${beneficiaryFullNameSplit[1][0]}` : `${beneficiaryFullNameSplit[0][0]}`) : '';
        return beneficiaryFullNameAvatar;
    }

    function fetchMerchantBeneficiaries() {
        // @ts-ignore
        // getMerchantBeneficiaries(String(merchant.merchantsIds[0].id), String(merchant.accessToken))
        // .then(data => {
        //     setBeneficiaries(data);
        //     setLoading(false);
        // })
        // .catch(err => {
        //     setLoading(false);
        //     setBeneficiaries([]);
        // });
    }

    const showLoader = () => {
        return (
            <div className={`py-2`}>
                <div className={`flex justify-between items-center space-x-1`}>
                    <div className={`inline-flex space-x-2 items-center`}>
                        <Skeleton className={`rounded-full h-10 w-10 bg-gray-300`}/>
                        <div className={`inline-flex flex-col`}>
                            <Skeleton className={`h-[8px] my-1 w-[5rem] bg-gray-300 rounded-full`}></Skeleton>
                            <Skeleton className={`h-[8px] my-1 w-[5rem] bg-gray-300 rounded-full`}></Skeleton>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    useEffect(() => {
        // fetchMerchantBeneficiaries();
    }, []);

    return (
        <div className={`mt-8`}>
            <div className={`flex items-center justify-between pb-1.5 border-dashed`}>
                <h2 className={`font-medium text-base 2xl:text-lg`}>Mes Comptes</h2>
                <div>
                    <Link className={`inline-flex text-xs text-[#909090] hover:underline duration-200 mb-1`} href={Routes.dashboard.accounts.replace('{lang}', lang)}>
                        <span>Voir tout</span>
                        <ChevronRight className={`h-4 w-auto`} />
                    </Link>
                </div>
            </div>
            <div className={`mt-4 divide-y divide-[#f4f4f4] p-1 h-[37rem] overflow-y-auto`}>
                {
                    accounts && accounts.map((account: IAccount, index: number) => (
                       <div key={index} onClick={() => {}} className={`snap-end shrink-0 w-[90%] 2xl:w-[100%] mb-4 bg-white flex flex-col justify-between cursor-pointer ${'all' == 'all' && 'outline outline-offset-2 outline-2 outline-[#3c3c3c]'} space-y-6 2xl:space-y-6 p-4 rounded-3xl`}>
                            <div className={`flex justify-between items-start`}>
                        <div>
                            <div className={`inline-flex flex-col`}>
                                <div className={`mb-1 rounded-xl p-2 bg-[#f0f0f0] w-[2.7rem] h-[2.7rem] inline-flex justify-center items-center`}>
                                    <svg className={`h-[1.1rem] fill-[#767676] w-auto`} viewBox="0 0 19.474 17.751">
                                        <defs>
                                            <clipPath id="clipPath1">
                                                <rect width="19.474" height="17.751"/>
                                            </clipPath>
                                        </defs>
                                        <g transform="translate(0)">
                                            <g transform="translate(0)" clipPath="url(#clipPath1)">
                                                <path d="M18.422,131.245v.295c0,.477,0,.954,0,1.431a2.758,2.758,0,0,1-2.792,2.786q-6.191,0-12.381,0a4.087,4.087,0,0,1-1.4-.157A2.762,2.762,0,0,1,0,132.973c0-2.774,0-5.548,0-8.323a3.5,3.5,0,0,1,.2-1.361,2.764,2.764,0,0,1,2.566-1.728q6.432,0,12.863,0a2.743,2.743,0,0,1,2.7,2.075,2.966,2.966,0,0,1,.085.663c.012.555,0,1.109,0,1.664,0,.028,0,.057-.009.1H15.7a2.586,2.586,0,0,0-.235,5.165c.924.031,1.849.01,2.774.012h.184" transform="translate(0 -118.007)"/>
                                                <path d="M466.573,292.279c.486,0,.973,0,1.459,0a.906.906,0,0,1,.96.96q0,1.145,0,2.291a.9.9,0,0,1-.949.958c-.978,0-1.955.008-2.933,0a2.1,2.1,0,0,1-.055-4.2c.505-.018,1.012,0,1.517,0v0m-1.438,2.844v-.01c.078,0,.156,0,.233,0a.729.729,0,0,0-.034-1.458c-.141,0-.282,0-.422,0a.726.726,0,0,0-.124,1.435,3.1,3.1,0,0,0,.347.032" transform="translate(-449.52 -283.733)"/>
                                                <path d="M232.826,2.991q2.429-1.4,4.859-2.805a1.238,1.238,0,0,1,1.748.471c.1.163.189.328.295.512l-6.9,1.848,0-.027" transform="translate(-226.02 0)"/>
                                                <path d="M301.2,56.416h-6.9l-.006-.017c.036-.013.072-.029.109-.039q2.519-.675,5.039-1.349a1.292,1.292,0,0,1,1.639.937c.041.149.079.3.123.468" transform="translate(-285.691 -53.352)"/>
                                            </g>
                                        </g>
                                    </svg>
                                </div>
                                <span className={`text-[12px] font-normal text-[#626262] -mb-0.5`}>{account.name ? account.name : (account.isMain ? 'Compte Principal' : 'Compte')}</span>
                                <span className={`text-[11px] font-light text-[#afafaf]`}>{account.coreBankId}</span>
                            </div>
                        </div>
                        <DropdownMenu>
                                    <DropdownMenuTrigger className={`focus:outline-none`} asChild>
                                        <button className={`text-[#626262]`}>
                                            <svg className={`h-4 w-auto`} viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="1"/>
                                                <circle cx="12" cy="5" r="1"/>
                                                <circle cx="12" cy="19" r="1"/>
                                            </svg>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 rounded-xl shadow-md" align={"end"}>
                                        <DropdownMenuItem className={`text-xs cursor-pointer`} onClick={() => {}}>
                                            <ClipboardList className="mr-2 h-3.5 w-3.5" />
                                            <span className={`mt-[1.5px]`}>Détails du compte</span>
                                        </DropdownMenuItem>
                                        {/* <DropdownMenuSeparator />
                                        <DropdownMenuItem className={`text-xs cursor-pointer`}>
                                            <Pencil className="mr-2 h-3.5 w-3.5"  />
                                            <span className={`mt-[1.5px]`}>Modifier le nom du compte</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className={`text-xs cursor-pointer`}>
                                            <svg className="mr-2 h-3.5 w-3.5" viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                strokeLinejoin="round">
                                                <line x1="4" x2="4" y1="21" y2="14"/>
                                                <line x1="4" x2="4" y1="10" y2="3"/>
                                                <line x1="12" x2="12" y1="21" y2="12"/>
                                                <line x1="12" x2="12" y1="8" y2="3"/>
                                                <line x1="20" x2="20" y1="21" y2="16"/>
                                                <line x1="20" x2="20" y1="12" y2="3"/>
                                                <line x1="2" x2="6" y1="14" y2="14"/>
                                                <line x1="10" x2="14" y1="8" y2="8"/>
                                                <line x1="18" x2="22" y1="16" y2="16"/>
                                            </svg>
                                            <span className={`mt-[1.5px]`}>Règle du compte</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className={`text-xs cursor-pointer`}>
                                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                                            <span className={`mt-[1.5px]`}>Supprimer le compte</span>
                                        </DropdownMenuItem> */}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className={`flex justify-between items-center space-x-3 border-t border-[#d0d0d0] pt-1`}>
                        <div className={`inline-flex flex-col`}>
                            <h3 className={`text-[10px] font-light text-[#afafaf] -mb-0.5`}>Solde actuel</h3>
                            <span className={`text-base font-semibold`}>{formatCFA(account.balance)}</span>
                        </div>
                        <div className={`inline-flex flex-col`}>
                            <h3 className={`text-[10px] font-light text-[#afafaf] -mb-0.5`}>Solde disponible</h3>
                            <span className={`text-base font-semibold`}>{formatCFA(account.skaleet_balance)}</span>
                        </div>
                            </div>
                        </div> 
                    ))
                }
            </div>
        </div>
    );
}