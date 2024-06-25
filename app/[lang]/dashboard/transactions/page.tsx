import { SearchParams } from "@/core/interfaces";
import { Locale } from "@/i18n.config";
import { searchParamsSchema } from "@/components/dashboard/send-money/validations";
import { auth } from "@/auth";
import { IUser } from "@/core/interfaces/user";
import FilterableTransactions from "@/components/dashboard/transactions/FilterableTransactions";
import { getMerchantBankAccounts } from "@/core/apis/bank-account";

export interface AccountsProps {
  searchParams: SearchParams;
  params: { lang: Locale };
}

export default async function TransactionsPage({
  params: { lang },
  searchParams,
}: AccountsProps) {
  const searchItems = searchParamsSchema.parse(searchParams);

  const session = await auth();

  let merchant;
  if (session && session.user) {
    merchant = session.user as IUser;
  } else {
    merchant = {} as IUser;
  }

  const accountsInfos = await getMerchantBankAccounts(
    String(merchant.merchantsIds[0].id),
    String(merchant.accessToken)
  );

  return (
    <>
      <div
        className={`max-w-screen-2xl 2xl:max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 h-full flex flex-col`}
      >
        <FilterableTransactions
          lang={lang}
          searchItems={searchItems}
          merchant={merchant}
          accounts={accountsInfos.accounts}
        />
      </div>
    </>
  );
}
