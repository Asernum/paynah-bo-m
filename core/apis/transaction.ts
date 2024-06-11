"use server"
// import {auth} from "@/auth";
// import {IUser} from "@/core/interfaces/user";

import {fetchData} from "@/lib/api";

interface queryParams {
    merchantId?: string;
    coreBankId?: string;
}

interface filterableTransactionsQueryParams {
    merchantId: string;
    search?: string;
    page: number;
    perPage: number;
    from?: Date;
    to?: Date;
    status?: string;
}

export async function getTransactions(query: queryParams, token: string) {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const startOfNextYear = new Date(currentDate.getFullYear() + 1, 0, 1);

    const formatStartOfYear = startOfYear.toLocaleDateString('en-GB');
    const formatStartOfNextYear = startOfNextYear.toLocaleDateString('en-GB');

    const resData = await fetchData(`/transactions/all-transactions/with-filters?merchantId=${query.merchantId}&searchTerm=${query.coreBankId}&csv=false&perPage=6&from=${formatStartOfYear}&to=${formatStartOfNextYear}`, 'GET', null, token, false);
    console.log(resData);
    // console.log(token);
    return resData.data;
}

export async function getFilterableTransactions(url: string, query: filterableTransactionsQueryParams, token: string) {
    const resData = await fetchData(url, 'GET', null, token, false);
    return resData;
}

export async function getFilterableTransactionsExport(url: string, token: string) {
    const resData = await fetchData(url, 'GET', null, token, false);
    return resData;
}

export async function getTransactionsType(url: string, token: string) {
    const resData = await fetchData(url, 'GET', null, token, false);
    return resData;
}