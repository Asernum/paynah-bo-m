"use client"

import {Locale} from "@/i18n.config";
import React, {useState, useEffect} from "react";
import {ClipboardList, Pencil, Plus, Send, Trash2} from "lucide-react";
import {formatCFA} from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import SuppliesTable from "@/components/dashboard/supply/SuppliesTable";
import AccountsAction from "@/components/dashboard/serenity-space/modals/AccountsAction";
import { IUser } from "@/core/interfaces/user";
import { getMerchantBankAccounts } from "@/core/apis/bank-account";
import {IAccount} from "@/core/interfaces/account";
import {Skeleton} from "@/components/ui/skeleton";

interface SendModeListAndSuppliesProps {
    lang: Locale,
    searchItems: {
        per_page: number,
        page: number,
        search?: string,
        from?: string,
        sort?: string,
        to?: string,
        status?: string
    },
    merchant: IUser
}

export default function SendModeListAndSupplies({lang, searchItems, merchant}: SendModeListAndSuppliesProps) {
    const [selectedAccount, setSelectedAccount] = useState('all');
    const [balance, setBalance] = useState(0);
    const [availableBalance, setAvailableBalance] = useState(0);
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [isAccountActionLoading, setAccountActionLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [account, setAccount] = useState<IAccount>();
    const [mode, setMode] = useState('add');

    function fetchMerchantBankAccounts() {
        // @ts-ignore
        setLoading(true);
        getMerchantBankAccounts(String(merchant.merchantsIds[0].id), String(merchant.accessToken))
        .then(data => {
            setAccounts(data.accounts);
            setBalance(data.total_balance);
            setAvailableBalance(data.total_skaleet_balance);
            setLoading(false);
        })
        .catch(err => {
            setLoading(false);
            setAccounts([]);
        });
    }

    const openAccountDetailModal = (account: IAccount) => {
        setAccount(account);
        setMode("detail");
        setOpen(true);
    };

    const showLoader = () => {
        return (
            <Skeleton
                className={`snap-end shrink-0 w-[40%] 2xl:w-[31%] cursor-pointer bg-white flex flex-col justify-between space-y-8 2xl:space-y-8 p-4 rounded-3xl`}>
                <div className={`flex justify-between items-start`}>
                    <div>
                        <div className={`flex flex-col`}>
                            <Skeleton
                                className={`mb-1 rounded-xl p-2 bg-gray-300 w-[2.7rem] h-[2.7rem] inline-flex justify-center items-center`}>
                                <div className={`h-[1.3rem] w-auto`}>
                                </div>
                            </Skeleton>
                            <Skeleton
                                className={`font-light h-[13px] my-1 bg-gray-300 w-[7rem] rounded-full`}></Skeleton>
                        </div>
                    </div>
                </div>
                <div className={`inline-flex flex-col`}>
                    <Skeleton className={`h-[8px] my-1 w-[5rem] bg-gray-300 rounded-full`}></Skeleton>
                    <Skeleton className={`text-base h-[16px] mb-1 w-[90%] bg-gray-300 font-semibold rounded-full`}></Skeleton>
                </div>
            </Skeleton>
        );
    }

    useEffect(() => {
        fetchMerchantBankAccounts()
    }, []);

    return (
        <div className={`flex flex-col h-full space-y-3`}>
            <div className={`account-list`}>
                <div className={`flex p-1 space-x-7 2xl:min-h-[10rem] snap-x snap-mandatory`}>
                    <AccountsAction lang={lang} merchant={merchant} mode={mode} isAccountActionLoading={isAccountActionLoading} setAccountActionLoading={setAccountActionLoading} open={open} setOpen={setOpen} account={account}>
                        {''}
                    </AccountsAction>
                    
                    <div onClick={() => setSelectedAccount('all')} className={`snap-end shrink-0 w-[29%] 2xl:w-[23%] h-[10rem] bg-white flex flex-col cursor-pointer ${selectedAccount == 'all' && 'outline outline-offset-2 outline-2 outline-[#3c3c3c]'} p-3 rounded-3xl`}>
                        <div className="w-[100%]">
                            <div className={`inline-flex flex-col`}>
                                <div className={`mb-1 rounded-xl p-1 bg-[#f0f0f0] w-[2.7rem] h-[2.7rem] inline-flex justify-center items-center`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25.605" viewBox="0 0 24 25.605">
                                        <path id="Tracé_672" data-name="Tracé 672" d="M12.466,0c.551.341,1.134.64,1.648,1.028,3.027,2.287,6.033,4.6,9.058,6.891A1.841,1.841,0,0,1,24,9.6c-.01.156,0,.312,0,.468a1.7,1.7,0,0,1-1.6,1.972v2c0,1.905,0,3.811,0,5.716a.514.514,0,0,0,.314.539,2.327,2.327,0,0,1,1.286,2.131c.011.484.006.968,0,1.452a1.6,1.6,0,0,1-1.734,1.714q-7.543,0-15.086,0c-1.718,0-3.437-.034-5.153.013A1.873,1.873,0,0,1,0,24.369V21.932a2.639,2.639,0,0,1,1.243-1.616.561.561,0,0,0,.361-.6c-.013-2.429-.007-4.859-.008-7.289,0-.136-.012-.272-.02-.417A1.778,1.778,0,0,1,0,10.779V9A6.028,6.028,0,0,1,.889,7.9Q5.364,4.432,9.884,1.029C10.4.641,10.979.341,11.528,0Zm9.866,10.382a1.268,1.268,0,0,0-.6-1.565C18.7,6.546,15.694,4.229,12.679,1.93c-.6-.455-.769-.452-1.359,0C8.269,4.257,5.232,6.6,2.154,8.9a1.313,1.313,0,0,0-.516,1.484ZM1.6,23.958H22.4c0-.409,0-.782,0-1.156,0-1-.216-1.214-1.206-1.214H2.789a3.6,3.6,0,0,0-.421.01.783.783,0,0,0-.764.8c-.02.512,0,1.025,0,1.564m4.817-4h3.15V12.024H6.416Zm8.018-.006h3.139V12.016H14.434Zm-1.656-7.933H11.222v7.936h1.556ZM3.22,19.954H4.767V12.02H3.22Zm16.009,0h1.544V12.018H19.229Z"/>
                                    </svg>
                                </div>
                                <span className={`font-medium text-base 2xl:text-lg`}>Virement bancaire</span>
                            </div>
                        </div>
                        <div className="flex flex-row h-[8rem]">
                            <div className="flex-column w-3/4">
                                <div className="flex flex-row space-x-1">
                                    <div className="pt-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15.214" height="15.214" viewBox="0 0 15.214 15.214">
                                            <path id="_5e94a90cc30706fa992f8ced1c38048b" data-name="5e94a90cc30706fa992f8ced1c38048b" d="M7.874.264a7.607,7.607,0,1,0,7.6,7.6,7.62,7.62,0,0,0-7.6-7.6Zm0,1.383A6.226,6.226,0,1,1,1.646,7.869,6.21,6.21,0,0,1,7.874,1.647ZM7.863,3.02a.691.691,0,0,0-.684.705V7.869a.691.691,0,0,0,.205.489l2.765,2.767a.691.691,0,1,0,.975-.98L8.562,7.583V3.725a.691.691,0,0,0-.7-.705Z" transform="translate(-0.264 -0.264)" fill-rule="evenodd"/>
                                        </svg>
                                    </div>
                                    <div className="inline-flex flex-col text-[11px] font-light text-black leading-tight py-1">
                                        <span>Disponibilité des fonds :</span><br></br>
                                        <span>06 heures après la réception du virement bancaire</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-column w-1/4 justify-end items-end">
                                <svg id="Composant_299_47" data-name="Composant 299 – 47" xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
                                <g id="Rectangle_628" data-name="Rectangle 628" fill="#fff" stroke="#707070" stroke-width="1">
                                    <rect width="38" height="38" rx="19" stroke="none"/>
                                    <rect x="0.5" y="0.5" width="37" height="37" rx="18.5" fill="none"/>
                                </g>
                                <path id="_4237f00324bcddeaf63d8a30593b540d" data-name="4237f00324bcddeaf63d8a30593b540d" d="M11.9,5.436a.635.635,0,0,0,0,.9l3.995,3.995H3.885a.635.635,0,1,0,0,1.27h12.01L11.9,15.593a.635.635,0,1,0,.9.9l5.078-5.078a.635.635,0,0,0,0-.9L12.8,5.436A.635.635,0,0,0,11.9,5.436Z" transform="translate(8.25 8.25)" stroke="#000" stroke-width="0.5" fill-rule="evenodd"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div onClick={() => setSelectedAccount('all')} className={`snap-end shrink-0 w-[29%] 2xl:w-[23%] h-[10rem] bg-white flex flex-col cursor-pointer ${selectedAccount == 'all' && 'outline outline-offset-2 outline-2 outline-[#3c3c3c]'} p-3 rounded-3xl`}>
                        <div className="w-[100%]">
                            <div className={`inline-flex flex-col `}>
                                <div className={`mb-1 rounded-xl p-1 bg-[#f0f0f0] w-[2.7rem] h-[2.7rem] inline-flex justify-center items-center`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="19.013" height="28.114" viewBox="0 0 19.013 28.114">
                                        <g id="Groupe_528" data-name="Groupe 528" transform="translate(-19.548 -353)">
                                            <g id="a9b0893de2b4579e372f2272be2e9456" transform="translate(19.548 353)">
                                                <path id="Tracé_666" data-name="Tracé 666" d="M27.514,1.135H15.047a3.276,3.276,0,0,0-3.273,3.273V25.976a3.276,3.276,0,0,0,3.273,3.272H27.514a3.276,3.276,0,0,0,3.273-3.272V4.408a3.276,3.276,0,0,0-3.273-3.273Zm2.417,24.841a2.42,2.42,0,0,1-2.417,2.417H15.047a2.42,2.42,0,0,1-2.417-2.417V4.408A2.42,2.42,0,0,1,15.047,1.99H27.514a2.42,2.42,0,0,1,2.417,2.417Z" transform="translate(-11.774 -1.135)"/>
                                                <path id="Tracé_667" data-name="Tracé 667" d="M29.317,7.188H18.966a2.2,2.2,0,0,0-2.194,2.194V23.01a2.2,2.2,0,0,0,2.194,2.19H29.317a2.194,2.194,0,0,0,2.19-2.19V9.383A2.2,2.2,0,0,0,29.317,7.188Zm-5.141,13.7h-.035a4.673,4.673,0,1,1,.035,0Zm1.633,7.226a1.668,1.668,0,1,1-1.672-1.664A1.672,1.672,0,0,1,25.81,28.112ZM22.88,6.23H25.4a.428.428,0,1,0,0-.855H22.88a.428.428,0,1,0,0,.855Z" transform="translate(-14.634 -3.561)"/>
                                            </g>
                                            <path id="Send" d="M4.723,1.269a.344.344,0,0,1,.439.439L4.026,4.949a.344.344,0,0,1-.639.026L2.8,3.662a.07.07,0,0,0-.035-.036L1.454,3.043A.344.344,0,0,1,1.48,2.4Zm.327.306a.137.137,0,0,0-.194-.194L2.844,3.392a.137.137,0,1,0,.194.194Z" transform="translate(25.783 362.363)" stroke="#000" stroke-width="1" fill-rule="evenodd"/>
                                        </g>
                                    </svg>
                                </div>
                                <span className={`font-medium text-base 2xl:text-lg`}>Mobile Money</span>
                            </div>
                        </div>
                        <div className="flex flex-row h-[8rem]">
                            <div className="flex-column w-3/4">
                                <div className="flex flex-row space-x-1">
                                    <div className="pt-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15.214" height="15.214" viewBox="0 0 15.214 15.214">
                                            <path id="_5e94a90cc30706fa992f8ced1c38048b" data-name="5e94a90cc30706fa992f8ced1c38048b" d="M7.874.264a7.607,7.607,0,1,0,7.6,7.6,7.62,7.62,0,0,0-7.6-7.6Zm0,1.383A6.226,6.226,0,1,1,1.646,7.869,6.21,6.21,0,0,1,7.874,1.647ZM7.863,3.02a.691.691,0,0,0-.684.705V7.869a.691.691,0,0,0,.205.489l2.765,2.767a.691.691,0,1,0,.975-.98L8.562,7.583V3.725a.691.691,0,0,0-.7-.705Z" transform="translate(-0.264 -0.264)" fill-rule="evenodd"/>
                                        </svg>
                                    </div>
                                    <div className="inline-flex flex-col text-[11px] font-light text-black leading-tight py-1">
                                        <span>Disponibilité des fonds :</span><br></br>
                                        <span>Immédiate</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-column w-1/4 justify-end items-end">
                                <svg id="Composant_299_47" data-name="Composant 299 – 47" xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
                                <g id="Rectangle_628" data-name="Rectangle 628" fill="#fff" stroke="#707070" stroke-width="1">
                                    <rect width="38" height="38" rx="19" stroke="none"/>
                                    <rect x="0.5" y="0.5" width="37" height="37" rx="18.5" fill="none"/>
                                </g>
                                <path id="_4237f00324bcddeaf63d8a30593b540d" data-name="4237f00324bcddeaf63d8a30593b540d" d="M11.9,5.436a.635.635,0,0,0,0,.9l3.995,3.995H3.885a.635.635,0,1,0,0,1.27h12.01L11.9,15.593a.635.635,0,1,0,.9.9l5.078-5.078a.635.635,0,0,0,0-.9L12.8,5.436A.635.635,0,0,0,11.9,5.436Z" transform="translate(8.25 8.25)" stroke="#000" stroke-width="0.5" fill-rule="evenodd"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div onClick={() => setSelectedAccount('all')} className={`snap-end shrink-0 w-[29%] 2xl:w-[23%] h-[10rem] bg-white flex flex-col cursor-pointer ${selectedAccount == 'all' && 'outline outline-offset-2 outline-2 outline-[#3c3c3c]'} p-3 rounded-3xl`}>
                        <div className=" w-[100%]">
                            <div className={`inline-flex flex-col `}>
                                <div className={`mb-1 rounded-xl p-1 bg-[#f0f0f0] w-[2.7rem] h-[2.7rem] inline-flex justify-center items-center`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="28" height="28" viewBox="0 0 28 28">
                                    <defs>
                                        <clipPath id="clip-path">
                                        <rect id="Rectangle_560" data-name="Rectangle 560" width="28" height="28" transform="translate(-0.059 -0.059)" fill="none"/>
                                        </clipPath>
                                    </defs>
                                    <g id="Groupe_530" data-name="Groupe 530" transform="translate(0.223 0.223)">
                                        <g id="Groupe_529" data-name="Groupe 529" transform="translate(-0.164 -0.164)" clip-path="url(#clip-path)">
                                            <path id="Tracé_668" data-name="Tracé 668" d="M7.207,0c.319.2.656.37.953.595,1.75,1.322,3.488,2.66,5.237,3.984a1.064,1.064,0,0,1,.476.97c-.006.09,0,.181,0,.271a.985.985,0,0,1-.923,1.14V8.115c0,1.1,0,2.2,0,3.3a.3.3,0,0,0,.181.312,1.346,1.346,0,0,1,.743,1.232c.006.28,0,.56,0,.84a.924.924,0,0,1-1,.991q-4.361,0-8.722,0c-.993,0-1.987-.02-2.979.008A1.083,1.083,0,0,1,0,14.089V12.68a1.526,1.526,0,0,1,.718-.934A.324.324,0,0,0,.927,11.4c-.008-1.4,0-2.809,0-4.214,0-.079-.007-.157-.011-.241A1.028,1.028,0,0,1,0,6.232V5.2a3.485,3.485,0,0,1,.514-.637q2.587-2,5.2-3.97c.3-.224.633-.4.951-.595Zm5.7,6a.733.733,0,0,0-.347-.9C10.809,3.785,9.073,2.445,7.33,1.116c-.345-.263-.445-.261-.786,0-1.764,1.346-3.52,2.7-5.3,4.029A.759.759,0,0,0,.947,6ZM.925,13.851H12.949c0-.237,0-.452,0-.668,0-.576-.125-.7-.7-.7H1.612a2.081,2.081,0,0,0-.243.006.453.453,0,0,0-.442.46c-.012.3,0,.593,0,.9m2.785-2.314H5.531V6.951H3.709Zm4.636,0H10.16V6.947H8.345ZM7.387,6.948h-.9v4.588h.9ZM1.862,11.536h.894V6.949H1.862Zm9.256,0h.893V6.948h-.893Z" transform="translate(0.143 0.143)"/>
                                            <path id="Tracé_669" data-name="Tracé 669" d="M256.5,253.694a1.051,1.051,0,0,1-.707-1.17,4.208,4.208,0,0,0,0-.514,1.425,1.425,0,0,1,.8-1.419.248.248,0,0,0,.117-.178c.006-1.516.005-3.032.005-4.543-.751-.224-.895-.456-.932-1.221a1.4,1.4,0,0,1,.645-1.3c1.807-1.35,3.593-2.73,5.386-4.1a1.355,1.355,0,0,1,1.81-.014c1.866,1.422,3.734,2.843,5.59,4.278a2.849,2.849,0,0,1,.449.59v1.03a1.042,1.042,0,0,1-.923.712c0,1.538,0,3.05,0,4.562a.217.217,0,0,0,.088.168,1.6,1.6,0,0,1,.831,1.007v1.409a1.212,1.212,0,0,1-.7.7Zm12.257-8.8c-.068-.261.1-.519-.181-.733-1.828-1.381-3.646-2.776-5.468-4.166-.326-.248-.432-.245-.765.009-1.757,1.341-3.5,2.694-5.278,4.013a.768.768,0,0,0-.324.876Zm-.013,7.866c0-.24,0-.454,0-.669,0-.595-.121-.718-.709-.718H257.424a.686.686,0,0,0-.319.024c-.137.081-.331.2-.349.323a7.49,7.49,0,0,0-.017,1.039Zm-9.238-2.33h1.819v-4.586h-1.819Zm4.626,0h1.823v-4.578h-1.823Zm-1.847.009h.889v-4.59h-.889Zm-4.627-.007h.893v-4.586h-.893Zm9.256,0h.891v-4.586h-.891Z" transform="translate(-241.781 -225.807)"/>
                                            <path id="Tracé_670" data-name="Tracé 670" d="M31.841,321.735a15.176,15.176,0,0,1-1.622-.174,5.367,5.367,0,0,1-4.257-4.291,4.269,4.269,0,0,1-.114-.583.858.858,0,0,1,.524-.941.838.838,0,0,1,1.021.264,5.336,5.336,0,0,0,1.995,1.539,5.113,5.113,0,0,0,2.453.419c0-.275,0-.534,0-.794a.949.949,0,0,1,.609-.96,1,1,0,0,1,1.138.267q1.3,1.357,2.6,2.723a.856.856,0,0,1,.009,1.26q-1.3,1.38-2.616,2.742a.973.973,0,0,1-1.139.25.931.931,0,0,1-.6-.94q0-.391,0-.782m-5.01-4.859c0-.02-.008.008,0,.032.033.14.063.282.106.419a4.369,4.369,0,0,0,3.367,3.308,12.371,12.371,0,0,0,1.912.128c.383.019.544.165.551.546.007.361,0,.722,0,1.083a2.7,2.7,0,0,0,.041.282l2.71-2.84-2.663-2.78-.078.045c-.006.085-.016.171-.016.256,0,.343.01.686,0,1.029a.467.467,0,0,1-.518.523c-.271.008-.542,0-.812,0A5.761,5.761,0,0,1,28.278,318c-.517-.334-.977-.757-1.447-1.127" transform="translate(-24.297 -298.423)"/>
                                            <path id="Tracé_671" data-name="Tracé 671" d="M294.727,52.882a15.253,15.253,0,0,1,1.618.171,5.328,5.328,0,0,1,4.2,4.08,6.477,6.477,0,0,1,.162.711.885.885,0,0,1-.487,1.015.867.867,0,0,1-1.084-.29,5.112,5.112,0,0,0-3.33-1.887c-.345-.048-.7-.043-1.083-.064,0,.292,0,.542,0,.792a.975.975,0,0,1-.606.991,1.029,1.029,0,0,1-1.158-.285q-1.284-1.339-2.56-2.684a.873.873,0,0,1,0-1.319q1.276-1.346,2.56-2.684a1.012,1.012,0,0,1,1.159-.275.954.954,0,0,1,.6.967c0,.26,0,.519,0,.76m-1.021,4.678.1-.048c0-.087,0-.174,0-.262,0-.316,0-.632,0-.947,0-.434.156-.591.582-.6q.379-.005.758,0a5.99,5.99,0,0,1,3.96,1.5,7.2,7.2,0,0,1,.578.628l.075-.069a4.738,4.738,0,0,0-2.591-3.5,5.5,5.5,0,0,0-2.458-.412c-.867.009-.9-.034-.9-.9v-.93l-.088-.034-2.667,2.79,2.657,2.781" transform="translate(-274.24 -48.163)"/>
                                        </g>
                                    </g>
                                    </svg>
                                </div>
                                <span className={`font-medium text-base 2xl:text-lg`}>Versement bancaire</span>
                            </div>
                        </div>
                        <div className="flex flex-row h-[8rem]">
                            <div className="flex-column w-3/4">
                                <div className="flex flex-row space-x-1">
                                    <div className="pt-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15.214" height="15.214" viewBox="0 0 15.214 15.214">
                                            <path id="_5e94a90cc30706fa992f8ced1c38048b" data-name="5e94a90cc30706fa992f8ced1c38048b" d="M7.874.264a7.607,7.607,0,1,0,7.6,7.6,7.62,7.62,0,0,0-7.6-7.6Zm0,1.383A6.226,6.226,0,1,1,1.646,7.869,6.21,6.21,0,0,1,7.874,1.647ZM7.863,3.02a.691.691,0,0,0-.684.705V7.869a.691.691,0,0,0,.205.489l2.765,2.767a.691.691,0,1,0,.975-.98L8.562,7.583V3.725a.691.691,0,0,0-.7-.705Z" transform="translate(-0.264 -0.264)" fill-rule="evenodd"/>
                                        </svg>
                                    </div>
                                    <div className="inline-flex flex-col text-[11px] font-light text-black leading-tight py-1">
                                        <span>Disponibilité des fonds :</span><br></br>
                                        <span>06 heures après le dépôt bancaire</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-column w-1/4 justify-end items-end">
                                <svg id="Composant_299_47" data-name="Composant 299 – 47" xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
                                <g id="Rectangle_628" data-name="Rectangle 628" fill="#fff" stroke="#707070" stroke-width="1">
                                    <rect width="38" height="38" rx="19" stroke="none"/>
                                    <rect x="0.5" y="0.5" width="37" height="37" rx="18.5" fill="none"/>
                                </g>
                                <path id="_4237f00324bcddeaf63d8a30593b540d" data-name="4237f00324bcddeaf63d8a30593b540d" d="M11.9,5.436a.635.635,0,0,0,0,.9l3.995,3.995H3.885a.635.635,0,1,0,0,1.27h12.01L11.9,15.593a.635.635,0,1,0,.9.9l5.078-5.078a.635.635,0,0,0,0-.9L12.8,5.436A.635.635,0,0,0,11.9,5.436Z" transform="translate(8.25 8.25)" stroke="#000" stroke-width="0.5" fill-rule="evenodd"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div onClick={() => setSelectedAccount('all')} className={`snap-end shrink-0 w-[29%] 2xl:w-[23%] h-[10rem] bg-white flex flex-col cursor-pointer ${selectedAccount == 'all' && 'outline outline-offset-2 outline-2 outline-[#3c3c3c]'} p-3 rounded-3xl`}>
                        <div className=" w-[100%]">
                            <div className={`inline-flex flex-col `}>
                                <div className={`mb-1 rounded-xl p-1 bg-[#f0f0f0] w-[2.7rem] h-[2.7rem] inline-flex justify-center items-center`}>
                                    <svg id="Groupe_533" data-name="Groupe 533" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="31.469" height="27.491" viewBox="0 0 31.469 27.491">
                                    <defs>
                                        <clipPath id="clip-path">
                                        <rect id="Rectangle_561" data-name="Rectangle 561" width="31.468" height="27.491" fill="none"/>
                                        </clipPath>
                                    </defs>
                                    <g id="Groupe_532" data-name="Groupe 532" clip-path="url(#clip-path)">
                                        <path id="Tracé_673" data-name="Tracé 673" d="M17.418,21.253C16,21.939,14.63,22.568,13.3,23.262a1.93,1.93,0,0,1-1.822.047c-3.557-1.543-7.132-3.046-10.7-4.566a1.129,1.129,0,0,1-.765-1.172A1.058,1.058,0,0,1,.878,16.6a1.776,1.776,0,0,1,.876.134q5.135,2.16,10.255,4.356a.7.7,0,0,0,.654-.023q2.231-1.1,4.478-2.17a.4.4,0,0,0,.281-.448c-.02-.356-.005-.715-.005-1.123l-2.691,1.3c-.6.29-1.2.579-1.8.874a1.22,1.22,0,0,1-1.079.028Q6.306,17.159.758,14.8a1.123,1.123,0,1,1,.884-2.058q5.179,2.192,10.351,4.4a.7.7,0,0,0,.654-.007q2.246-1.11,4.51-2.185a.384.384,0,0,0,.265-.422c-.019-.361-.005-.723-.005-1.136-.147.067-.26.116-.371.17-1.356.657-2.715,1.309-4.067,1.975a1.321,1.321,0,0,1-1.177.034Q6.339,13.244.871,10.925A1.153,1.153,0,0,1,.087,9.4a1.329,1.329,0,0,1,.75-.7q4.794-2.281,9.585-4.569Q14.582,2.15,18.739.162A1.386,1.386,0,0,1,19.981.133Q25.293,2.46,30.612,4.769a1.156,1.156,0,0,1,.03,2.215c-1.7.813-3.384,1.642-5.082,2.452a.4.4,0,0,0-.286.444c.022.357.006.717.006,1.116.156-.069.272-.117.384-.171,1.388-.671,2.774-1.347,4.165-2.014a1.1,1.1,0,0,1,1.32.228,1.042,1.042,0,0,1,.178,1.262,1.667,1.667,0,0,1-.631.571c-1.694.843-3.4,1.665-5.107,2.479a.448.448,0,0,0-.315.5c.026.337.006.677.006,1.078.153-.069.274-.12.392-.177,1.378-.666,2.754-1.336,4.134-2a1.1,1.1,0,0,1,1.349.224,1.037,1.037,0,0,1,.167,1.263,1.668,1.668,0,0,1-.635.566q-2.51,1.25-5.045,2.448a.533.533,0,0,0-.369.607c.027.313.006.63.006,1,.144-.065.256-.113.365-.165,1.388-.671,2.774-1.348,4.165-2.012a1.11,1.11,0,0,1,1.526.486,1.124,1.124,0,0,1-.553,1.534c-.073.038-.148.07-.222.105L18.578,24.622c-1.861.9-3.725,1.8-5.581,2.708a1.354,1.354,0,0,1-1.209.036Q6.294,25.02.795,22.686a1.126,1.126,0,1,1,.876-2.064q5.161,2.189,10.318,4.389a.738.738,0,0,0,.687-.021q2.232-1.1,4.478-2.17a.386.386,0,0,0,.269-.421c-.019-.36-.005-.723-.005-1.145M3.925,9.747a.789.789,0,0,0,.105.073q4.06,1.729,8.124,3.448a.582.582,0,0,0,.42-.036c1.066-.5,2.125-1.023,3.185-1.539.085-.041.164-.1.264-.154a1.434,1.434,0,0,0-.125-.077q-3.927-1.77-7.858-3.532a.523.523,0,0,0-.385.02C6.482,8.5,5.313,9.058,4.144,9.617c-.069.033-.133.078-.219.13M16.146,3.9a.977.977,0,0,0,.11.084q3.893,1.755,7.79,3.5a.563.563,0,0,0,.417-.013c.972-.455,1.936-.928,2.9-1.4a2.669,2.669,0,0,0,.241-.154c-2.7-1.175-5.349-2.332-8-3.483a.452.452,0,0,0-.326-.024c-1.034.481-2.061.975-3.131,1.485" transform="translate(0 0)"/>
                                    </g>
                                    </svg>
                                </div>
                                <span className={`font-medium text-base 2xl:text-lg`}>Dépôt en agence</span>
                            </div>
                        </div>
                        <div className="flex flex-row h-[8rem]">
                            <div className="flex-column w-3/4">
                                <div className="flex flex-row space-x-1">
                                    <div className="pt-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15.214" height="15.214" viewBox="0 0 15.214 15.214">
                                            <path id="_5e94a90cc30706fa992f8ced1c38048b" data-name="5e94a90cc30706fa992f8ced1c38048b" d="M7.874.264a7.607,7.607,0,1,0,7.6,7.6,7.62,7.62,0,0,0-7.6-7.6Zm0,1.383A6.226,6.226,0,1,1,1.646,7.869,6.21,6.21,0,0,1,7.874,1.647ZM7.863,3.02a.691.691,0,0,0-.684.705V7.869a.691.691,0,0,0,.205.489l2.765,2.767a.691.691,0,1,0,.975-.98L8.562,7.583V3.725a.691.691,0,0,0-.7-.705Z" transform="translate(-0.264 -0.264)" fill-rule="evenodd"/>
                                        </svg>
                                    </div>
                                    <div className="inline-flex flex-col text-[11px] font-light text-black leading-tight py-1">
                                        <span>Disponibilité des fonds :</span><br></br>
                                        <span>Immédiate</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-column w-1/4 justify-end items-end">
                                <svg id="Composant_299_47" data-name="Composant 299 – 47" xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
                                <g id="Rectangle_628" data-name="Rectangle 628" fill="#fff" stroke="#707070" stroke-width="1">
                                    <rect width="38" height="38" rx="19" stroke="none"/>
                                    <rect x="0.5" y="0.5" width="37" height="37" rx="18.5" fill="none"/>
                                </g>
                                <path id="_4237f00324bcddeaf63d8a30593b540d" data-name="4237f00324bcddeaf63d8a30593b540d" d="M11.9,5.436a.635.635,0,0,0,0,.9l3.995,3.995H3.885a.635.635,0,1,0,0,1.27h12.01L11.9,15.593a.635.635,0,1,0,.9.9l5.078-5.078a.635.635,0,0,0,0-.9L12.8,5.436A.635.635,0,0,0,11.9,5.436Z" transform="translate(8.25 8.25)" stroke="#000" stroke-width="0.5" fill-rule="evenodd"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className={`w-1 snap-end`}></div>
                </div>
            </div>
            <div className={`h-full`}>
                <div className={`bg-white flex-grow rounded-3xl h-full`}>
                    <SuppliesTable searchItems={searchItems} lang={lang} selectedAccount={selectedAccount}  merchant={merchant}/>
                </div>
            </div>
        </div>
    );
}