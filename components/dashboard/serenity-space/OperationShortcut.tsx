"use client"

import {Locale} from "@/i18n.config";
import React, {useEffect, useRef, useState} from "react";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem} from "@/components/ui/form";
import {Plus, Send} from "lucide-react";
import Image from "next/image";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {RadioGroup} from "@/components/ui/radio-group";
import {Button} from "@/components/ui/button";
import {NumericFormat} from "react-number-format";
import IMask from 'imask';
import {FlagImage, PhoneInput, PhoneInputRefType} from 'react-international-phone';
import 'react-international-phone/style.css';
import {activePayouts, getBankName, validateEmail} from "@/lib/utils";
import {getMerchantBeneficiaries} from "@/core/apis/beneficiary";
import {getCountries, getCountryOperators} from "@/core/apis/country";
import {getMerchantBankAccounts} from "@/core/apis/bank-account";
import {IUser} from "@/core/interfaces/user";
import {ICountry} from "@/core/interfaces/country";
import {IOperator} from "@/core/interfaces/operator";
import {IBeneficiary} from "@/core/interfaces/beneficiary";
import {IAccount} from "@/core/interfaces/account";
import BeneficiaryActions from '@/components/dashboard/send-money/modals/BeneficiaryActions'
import SendMoneyActions from '@/components/dashboard/serenity-space/modals/SendMoneyActions'
import PaymentLinkActions from '@/components/dashboard/serenity-space/modals/PaymentLinkActions'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Skeleton} from "@/components/ui/skeleton";
import SendMoneyActionsPayDirect from "@/components/dashboard/serenity-space/modals/SendMoneyActionsPayDirect";


interface OperationShortcutProps {
    lang: Locale,
    merchant: IUser,
    accountCountryInfo?: any,
    accountCountryOperators?: any,
    countriesItem?: any,
    accountsItem?: any
}

export const RANDOM_AVATAR_COLORS_CONFIG = [
    {bg: '#ffc5ae', text: '#ff723b'},
    {bg: '#aedaff', text: '#31a1ff'},
    {bg: '#e0aeff', text: '#bc51ff'},
    {bg: '#aeffba', text: '#02b71a'},
    {bg: '#ffadae', text: '#e03c3e'},
]

