import {Locale} from "@/i18n.config";
import {getDictionary} from "@/lib/dictionary";
import AddMerchant from "@/components/auth/form/AddMerchant";
import {auth} from "@/auth";
import {IUser} from "@/core/interfaces/user";
import {redirect} from "next/navigation";
import {fetchData} from "@/lib/api";
import {cookies} from "next/headers";

export function isEmptyObject(obj: object): boolean {
    return Object.keys(obj).length === 0;
}

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

    if (merchant.merchantsIds && merchant.merchantsIds.length > 0) {
        return redirect('/dashboard');
    }

    const url = `/countries/${merchant.country}/legal-forms`;
    const legalFormsRes = await fetchData(url);
    const legalForms: {id: string, name: string, code: string, skaleetId: string, sk_document: any[], company_type: number}[] = legalFormsRes.success ? legalFormsRes.data : [];

    return (
        <div className={`max-w-screen-2xl mx-auto py-5 px-4 md:px-6 lg:px-8`}>
            <AddMerchant lang={lang} legalForms={legalForms} merchant={merchant} />
        </div>
    );
}