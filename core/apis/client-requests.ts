import {IUser} from "@/core/interfaces/user";
import {clientFetchData} from "@/core/apis/download-file";

export async function makeKycFilesUpload(merchant: IUser, data: {}) {

    const dataObject = {
        document: data,
    };
    console.log(dataObject)

    // @ts-ignore
    const url = `/user-accounts/${merchant.merchantsIds[0].id}/documents`;
    console.log(url)

    const resData = await clientFetchData(url, 'POST', dataObject, merchant.accessToken)
    console.log(resData);

    return resData;
}