export default function OperationShortcut({lang, merchant, accountCountryInfo, accountCountryOperators, countriesItem, accountsItem}: OperationShortcutProps) {

    const [isLoading, setLoading] = useState(true);
    const [isLoadingCountryOps, setLoadingCountryOps] = useState(false);
    const [showConError, setShowConError] = useState(false);
    const [activeSendMode, setActiveSendMode] = useState('direct');
    const [bankName, setBankName] = useState('');
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [countries, setCountries] = useState(countriesItem);
    const [operators, setOperators] = useState(accountCountryOperators);
    const [dOperator, setDOperator] = useState(accountCountryOperators[0]);
    const [pCountry, setPCountry] = useState(accountCountryInfo.code ?? 'CI');
    const [pAccountNumber, setPAccountNumber] = useState('');
    const [accounts, setAccounts] = useState<IAccount[]>(accountsItem.sort((a:any, b:any) => b.isMain - a.isMain));

    const refPhone = useRef<PhoneInputRefType>(null);
    // const refPhone =  React.forwardRef<PhoneInputRefType>(0);
    const refBankAccountNumber = useRef(null);

    const mobileTransfertFormSchema = z.object({
        mmCountry: z.string(),
        mmAccountNumber: z.string().regex(/^[0-9]{8,}$/i, {message: "veuillez entrez un numéro valide"}),
        mmAmount: z.number().gte(1, {message: "Le montant doit être suppérieure ou égale à 1"}),
    })

    const mobileTransfertForm = useForm<z.infer<typeof mobileTransfertFormSchema>>({
        resolver: zodResolver(mobileTransfertFormSchema),
        defaultValues: {
            mmCountry: "",
            mmAccountNumber: "",
            mmAmount: 0,
        }
    });

    const formSchema = z.object({
        beneficiary: z.string(),
        accountNumber: z.string(),
        bankAccountNumber: z.string(),
        bankAmount: z.string(),
        bankBeneficiary: z.string(),
        bankZone: z.string(),
        amount: z.string(),
        mmAmount: z.string(),
        mmCountry: z.string(),
        mmAccountNumber: z.string(),
        mmOperator: z.string(), // om, wave, mtn, moov
        sendMode: z.enum(["direct", "mm", "bank"], {
            required_error: "Vous devez choisir un mode d'envoi",
        }),
    });

    const formSchemaPaymentLink = z.object({
        accountNumber: z.string(),
        accountCoreBankId: z.string(),
        amount: z.string(),
        firstName: z.string(),
    });

    const sendMoney = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            beneficiary: "",
            sendMode: "direct",
            accountNumber: "",
            mmAmount: "",
            mmCountry: pCountry.code,
            amount: "",
            mmAccountNumber: "",
            mmOperator: dOperator?.code ?? 'WAVE',
            bankAmount: "",
            bankZone: "uemoa",
            bankAccountNumber: "",
            bankBeneficiary: ""
        }
    });

    const paymentLink = useForm<z.infer<typeof formSchemaPaymentLink>>({
        resolver: zodResolver(formSchemaPaymentLink),
        defaultValues: {
            accountNumber: "",
            accountCoreBankId: "",
            amount: "",
        }
    });

    const call = () => {
        console.log('Call Function');
    }

    const {register, handleSubmit, formState: {errors}, setValue} = sendMoney;

    async function triggerRadio(inputName: "direct" | "mm" | "bank") {
        sendMoney.setValue('sendMode', inputName);
        setActiveSendMode(inputName);
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        setLoading(true);

        setShowConError(true);
    }

    async function onSubmitPaymentLink(values: z.infer<typeof formSchemaPaymentLink>) {
        console.log(values);
        setLoading(true);

        setShowConError(true);
    }

    function changePhoneInputCountrySelect(value: string) {
        refPhone.current?.setCountry(value.toLowerCase());
    }

    const transformBeneficiaryFullNameToBeneficiaryAvatar = (beneficiaryFullName: string) => {
        const beneficiaryFullNameSplit = beneficiaryFullName.trim().length > 0 ? beneficiaryFullName.split(' ') : [];
        return beneficiaryFullNameSplit.length > 0 ? (beneficiaryFullNameSplit.length >= 2 ? `${beneficiaryFullNameSplit[0][0]}${beneficiaryFullNameSplit[1][0]}` : `${beneficiaryFullNameSplit[0][0]}`) : '';
    }

    const getAccountNummberReference = (accountNumber: string) => {
        const accountFilter: IAccount[] = accounts.filter((account: IAccount) => account.id == accountNumber);
        console.log(accountFilter);
        if (accountFilter.length > 0) {
            paymentLink.setValue('accountCoreBankId', accountFilter[0].name);
        }
    }

    const addBeneficiaryItems = (data: any) => {
        // console.log(sendMoney, register);
        try {
            formSchema.parse(data); // Valider les données
            console.log(data);
            setPAccountNumber(data.mmAccountNumber);
            console.log('Les données du formulaire sont valides !');
        } catch (error) {
            console.log(errors);
            // console.error('Erreur de validation du formulaire :', error.errors);
        }
    }

    function fetchMerchantBeneficiaries() {
        setLoading(true);
        // @ts-ignore
        getMerchantBeneficiaries(String(merchant.merchantsIds[0].id), String(merchant.accessToken))
            .then(data => {
                setBeneficiaries(data);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                setBeneficiaries([]);
            });
    }

    function fetchCountries() {
        // @ts-ignore
        getCountries(String(merchant.accessToken))
            .then(data => {
                setCountries(data);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                setCountries([]);
            });
    }

    function fetchCountryOperators(countryCode: string) {
        // console.log(countryCode);
        // @ts-ignore
        setLoadingCountryOps(true);

        const countryFilter: ICountry[] = countries.filter((country: ICountry) => country.code == countryCode);
        const countryId = countryFilter[0].id;
        getCountryOperators(String(countryId), String(merchant.accessToken))
            .then(data => {
                setOperators(data);
                setDOperator(data[0]);
                sendMoney.setValue('mmOperator', data[0].code);
                setLoadingCountryOps(false);
            })
            .catch(err => {
                setLoadingCountryOps(false);
                // setCountries([]);
            });
    }

    // console.log('dOperator', dOperator);

    function fetchMerchantBankAccounts() {
        // @ts-ignore
        getMerchantBankAccounts(String(merchant.merchantsIds[0].id), String(merchant.accessToken))
            .then(data => {
                setAccounts(data.accounts);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                setAccounts([]);
            });
    }

    useEffect(() => {
        // fetchMerchantBankAccounts();
        // paymentLink.setValue('accountNumber', accounts[0].id);
        fetchMerchantBeneficiaries();
        // fetchCountries();
        if (refBankAccountNumber.current) {
            const mask = IMask(refBankAccountNumber.current, {
                mask: 'CCNNN NNNNN NNNNNNNNNNNN NN',
                lazy: true,
                blocks: {
                    'C': {placeholderChar: 'C', mask: 'a'},
                    'N': {placeholderChar: '0', mask: '0'},
                },
                expose: true,
            });

            console.log(mask.value);
        }
    }, [sendMoney, paymentLink]);

    // console.log(sendMoney.getValues('bankAccountNumber'));
    // console.log(refBankAccountNumber.current);

    function getRibBank(rib: string) {
        const bankCode = rib.split(" ")[0];
        if (rib.length == 5) {
            setBankName(getBankName(bankCode));
        }

        if (rib.length == 0) {
            setBankName('');
        }
    }

    return (
        <div className={`operation-shortcut flex-grow`}>
            <span
                className={`hidden bg-[#ffc5ae] bg-[#aedaff] bg-[#e0aeff] bg-[#aeffba] bg-[#ffadae] text-[#ff723b] text-[#31a1ff] text-[#bc51ff] text-[#02b71a] text-[#e03c3e]`}></span>
            <div className={`bg-white rounded-2xl px-3 2xl:px-[.8rem] py-5 h-full`}>
                <h2 className={`font-medium text-base`}>Opérations rapides</h2>
                <div className={`mt-2`}>
                    <Tabs defaultValue="send" className="w-full rounded-2xl">
                        <TabsList className={`rounded-xl flex !bg-[#f0f0f0]`}>
                            <TabsTrigger className={`rounded-lg flex-1 px-1 2xl:px-2 text-[10.5px] 2xl:text-[11px]`}
                                         value="send">{`Envoi d'argent`}</TabsTrigger>
                            <TabsTrigger className={`rounded-lg flex-1 px-1 2xl:px-2 text-[10.5px] 2xl:text-[11px]`}
                                         value="link">{`Lien de paiement`}</TabsTrigger>
                            <TabsTrigger className={`rounded-lg flex-1 px-1 2xl:px-2 text-[10.5px] 2xl:text-[11px]`}
                                         value="topup">{`Rechargement`}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="send">
                            {!validateEmail(merchant.login) ?
                                <div className={`flex justify-center items-center mt-5 min-h-[20rem]`}>
                                    <div className={``}>
                                        <div className={`inline-flex flex-col justify-center`}>
                                            <span className={`text-xs text-[#7d7d7d] mt-1`}>Bientôt disponible</span>
                                        </div>
                                    </div>
                                </div> :
                                <div className={`mt-5 min-h-[20rem]`}>
                                    <div className={`beneficiary-fav mb-5`}>
                                        <h3 className={`text-xs font-light text-gray-400`}>Bénéficiaires
                                            enregistrés</h3>
                                        {isLoading ?
                                            <div className={`inline-flex space-x-1 mt-2`}>
                                                <Skeleton className={`rounded-full h-10 w-10 bg-gray-300`}/>
                                                <BeneficiaryActions lang={lang} merchant={merchant}>
                                                    <button>
                                                        <Avatar
                                                            className={`cursor-pointer border border-[#cdcdcd] border-dashed`}>
                                                            <AvatarFallback className={`bg-transparent text-[#cdcdcd]`}>
                                                                <Plus className={`h-4`}/>
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </button>
                                                </BeneficiaryActions>
                                            </div> :
                                            <div className={`inline-flex space-x-1 mt-2`}>
                                                {
                                                    beneficiaries && beneficiaries.length > 0 &&
                                                    beneficiaries.slice(0, 5).map((beneficiary: IBeneficiary, index: number) => (
                                                        <TooltipProvider key={beneficiary.id} delayDuration={10}>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Avatar
                                                                        className={`cursor-pointer`}>
                                                                        <AvatarFallback
                                                                            className={`bg-[${RANDOM_AVATAR_COLORS_CONFIG[index].bg}] text-[${RANDOM_AVATAR_COLORS_CONFIG[index].text}]`}>
                                                                            {transformBeneficiaryFullNameToBeneficiaryAvatar(`${beneficiary.lastName} ${beneficiary.firstName}`)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className={`text-xs`}>{beneficiary.lastName} {beneficiary.firstName}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    ))
                                                }
                                                <BeneficiaryActions lang={lang} merchant={merchant}>
                                                    <button>
                                                        <Avatar
                                                            className={`cursor-pointer border border-[#cdcdcd] border-dashed`}>
                                                            <AvatarFallback className={`bg-transparent text-[#cdcdcd]`}>
                                                                <Plus className={`h-4`}/>
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </button>
                                                </BeneficiaryActions>
                                            </div>
                                        }
                                    </div>
                                    <Form {...sendMoney}>
                                        <div className="space-y-3">
                                            <div className={``}>
                                                <div
                                                    className={`border border-[#e4e4e4] flex items-center rounded-lg px-1 2xl:px-1 py-1 2xl:py-1`}>
                                                    <div className={`flex items-center w-full`}>
                                                    <span
                                                        className={`text-[10.5px] text-[#84818a] 2xl:text-[11px] font-normal whitespace-nowrap mr-1 2xl:mr-1`}>{`Mode d'envoi`}</span>
                                                        <div className={`w-full`}>
                                                            <FormField
                                                                control={sendMoney.control}
                                                                name="sendMode"
                                                                render={({field}) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <RadioGroup
                                                                                onValueChange={field.onChange}
                                                                                defaultValue={field.value}
                                                                                className="flex items-center justify-between gap-0 rounded-lg !bg-[#f0f0f0] p-1 2xl:p-1 flex-row"
                                                                            >
                                                                                <FormItem
                                                                                    onClick={() => triggerRadio('direct')}
                                                                                    className="flex-1 items-center justify-center space-y-0">
                                                                                    <button type={"button"}
                                                                                            className={`w-full flex items-center justify-center rounded-lg ${field.value == 'direct' ? 'bg-white text-black' : 'text-[#64758b]'} whitespace-nowrap text-[10px] 2xl:text-[11px] font-medium px-1 2xl:px-2 py-1.5`}>
                                                                                        <svg
                                                                                            className={`w-[.7rem] mr-1`}
                                                                                            viewBox="0 0 44.203 44.203">
                                                                                            <defs>
                                                                                                <clipPath
                                                                                                    id="clip-path2">
                                                                                                    <rect width="44.203"
                                                                                                          height="44.203"/>
                                                                                                </clipPath>
                                                                                            </defs>
                                                                                            <g transform="translate(0 -2)">
                                                                                                <g transform="translate(0 2)"
                                                                                                   clipPath="url(#clip-path2)">
                                                                                                    <path
                                                                                                        d="M22.1,0C5.319,0,0,5.319,0,22.1S5.319,44.2,22.1,44.2s22.1-5.319,22.1-22.1S38.884,0,22.1,0m0,40.746C7.944,40.746,3.458,36.259,3.458,22.1S7.944,3.457,22.1,3.457,40.745,7.944,40.745,22.1,36.259,40.746,22.1,40.746"
                                                                                                        transform="translate(0 0)"/>
                                                                                                    <path
                                                                                                        d="M39.814,20.3a8.227,8.227,0,0,0-5.73-2.075h-10.6v22.5h4.06v-7.31a4.455,4.455,0,0,1,0-4.28V22.046h6.268a4.366,4.366,0,0,1,2.959,1.05,3.351,3.351,0,0,1,1.191,2.673A3.267,3.267,0,0,1,36.775,28.4a4.428,4.428,0,0,1-2.961,1.029H30.36a2.15,2.15,0,0,0,.111,3.759h3.5a8.4,8.4,0,0,0,5.808-2.074A6.958,6.958,0,0,0,42.1,25.706a7.006,7.006,0,0,0-2.29-5.408"
                                                                                                        transform="translate(-8.464 -6.567)"/>
                                                                                                </g>
                                                                                            </g>
                                                                                        </svg>
                                                                                        <span>Direct</span>
                                                                                    </button>
                                                                                </FormItem>
                                                                                <FormItem
                                                                                    onClick={() => triggerRadio('mm')}
                                                                                    className="flex-1 items-center justify-center space-y-0">
                                                                                    <button type={"button"}
                                                                                            className={`w-full flex items-center justify-center rounded-lg ${field.value == 'mm' ? 'bg-white text-black' : 'text-[#64758b]'} whitespace-nowrap text-[10px] 2xl:text-[11px] font-medium px-1 2xl:px-2 py-1.5`}>
                                                                                        <span>Mobile Money</span>
                                                                                    </button>
                                                                                </FormItem>
                                                                                <FormItem
                                                                                    onClick={() => triggerRadio('bank')}
                                                                                    className="flex-1 items-center justify-center space-y-0">
                                                                                    <button type={"button"}
                                                                                            className={`w-full flex items-center justify-center rounded-lg ${field.value == 'bank' ? 'bg-white text-black' : 'text-[#64758b]'} whitespace-nowrap text-[10px] 2xl:text-[11px] font-medium pl-1 pr-[2px] 2xl:px-2 py-1.5`}>
                                                                                        <span>Virement</span>
                                                                                    </button>
                                                                                </FormItem>
                                                                            </RadioGroup>
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {activeSendMode == "direct" &&
                                                <div className={`direct-form-inputs space-y-3`}>
                                                    <FormField
                                                        control={sendMoney.control}
                                                        name="accountNumber"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div>
                                                                        <div className="relative">
                                                                            <input type="text" id="accountNumber"
                                                                                   className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`}
                                                                                   placeholder=" " {...field} />
                                                                            <label htmlFor="accountNumber"
                                                                                   className={`primary-form-label !bg-[#f4f4f7] ${field.value && '!bg-white'} peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Numéro
                                                                                de compte
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={sendMoney.control}
                                                        name="amount"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div>
                                                                        <div className="relative">
                                                                            <NumericFormat
                                                                                id="amount"
                                                                                className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white disabled:opacity-60`}
                                                                                placeholder=" "
                                                                                thousandSeparator=" " suffix=" FCFA"
                                                                                onValueChange={(e) => {
                                                                                    sendMoney.setValue('amount', e.value);
                                                                                }} value={field.value}
                                                                                disabled={sendMoney.getValues('accountNumber') == ''}/>
                                                                            {/*<input type="text" id="bankAmount" className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`} placeholder=" " {...field} />*/}
                                                                            <label htmlFor="amount"
                                                                                   className={`primary-form-label !bg-[#f4f4f7] ${sendMoney.getValues('accountNumber') == '' ? 'opacity-60' : ''} ${field.value && '!bg-white'} peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Montant
                                                                            </label>
                                                                            <SendMoneyActionsPayDirect lang={lang}
                                                                                                       sendMoney={sendMoney}
                                                                                                       beneficiaries={beneficiaries}
                                                                                                       merchant={merchant}
                                                                                                       accounts={accounts}
                                                                                                       activeSendMode={activeSendMode}/>
                                                                            {/* <Button type={`submit`} className={`absolute rounded-lg p-3 top-0 right-0`}>
                                                                            <Send className={`h-[1.1rem] text-[#fff] `} />
                                                                        </Button> */}
                                                                        </div>
                                                                    </div>
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            }
                                            {activeSendMode == "mm" &&
                                                <form className={`mm-form-inputs space-y-3`}>
                                                    <FormField
                                                        control={sendMoney.control}
                                                        name="mmCountry"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className={`relative`}>
                                                                        <Select onValueChange={(value) => {
                                                                            field.onChange(value);
                                                                            changePhoneInputCountrySelect(value);
                                                                            fetchCountryOperators(value);
                                                                        }} value={field.value} defaultValue={pCountry}>
                                                                            <SelectTrigger
                                                                                className={`w-full text-sm !pt-[.8rem] h-[2.8rem] rounded-lg border border-[#e4e4e4] pl-2.5 pr-1 font-normal`}
                                                                                style={{
                                                                                    backgroundColor: field.value ? '#fff' : '#fff',
                                                                                }}>
                                                                                <SelectValue placeholder=" "/>
                                                                            </SelectTrigger>
                                                                            <SelectContent
                                                                                className={`bg-[#f0f0f0] z-[100]`}>
                                                                                {
                                                                                    countries && countries.map((country: ICountry) => (
                                                                                        <SelectItem key={country.id}
                                                                                                    className={`text-sm px-7 flex items-center focus:bg-gray-100 font-normal`}
                                                                                                    value={country.code}>
                                                                                            <div
                                                                                                className={`inline-flex items-center space-x-2.5`}>
                                                                                                <FlagImage className={`w-7`}
                                                                                                           iso2={country.code.toLowerCase()}/>
                                                                                                <span
                                                                                                    className={`mt-[2px] text-sm`}>{country.name}</span>
                                                                                            </div>
                                                                                        </SelectItem>
                                                                                    ))
                                                                                }
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <label htmlFor=""
                                                                               className={`primary-form-label !bg-white peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Pays
                                                                            opérateur
                                                                        </label>
                                                                    </div>
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={sendMoney.control}
                                                        name="mmAccountNumber"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div>
                                                                        <div className="relative">
                                                                            {/*<input type="text" id="mmAccountNumber" className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`} placeholder=" " {...field} />*/}
                                                                            <PhoneInput
                                                                                {...field}
                                                                                className={`mt-[.5rem] op-tel`}
                                                                                style={
                                                                                    {
                                                                                        '--react-international-phone-text-color': '#000',
                                                                                        '--react-international-phone-border-color': '#f0f0f0',
                                                                                        '--react-international-phone-height': '2.8rem',
                                                                                        '--react-international-phone-font-size': '14px',
                                                                                        '--react-international-phone-border-radius': '0.5rem',
                                                                                    } as React.CSSProperties
                                                                                }
                                                                                defaultCountry={pCountry.toLowerCase()}
                                                                                forceDialCode={true}
                                                                                ref={refPhone}
                                                                                hideDropdown={true}
                                                                                placeholder=" "
                                                                                disabled={isLoadingCountryOps}
                                                                            />
                                                                            <label htmlFor="mmAccountNumber"
                                                                                   className={`primary-form-label ${isLoadingCountryOps ? 'opacity-40' : ''} !-translate-y-3.5 !bg-white peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-4`}>Numéro
                                                                                de compte
                                                                            </label>
                                                                            <div className={`absolute top-0 left-0`}>
                                                                                <FormField
                                                                                    control={sendMoney.control}
                                                                                    name="mmOperator"
                                                                                    render={({field}) => (
                                                                                        <FormItem>
                                                                                            <FormControl>
                                                                                                <div>
                                                                                                    <Select
                                                                                                        onValueChange={field.onChange}
                                                                                                        value={field.value}
                                                                                                        defaultValue={dOperator?.code ?? 'WAVE'}
                                                                                                        disabled={isLoadingCountryOps}>
                                                                                                        <SelectTrigger
                                                                                                            className={`w-[4rem] selectedItemMM h-[2.8rem] rounded-l-lg !pb-[0px] rounded-r-none border border-[#e4e4e4] pl-2.5 pr-1 font-light`}
                                                                                                            style={{
                                                                                                                backgroundColor: field.value ? '#fff' : '#fff',
                                                                                                            }}>
                                                                                                            <SelectValue
                                                                                                                placeholder="Opérateur"/>
                                                                                                        </SelectTrigger>
                                                                                                        <SelectContent
                                                                                                            className={`bg-[#f0f0f0] !w-[19rem] z-[100]`}>
                                                                                                            {
                                                                                                                operators && operators.map((operator: IOperator) => (
                                                                                                                    <SelectItem
                                                                                                                        key={operator.id}
                                                                                                                        className={`font-normal px-7 flex items-center focus:bg-gray-100 h-[2.4rem] cursor-pointer`}
                                                                                                                        value={operator.code}
                                                                                                                        disabled={!activePayouts().includes(operator.code)}>
                                                                                                                        <div
                                                                                                                            className={`inline-flex items-center space-x-2.5`}>
                                                                                                                            <Image
                                                                                                                                className={`h-[1.6rem] w-[1.6rem]`}
                                                                                                                                src={operator.logoUrl}
                                                                                                                                alt={operator.code}
                                                                                                                                height={512}
                                                                                                                                width={512}/>
                                                                                                                            <span
                                                                                                                                className={`mm-label`}>{operator.name}</span>
                                                                                                                            {!activePayouts().includes(operator.code) &&
                                                                                                                                <span
                                                                                                                                    className={`text-xs py-1 px-2 rounded-full bg-amber-200 text-amber-600 font-medium`}>A venir</span>
                                                                                                                            }
                                                                                                                        </div>
                                                                                                                    </SelectItem>
                                                                                                                ))
                                                                                                            }
                                                                                                        </SelectContent>
                                                                                                    </Select>
                                                                                                </div>
                                                                                            </FormControl>
                                                                                        </FormItem>
                                                                                    )}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={sendMoney.control}
                                                        name="mmAmount"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div>
                                                                        <div className="relative">
                                                                            <NumericFormat
                                                                                id="mmAmount"
                                                                                className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`}
                                                                                placeholder=" "
                                                                                thousandSeparator=" " suffix=" FCFA"
                                                                                value={field.value}
                                                                                onValueChange={(e) => {
                                                                                    sendMoney.setValue('mmAmount', e.value);
                                                                                }}
                                                                                disabled={sendMoney.getValues('mmOperator') == '' || sendMoney.getValues('mmAccountNumber') == '' || sendMoney.getValues('mmCountry') == '' || isLoadingCountryOps}
                                                                            />
                                                                            <label htmlFor="mmAmount"
                                                                                   className={`primary-form-label !bg-[#f4f4f7] ${field.value && '!bg-white'} peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Montant
                                                                            </label>
                                                                            <SendMoneyActions lang={lang}
                                                                                              isLoadingCountryOps={isLoadingCountryOps}
                                                                                              sendMoney={sendMoney}
                                                                                              beneficiaries={beneficiaries}
                                                                                              merchant={merchant}
                                                                                              accounts={accounts}
                                                                                              pCountry={pCountry}
                                                                                              activeSendMode={activeSendMode}/>
                                                                            {/* <Button onClick={handleSubmit((data) => addBeneficiaryItems(data))} className={`absolute rounded-lg p-3 top-0 right-0`}>
                                                                            <Send className={`h-[1.1rem] text-[#fff] `} />
                                                                        </Button> */}
                                                                        </div>
                                                                    </div>
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </form>
                                            }
                                            {activeSendMode == "bank" &&
                                                <div className={`bank-form-inputs space-y-3`}>
                                                    <FormField
                                                        control={sendMoney.control}
                                                        name="bankBeneficiary"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div>
                                                                        <div className="relative">
                                                                            <input type="text" id="bankBeneficiary"
                                                                                   className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`}
                                                                                   placeholder=" " {...field} />
                                                                            <label htmlFor="beneficiary"
                                                                                   className={`primary-form-label !bg-[#f4f4f7] ${field.value && '!bg-white'} peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Nom
                                                                                du bénéficiaire
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={sendMoney.control}
                                                        name="bankZone"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className={`relative`}>
                                                                        <Select onValueChange={field.onChange}
                                                                                defaultValue={'uemoa'}>
                                                                            <SelectTrigger
                                                                                className={`w-full text-sm !pt-[.8rem] h-[2.8rem] rounded-lg border border-[#e4e4e4] pl-2.5 pr-1 font-normal`}
                                                                                style={{
                                                                                    backgroundColor: field.value ? '#fff' : '#fff',
                                                                                }}>
                                                                                <SelectValue placeholder=" "/>
                                                                            </SelectTrigger>
                                                                            <SelectContent className={`bg-[#f0f0f0]`}>
                                                                                <SelectItem
                                                                                    className={`text-sm px-7 flex items-center focus:bg-gray-100 font-normal`}
                                                                                    value={'uemoa'}>
                                                                                    UEMOA
                                                                                </SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <label htmlFor=""
                                                                               className={`primary-form-label !bg-white peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Zone
                                                                            des banques
                                                                        </label>
                                                                    </div>
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={sendMoney.control}
                                                        name="bankAccountNumber"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div>
                                                                        <div className="relative">
                                                                            <input onChange={(e) => {
                                                                                sendMoney.setValue('bankAccountNumber', e.target.value);
                                                                                getRibBank(e.target.value)
                                                                            }} ref={refBankAccountNumber} type="text"
                                                                                   id="bankAccountNumber"
                                                                                   className={`primary-form-input !pr-[3rem] h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`}
                                                                                   placeholder=" "/>
                                                                            <label htmlFor="bankAccountNumber"
                                                                                   className={`primary-form-label !bg-[#f4f4f7] ${field.value && '!bg-white'} peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>RIB
                                                                            </label>
                                                                            {/*{field.value}*/}
                                                                            <div
                                                                                className={`absolute top-0 right-0 h-full`}>
                                                                                <div
                                                                                    className={`flex items-center text-xs h-full pr-2`}>
                                                                                    {bankName && <div
                                                                                        className={`h-[1.6rem] w-[3rem] relative`}>
                                                                                        <Image
                                                                                            className={`object-contain`}
                                                                                            src={`/${lang}/images/banks-logo/${bankName}`}
                                                                                            alt={`${bankName}`} fill/>
                                                                                    </div>}
                                                                                    {/*<Image className={`h-[1.2rem] w-auto`} src={`/svg/LOGO VISA.svg`} alt={`master-card`} height={10} width={10} />*/}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={sendMoney.control}
                                                        name="bankAmount"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div>
                                                                        <div className="relative">
                                                                            <NumericFormat
                                                                                id="bankAmount"
                                                                                className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`}
                                                                                placeholder=" "
                                                                                thousandSeparator=" " suffix=" FCFA"
                                                                                value={field.value}
                                                                                onValueChange={(e) => {
                                                                                    sendMoney.setValue('bankAmount', e.value);
                                                                                }}/>
                                                                            {/*<input type="text" id="bankAmount" className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`} placeholder=" " {...field} />*/}
                                                                            <label htmlFor="bankAmount"
                                                                                   className={`primary-form-label !bg-[#f4f4f7] ${field.value && '!bg-white'} peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Montant
                                                                            </label>
                                                                            <Button type={`submit`}
                                                                                    className={`absolute rounded-lg p-3 top-0 right-0`}
                                                                                    disabled={true}>
                                                                                <Send
                                                                                    className={`h-[1.1rem] text-[#fff] `}/>
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            }
                                        </div>
                                    </Form>
                                </div>
                            }
                        </TabsContent>
                        <TabsContent value="link">
                            <div className={`mt-5 min-h-[20rem]`}>
                                <Form {...paymentLink}>
                                    <form onSubmit={paymentLink.handleSubmit(onSubmitPaymentLink)}
                                          className="space-y-3">
                                        <FormField
                                            control={paymentLink.control}
                                            name="accountNumber"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className={`relative`}>
                                                            <Select onValueChange={(value) => {
                                                                field.onChange(value);
                                                                getAccountNummberReference(value);
                                                            }} value={!field.value ? accounts[0]?.id : field.value}
                                                                    defaultValue={accounts[0]?.id}>
                                                                <SelectTrigger
                                                                    className={`w-full text-sm !pt-[.8rem] h-[2.8rem] rounded-lg border border-[#e4e4e4] pl-2.5 pr-1 font-normal`}
                                                                    style={{
                                                                        backgroundColor: field.value ? '#fff' : '#fff',
                                                                    }}>
                                                                    <SelectValue placeholder=" "/>
                                                                </SelectTrigger>
                                                                <SelectContent className={`bg-[#f0f0f0]`}>
                                                                    {
                                                                        accounts.map((account: IAccount) => (
                                                                            <SelectItem key={account.id}
                                                                                        className={`text-sm px-7 flex items-center focus:bg-gray-100 font-normal`}
                                                                                        value={account.id}>
                                                                                {!account.name || account.name == 'Main' ? "Compte principal" : `${account.name}`}
                                                                            </SelectItem>
                                                                        ))
                                                                    }
                                                                </SelectContent>
                                                            </Select>
                                                            <label htmlFor=""
                                                                   className={`primary-form-label !bg-white peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Compte
                                                                à créditer
                                                            </label>
                                                        </div>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={paymentLink.control}
                                            name="amount"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div>
                                                            <div className="relative">
                                                                <NumericFormat
                                                                    id="amount"
                                                                    className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`}
                                                                    placeholder=" "
                                                                    thousandSeparator=" " prefix="FCFA "
                                                                    value={field.value}
                                                                    onValueChange={(e) => {
                                                                        paymentLink.setValue('amount', e.value);
                                                                    }}/>
                                                                {/*<input type="text" id="bankAmount" className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`} placeholder=" " {...field} />*/}
                                                                <label htmlFor="amount"
                                                                       className={`primary-form-label !bg-[#f4f4f7] ${field.value && '!bg-white'} peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Montant
                                                                </label>
                                                                <PaymentLinkActions lang={lang}
                                                                                    paymentLink={paymentLink}
                                                                                    beneficiaries={beneficiaries}
                                                                                    merchant={merchant}
                                                                                    accounts={accounts}
                                                                                    activeSendMode={activeSendMode}/>
                                                                {/* <Button type={`submit`} className={`absolute rounded-lg p-3 top-0 right-0`}>
                                                                    <Send className={`h-[1.1rem] text-[#fff] `} />
                                                                </Button> */}
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </form>
                                </Form>
                            </div>
                        </TabsContent>
                        <TabsContent value="topup">
                            <div className={`flex justify-center items-center mt-5 min-h-[20rem]`}>
                                <div className={``}>
                                    <div className={`inline-flex flex-col justify-center`}>
                                        <span className={`text-xs text-[#7d7d7d] mt-1`}>Bientôt disponible</span>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}