export interface IUser {
    id?: string;
    sub?: string;
    login?: string;
    firstname?: string;
    lastname?: string;
    country?: string;
    isFirstConnection?: boolean;
    codeOTP?: string;
    accessTokenExpires?: string;
    merchantsIds: MerchantId[];
    accessToken: string | undefined;
    refreshToken: string | undefined;
}

interface MerchantId {
    id: string;
    name: string;
    status: [];
    "bank-account": [];
}