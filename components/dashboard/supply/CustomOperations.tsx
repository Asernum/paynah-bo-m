'use client'

import { Locale } from "@/i18n.config";
import React, { useState, useEffect } from "react";
import Accounts from "@/components/dashboard/supply/Accounts";
import Beneficiary from "@/components/dashboard/send-money/Beneficiary";
import MainActions from "@/components/dashboard/payment-link/modals/MainActions";
import {IUser} from '@/core/interfaces/user';
import { getMerchantBankAccounts } from "@/core/apis/bank-account";
import { getMerchantBeneficiaries } from "@/core/apis/beneficiary";
import { getCountries } from "@/core/apis/country";
import { getTransactions } from "@/core/apis/transaction";
import {IAccount} from "@/core/interfaces/account";
import {IBeneficiary} from "@/core/interfaces/beneficiary";
import { ICountry } from "@/core/interfaces/country";

interface CustomOperationsProps {
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

export default function CustomOperations({ lang, searchItems, merchant }: CustomOperationsProps) {

    const [accounts, setAccounts] = useState<IAccount[]>([]);
    const [isLoadingBenefs, setLoadingBenefs] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [isAccountActionLoading, setAccountActionLoading] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    function fetchMerchantBankAccounts() {
        // @ts-ignore
        getMerchantBankAccounts(String(merchant.merchantsIds[0].id), String(merchant.accessToken))
        .then(data => {
            setAccounts(data.accounts);
            console.log('COMPTES', data.accounts);
            setAccountActionLoading(true);
            setLoading(false);
        })
        .catch(err => {
            setLoading(false);
            setAccounts([]);
        });
    }

    useEffect(() => {
        if (!isAccountActionLoading) {
            fetchMerchantBankAccounts()
        }
    }, [fetchMerchantBankAccounts, isAccountActionLoading]);

    return (
        <div className={`h-full bg-white px-6 py-1 rounded-2xl`}>
            {/* <div className={`flex flex-col space-y-2.5`}>
                <MainActions lang={lang} merchant={merchant} accounts={accounts} beneficiaries={beneficiaries} />
            </div> */}
            {/* <Beneficiary lang={lang} merchant={merchant} beneficiaries={beneficiaries}/> */}
            <Accounts lang={lang} merchant={merchant} isLoading={isLoadingBenefs} accounts={accounts}/>
        </div>
    )
}