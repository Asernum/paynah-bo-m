import {Locale} from "@/i18n.config";
import {getDictionary} from "@/lib/dictionary";
import AuthValidateAccountForm from "@/components/auth/form/ValidateAccount";

export default async function ValidateOtpPage({params: { lang }}: {
    params: { lang: Locale }
}) {
    const {page} = await getDictionary(lang)

    return (
        <div className={`max-w-screen-2xl mx-auto py-5 px-4 md:px-6 lg:px-8`}>
            <div className={`formContainer mx-auto max-w-lg`}>
                <div className={`text-center mb-16`}>
                    <h2 className={`font-semibold text-center text-2xl md:text-3xl mb-3`}>Confirmation de votre e-mail</h2>
                    <p className={`text-[#626262] text-sm md:text-base`}>Veuillez saisir le code OTP que nous vous avons envoyé par mail</p>
                </div>
                <AuthValidateAccountForm lang={lang} />
            </div>
        </div>
    );
}