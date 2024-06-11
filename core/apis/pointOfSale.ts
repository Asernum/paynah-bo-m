"use server"
// import {auth} from "@/auth";
// import {IUser} from "@/core/interfaces/user";

import {fetchData} from "@/lib/api";

export async function getMerchantPointOfSales(url: string, token: string) {
    const resData = await fetchData(url, 'GET', null, token, true);
    return resData;
}

export async function getMerchantTerminals(url: string, token: string) {
    const resData = await fetchData(url, 'GET', null, token, true);
    return resData;
}