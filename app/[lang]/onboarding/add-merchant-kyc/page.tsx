import {Locale} from "@/i18n.config";
import {getDictionary} from "@/lib/dictionary";
import AddMerchantKyc from "@/components/auth/form/AddMerchantKyc";
import {auth} from "@/auth";
import {IUser} from "@/core/interfaces/user";
import {redirect} from "next/navigation";
import {getLegalFormInfos, getMerchantIdsInfos} from "@/core/apis/signup";
import {fetchData} from "@/lib/api";
import {isEmptyObject} from "@/app/[lang]/onboarding/add-merchant/page";
import {cookies} from "next/headers";

export default async function AddMerchantPage({params: { lang }}: {
    params: { lang: Locale }
}) {
    const {page} = await getDictionary(lang)

    const session  = await auth();

    let merchant;
    if (session && session.user) {
        merchant = session.user as IUser;
    } else {
        merchant = {} as IUser;
        return redirect('/auth/sign-up');
    }

    if (!merchant || isEmptyObject(merchant)) {
        // cookies().set('next-auth.session-token', '');
        // cookies().set('next-auth.callback-url', '');
        // return redirect('/auth/login');
        console.log('session', session);
    }

    if (merchant.merchantsIds && merchant.merchantsIds.length == 0) {
        return redirect('/onboarding/add-merchant');
    }

    // @ts-ignore
    const url = `/merchants/${merchant.merchantsIds ? merchant?.merchantsIds[0].id : ''}`;
    const merchantIdsInfos = await getMerchantIdsInfos(merchant, url);

    const urlLegalForm = `/countries/${merchant.country}/legal-forms`;
    const legalFormsRes = await fetchData(urlLegalForm);
    const legalForms: {id: string, name: string, code: string, skaleetId: string, sk_document: any[], company_type: number}[] = legalFormsRes.success ? legalFormsRes.data.filter((element: any) => element.company_type === merchantIdsInfos.legalForm.categorie && element.id === merchantIdsInfos.legalForm.id) : [];


    return (
        <div className={`max-w-screen-2xl mx-auto py-5 px-4 md:px-6 lg:px-8`}>
            <AddMerchantKyc lang={lang} merchant={merchant} merchantIdsInfos={merchantIdsInfos} legalForm={legalForms[0]} />
        </div>
    );
}