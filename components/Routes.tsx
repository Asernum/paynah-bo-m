const Routes = {
    auth: {
        login: '/{lang}/auth/login',
        sendOtp: '/{lang}/auth/send-otp',
        validateOtp: '/{lang}/auth/validate-otp',
        validateAccount: '/{lang}/auth/validate-account',
        resetAccess: '/{lang}/auth/reset-access',
        signUp: '/{lang}/auth/sign-up',
        onboardingKyc: '/{lang}/onboarding/add-merchant-kyc',
        onboardingAddMMerchant: '/{lang}/onboarding/add-merchant',
    },
    dashboard: {
        home: '/{lang}/dashboard',
        sendMoney: '/{lang}/dashboard/send-money',
        paymentLink: '/{lang}/dashboard/payment-link',
        accounts: '/{lang}/dashboard/accounts',
        transactions: '/{lang}/dashboard/transactions',
        beneficiaries: '/{lang}/dashboard/send-money/beneficiaries',
        pointsOfSale: '/{lang}/dashboard/points-of-sale',
        supply: '/{lang}/dashboard/supply',
        team: '/{lang}/dashboard/team',
    }
}

export default Routes;