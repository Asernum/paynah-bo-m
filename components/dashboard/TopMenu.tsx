"use client"

import {Locale} from "@/i18n.config";
import Link from "next/link";
import TopMenuSoldInfos from "@/components/dashboard/top-menu/TopMenuBalanceInfos";
import TopMenuAccountInfos from "@/components/dashboard/top-menu/TopMenuAccountInfos";
import Routes from "@/components/Routes";
import {IUser} from "@/core/interfaces/user";
import {useEffect, useState} from "react";
import {getMerchantBankAccounts} from "@/core/apis/bank-account";
import {IAccount} from "@/core/interfaces/account";
import {usePathname} from "next/navigation";
// import {useRouter} from "next13-progressbar";
import jwtDecode, {JwtPayload} from "jsonwebtoken";
import {useCookies} from "react-cookie";

interface DashboardTopMenuProps {
    lang: Locale,
    merchant: IUser,
    tokenExpire?: boolean
}

const checkTokenExpiry = (token: string | null): boolean => {
    if (!token) return true;

    const decodedToken = jwtDecode.decode(token) as JwtPayload;
    if (!decodedToken || !decodedToken.exp) return true;

    const expiryTime = decodedToken.exp * 1000;
    return Date.now() >= expiryTime;
};

export default function DashboardTopMenu({lang, merchant, tokenExpire}: DashboardTopMenuProps) {
    const [isLoading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [availableBalance, setAvailableBalance] = useState(0);
    const [currentAccount, setCurrentAccount] = useState<IAccount | {}>({});
    const [accounts, setAccounts] = useState<any[]>([]);

    const pathname = usePathname();

    // const [cookies, setCookie, removeCookie] = useCookies(['authjs.session-token']);
    // const router = useRouter();

    function initializeCurrentAccount(accounts: IAccount[]) {
        if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
        }
    }

    const handleChangeAccount = (value: string) => {
        const selectedCoreBankId = value;
        const accoundFounded = accounts.filter((account: IAccount) => account.coreBankId == selectedCoreBankId);
        // console.log('ELement 1', accoundFounded.length);
        if (accoundFounded.length != 0) {
            setCurrentAccount(accoundFounded[0]);
        }
    };

    useEffect(() => {
        setLoading(true);
        // @ts-ignore
        getMerchantBankAccounts(merchant.merchantsIds[0].id, String(merchant.accessToken))
            .then(data => {
                const accountsItem = data.accounts.sort((a: any, b: any) => b.isMain - a.isMain);
                console.log('top menu', data);
                setBalance(data.total_balance);
                setAvailableBalance(data.total_skaleet_balance);
                setAccounts(accountsItem);
                initializeCurrentAccount(accountsItem);
                setLoading(false);
            })
            .catch(err => {
                setAccounts([]);
                setLoading(false);
            });
    }, [pathname]);

    return (
        <div className={`bg-white border-b border-[#d2d3d3] py-2`}>
            <div className={`max-w-screen-2xl 2xl:max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8`}>
                <div className={`flex justify-between items-center`}>
                    <Link href={Routes.dashboard.home.replace('{lang}', lang)}>
                        <svg className={`w-[2.5rem]`} viewBox="0 0 44.203 44.203">
                            <defs>
                                <clipPath id="clip-path2">
                                    <rect width="44.203" height="44.203"/>
                                </clipPath>
                            </defs>
                            <g transform="translate(0 -2)">
                                <g transform="translate(0 2)" clipPath="url(#clip-path2)">
                                    <path
                                        d="M22.1,0C5.319,0,0,5.319,0,22.1S5.319,44.2,22.1,44.2s22.1-5.319,22.1-22.1S38.884,0,22.1,0m0,40.746C7.944,40.746,3.458,36.259,3.458,22.1S7.944,3.457,22.1,3.457,40.745,7.944,40.745,22.1,36.259,40.746,22.1,40.746"
                                        transform="translate(0 0)"/>
                                    <path
                                        d="M39.814,20.3a8.227,8.227,0,0,0-5.73-2.075h-10.6v22.5h4.06v-7.31a4.455,4.455,0,0,1,0-4.28V22.046h6.268a4.366,4.366,0,0,1,2.959,1.05,3.351,3.351,0,0,1,1.191,2.673A3.267,3.267,0,0,1,36.775,28.4a4.428,4.428,0,0,1-2.961,1.029H30.36a2.15,2.15,0,0,0,.111,3.759h3.5a8.4,8.4,0,0,0,5.808-2.074A6.958,6.958,0,0,0,42.1,25.706a7.006,7.006,0,0,0-2.29-5.408"
                                        transform="translate(-8.464 -6.567)"/>
                                </g>
                            </g>
                        </svg>
                    </Link>
                    <div className={`inline-flex items-center space-x-[5rem]`}>
                        <TopMenuSoldInfos lang={lang} merchant={merchant} balance={balance}
                                          availableBalance={availableBalance} isLoading={isLoading}/>
                        <TopMenuAccountInfos lang={lang} merchant={merchant} accounts={accounts}
                                             currentAccount={currentAccount} isDataLoading={isLoading}
                                             handleChangeAccount={handleChangeAccount}/>
                    </div>
                </div>
            </div>
        </div>
    )
}