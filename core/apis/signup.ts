"use server";

import {fetchData} from "@/lib/api";
import {decodeToken} from "react-jwt";
import {IUser} from "@/core/interfaces/user";
import {clientFetchData} from "@/core/apis/download-file";

export async function getCountriesList() {
    const data = await fetchData('/countries');
    return data;
}

export async function createUserAccount(data: any) {
    const resData = await fetchData('/user-accounts/create-user', 'POST', data);
    return resData;
}

export async function createPassword(values: any, token: string) {
    const user = decodeToken(token) as IUser;

    const data = {
        'token': token,
        'password': values.password,
        'id': user?.id
    };

    const res = await fetchData('/user-accounts/create-password', 'POST', data);
    console.log(res);

    return res;
}

export async function addMerchant(data: any, merchant: IUser) {
    const resData = await fetchData('/user-accounts', 'POST', data, merchant.accessToken);
    console.log(resData);
    console.log(merchant.accessToken);
    return resData;
}

export async function getMerchantIdsInfos(merchant: IUser, url: string) {
    const resData = await fetchData(url, 'GET', null, merchant.accessToken);

    if (!resData.success) {
        throw Error("get not existing specific merchant");
    }

    return resData.data;
}

export async function getLegalFormInfos(merchant: IUser, url: string) {
    const resData = await fetchData(url, 'GET', null, merchant.accessToken);

    if (!resData.success) {
        throw Error("get not existing specific legal form");
    }

    return resData.data;
}