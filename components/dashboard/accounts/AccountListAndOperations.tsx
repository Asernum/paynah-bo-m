"use client"

import {Locale} from "@/i18n.config";
import React, {useState, useEffect} from "react";
import {ClipboardList, Pencil, Plus, PlusCircle, Search, Send, Trash2} from "lucide-react";
import {formatCFA} from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import OperationsTable from "@/components/dashboard/accounts/OperationsTable";
import PaynahCard from "@/components/dashboard/serenity-space/PaynahCard";
import {Button} from "@/components/ui/button";
import {Form} from "@/components/ui/form";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input";
import {IUser} from "@/core/interfaces/user";
import {IAccount} from "@/core/interfaces/account";
import {getMerchantBankAccounts} from "@/core/apis/bank-account";

interface AccountListAndOperationsProps {
    lang: Locale,
    searchItems: {
        per_page: number,
        page: number,
        search?: string,
        from?: string,
        sort?: string,
        to?: string,
        status?: string,
    },
    merchant: IUser
}

export default function AccountListAndOperations({lang, searchItems, merchant}: AccountListAndOperationsProps) {
    const [selectedAccount, setSelectedAccount] = useState('all');
    const [pSearch, setPSearch] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState<IAccount[]>([]);

    const formSchema = z.object({
        search: z.string()
    })

    const filterableForm = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            search: "",
        }
    });

    function fetchMerchantBankAccounts() {
        // @ts-ignore
        getMerchantBankAccounts(String(merchant.merchantsIds[0].id), String(merchant.accessToken))
        .then(data => {
            setAccounts(data.accounts);
            setLoading(false);
        })
        .catch(err => {
            setLoading(false);
            setAccounts([]);
        });
    }

    useEffect(() => {
        fetchMerchantBankAccounts()
    }, []);

    return (
        <div className={`flex flex-col h-full space-y-3`}>
            <div className={`account-list`}>
                <div className={`mb-4 mt-3`}>
                    <div className={`flex justify-between items-center`}>
                        <div className={`inline-flex items-center`}>
                            <h1 className={`text-xl font-medium mr-4`}>Compte ({accounts.length})</h1>
                            <Form {...filterableForm}>
                                <form action="#">
                                    <div className={`relative w-[100%] 2xl:w-auto`}>
                                        <Input value={pSearch} type={`text`} className={`font-normal pl-9 bg-white text-sm rounded-full h-[2.8rem] w-[18rem] 2xl:w-[20rem]`}
                                               placeholder="Recherche" onChange={(e) => setPSearch(e.target.value)}/>
                                        <Search className={`absolute h-4 w-4 top-3.5 left-3`} />
                                    </div>
                                </form>
                            </Form>
                        </div>
                        <div>
                            <Button className={`px-6 items-center text-xs`}>
                                <PlusCircle className={`h-4 w-4 mr-2`} />
                                <span>Ajouter un compte</span>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className={`flex p-1 space-x-2.5 2xl:min-h-[10rem] snap-x snap-mandatory overflow-x-auto`}>
                    {/*<PaynahCard onClick={() => setSelectedAccount('all')} lang={lang} className={`snap-end shrink-0 w-[40%] 2xl:w-[31%] cursor-pointer rounded-3xl ${selectedAccount == 'all' && 'outline outline-offset-2 outline-2 outline-[#3c3c3c]'}`} />*/}
                    <PaynahCard merchant={merchant} onClick={() => setSelectedAccount('all')} lang={lang} className={`snap-end shrink-0 w-[28.5%] 2xl:w-[23%] cursor-pointer rounded-3xl ${selectedAccount == 'all' && 'outline outline-offset-2 outline-2 outline-[#3c3c3c]'}`} />

                    {
                        accounts && accounts.map((account: IAccount) => (
                            <div key={account.id} onClick={() => setSelectedAccount('1')} className={`snap-end shrink-0 w-[28.5%] 2xl:w-[23%] bg-white flex flex-col justify-between cursor-pointer ${selectedAccount == '1' && 'outline outline-offset-2 outline-2 outline-[#3c3c3c]'} space-y-6 2xl:space-y-6 p-4 rounded-3xl`}>
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
                                            <DropdownMenuItem className={`text-xs cursor-pointer`}>
                                                <ClipboardList className="mr-2 h-3.5 w-3.5" />
                                                <span className={`mt-[1.5px]`}>Détails du compte</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
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
                                            </DropdownMenuItem>
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
                    {/* <div onClick={() => setSelectedAccount('2')} className={`snap-end shrink-0 w-[28.5%] 2xl:w-[23%] bg-white flex flex-col justify-between cursor-pointer ${selectedAccount == '2' && 'outline outline-offset-2 outline-2 outline-[#3c3c3c]'} space-y-6 2xl:space-y-6 p-4 rounded-3xl`}>
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
                                    <span className={`text-[12px] font-normal text-[#626262] -mb-0.5`}>Salaire corporate</span>
                                    <span className={`text-[11px] font-light text-[#afafaf]`}>PA48939CI</span>
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
                                    <DropdownMenuItem className={`text-xs cursor-pointer`}>
                                        <ClipboardList className="mr-2 h-3.5 w-3.5" />
                                        <span className={`mt-[1.5px]`}>Détails du compte</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
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
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className={`flex justify-between items-center space-x-3 border-t border-[#d0d0d0] pt-1`}>
                            <div className={`inline-flex flex-col`}>
                                <h3 className={`text-[10px] font-light text-[#afafaf] -mb-0.5`}>Solde actuel</h3>
                                <span className={`text-base font-semibold`}>{formatCFA(30000)}</span>
                            </div>
                            <div className={`inline-flex flex-col`}>
                                <h3 className={`text-[10px] font-light text-[#afafaf] -mb-0.5`}>Solde disponible</h3>
                                <span className={`text-base font-semibold`}>{formatCFA(3245544)}</span>
                            </div>
                        </div>
                    </div>
                    <div onClick={() => setSelectedAccount('3')} className={`snap-end shrink-0 w-[28.5%] 2xl:w-[23%] bg-white flex flex-col justify-between cursor-pointer ${selectedAccount == '3' && 'outline outline-offset-2 outline-2 outline-[#3c3c3c]'} space-y-6 2xl:space-y-6 p-4 rounded-3xl`}>
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
                                    <span className={`text-[12px] font-normal text-[#626262] -mb-0.5`}>Facture</span>
                                    <span className={`text-[11px] font-light text-[#afafaf]`}>PA48939CI</span>
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
                                    <DropdownMenuItem className={`text-xs cursor-pointer`}>
                                        <ClipboardList className="mr-2 h-3.5 w-3.5" />
                                        <span className={`mt-[1.5px]`}>Détails du compte</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
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
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className={`flex justify-between items-center space-x-3 border-t border-[#d0d0d0] pt-1`}>
                            <div className={`inline-flex flex-col`}>
                                <h3 className={`text-[10px] font-light text-[#afafaf] -mb-0.5`}>Solde actuel</h3>
                                <span className={`text-base font-semibold`}>{formatCFA(30000)}</span>
                            </div>
                            <div className={`inline-flex flex-col`}>
                                <h3 className={`text-[10px] font-light text-[#afafaf] -mb-0.5`}>Solde disponible</h3>
                                <span className={`text-base font-semibold`}>{formatCFA(3245544)}</span>
                            </div>
                        </div>
                    </div>
                    <div onClick={() => setSelectedAccount('4')} className={`snap-end shrink-0 w-[28.5%] 2xl:w-[23%] bg-white flex flex-col justify-between cursor-pointer ${selectedAccount == '4' && 'outline outline-offset-2 outline-2 outline-[#3c3c3c]'} space-y-6 2xl:space-y-6 p-4 rounded-3xl`}>
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
                                    <span className={`text-[12px] font-normal text-[#626262] -mb-0.5`}>Salaire pompiste</span>
                                    <span className={`text-[11px] font-light text-[#afafaf]`}>PA48934CI</span>
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
                                    <DropdownMenuItem className={`text-xs cursor-pointer`}>
                                        <ClipboardList className="mr-2 h-3.5 w-3.5" />
                                        <span className={`mt-[1.5px]`}>Détails du compte</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
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
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className={`flex justify-between items-center space-x-3 border-t border-[#d0d0d0] pt-1`}>
                            <div className={`inline-flex flex-col`}>
                                <h3 className={`text-[10px] font-light text-[#afafaf] -mb-0.5`}>Solde actuel</h3>
                                <span className={`text-base font-semibold`}>{formatCFA(30000)}</span>
                            </div>
                            <div className={`inline-flex flex-col`}>
                                <h3 className={`text-[10px] font-light text-[#afafaf] -mb-0.5`}>Solde disponible</h3>
                                <span className={`text-base font-semibold`}>{formatCFA(3245544)}</span>
                            </div>
                        </div>
                    </div> */}
                    <div className={`w-1 snap-end`}></div>
                </div>
            </div>
            <div className={`h-full`}>
                <div className={`bg-white flex-grow rounded-3xl h-full`}>
                    <OperationsTable searchItems={searchItems} lang={lang} selectedAccount={selectedAccount} merchant={merchant}/>
                </div>
            </div>
        </div>
    );
}