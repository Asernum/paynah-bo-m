"use server";

import {signIn, signOut} from "@/auth";
import {fetchData} from "@/lib/api";
import {IUser} from "@/core/interfaces/user";
import {decodeToken} from "react-jwt";

export async function login(values: any) {
    return signIn("merchant", {
        username: values.username,
        password: values.password,
        redirect: true
    });
}

export async function logout() {
    return await signOut();
}

export async function sendOtp(values: any) {
    const data = {
        'username': values.username,
    };

    // return await fetchData('/user-accounts/send-reset-password-mail', 'POST', data);
    return await fetchData('/user-accounts/send-otp', 'POST', data);
}

export async function validateOtp(values: any, username: string) {
    const data = {
        'otpCode': values.otp,
        'username': username
    };

    return await fetchData('/user-accounts/verify-otp', 'POST', data);
}

export async function resetPassword(values: any, token: string) {
    const user = decodeToken(token) as IUser;
    console.log('resetP-user-dec', user);
    console.log(token);

    const data = {
        'token': token,
        'password': values.password,
        'id': user?.id
    };

    const resData = await fetchData('/user-accounts/reset-password', 'POST', data);
    console.log(resData);

    return resData;
}

export async function generateNewToken() {
    const newTokenRes = await fetchData('/user-accounts/refresh-token', 'POST');

    if (!newTokenRes.success) {
        throw Error('RefreshToken dont work');
    }

    return newTokenRes.data;
}