import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import NavigationLoadingProviders from "@/app/[lang]/navigation-loading-providers";
import {i18n, Locale} from "@/i18n.config";
import {Toaster} from "react-hot-toast";
import AuthProvider from "@/components/auth-provider";
// import Link from "next/link";
// import Routes from "@/components/Routes";
// import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
// import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import DashboardMainMenuFooter from "@/components/dashboard/MainMenu";
import DashboardTopMenu from "@/components/dashboard/TopMenu";
import {redirect, usePathname} from "next/navigation";
import {IUser} from "@/core/interfaces/user";
import {auth} from "@/auth";

const fontPaynah = Poppins({
  weight: ['100', '300', '400', '500', '600', '800', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s - BO Marchand Paynah Pro',
    default: 'Espace Marchand - Paynah Pro'
  },
  description: 'Backoffice Marchand de Paynah Pro',
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '520x520',
      url: '/images/favicon.png',
    },
  ],
}

export async function generateStaticParams() {
  return i18n.locales.map(locale => ({ lang: locale }))
}

export default async function RootLayout({
  children, params
}: Readonly<{
  children: React.ReactNode;
  params: { lang: Locale };
}>) {
    const session  = await auth();
    let merchant: IUser = {} as IUser
    if (session && session.user) {
        merchant = session.user as IUser;
        // console.log(merchant);
        if (merchant.merchantsIds && merchant.merchantsIds.length == 0) {
            return redirect('/onboarding/add-merchant');
        }
    }

    return (
        <AuthProvider>
            <html lang={params.lang}>
            <body className={`${fontPaynah.className} bg-[#f4f4f7]`}>
            <NavigationLoadingProviders>
                <div className={`min-h-screen`}>
                    <div className={`flex flex-col min-h-screen pb-[6.6rem]`}>
                        <DashboardTopMenu lang={params.lang} merchant={merchant} />
                        <div className={`mt-3 flex-grow`}>
                            {children}
                        </div>
                    </div>
                    <DashboardMainMenuFooter lang={params.lang}/>
                </div>
                <Toaster/>
            </NavigationLoadingProviders>
            </body>
            </html>
        </AuthProvider>
    );
}
