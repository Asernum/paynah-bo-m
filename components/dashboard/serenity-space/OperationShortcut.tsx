"use client"

import {Locale} from "@/i18n.config";
import React, {useEffect, useRef, useState} from "react";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Plus, Send} from "lucide-react";
import Image from "next/image";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Button} from "@/components/ui/button";
import {NumericFormat} from "react-number-format";
import {PhoneInput, PhoneInputRefType, CountryData} from 'react-international-phone';
import 'react-international-phone/style.css';

interface OperationShortcutProps {
    lang: Locale
}

export default function OperationShortcut({lang}: OperationShortcutProps) {

    const [isLoading, setLoading] = useState(false);
    const [showConError, setShowConError] = useState(false);
    const [activeSendMode, setActiveSendMode] = useState('direct');
    // const [pCountry, setPCountry] = useState('');

    const refPhone = useRef<PhoneInputRefType>(null);

    const formSchema = z.object({
        beneficiary: z.string().min(1, {
            message: 'Le champ est requis'
        }),
        accountNumber: z.string(),
        bankAccountNumber: z.string(),
        bankAmount: z.string(),
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
        amount: z.string(),
    });

    const sendMoney = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            beneficiary: "",
            sendMode: "direct",
            accountNumber: "",
            mmAmount: "",
            mmCountry: "CI",
            amount: "",
            mmAccountNumber: "",
            mmOperator: "om",
            bankAmount: "",
            bankZone: "uemoa",
            bankAccountNumber: ""
        }
    });

    const paymentLink = useForm<z.infer<typeof formSchemaPaymentLink>>({
        resolver: zodResolver(formSchemaPaymentLink),
        defaultValues: {
            accountNumber: "om",
            amount: "",
        }
    });

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

    return (
        <div className={`operation-shortcut flex-grow`}>
            <div className={`bg-white rounded-2xl px-3 2xl:px-[.8rem] py-5 h-full`}>
                <h2 className={`font-medium text-base`}>Opérations rapides</h2>
                <div className={`mt-2`}>
                    <Tabs defaultValue="send" className="w-full rounded-2xl">
                        <TabsList className={`rounded-xl flex !bg-[#f0f0f0]`}>
                            <TabsTrigger className={`rounded-lg flex-1 px-1 2xl:px-2 text-[10.5px] 2xl:text-[11px]`} value="send">{`Envoi d'argent`}</TabsTrigger>
                            <TabsTrigger className={`rounded-lg flex-1 px-1 2xl:px-2 text-[10.5px] 2xl:text-[11px]`} value="link">{`Lien de paiement`}</TabsTrigger>
                            <TabsTrigger className={`rounded-lg flex-1 px-1 2xl:px-2 text-[10.5px] 2xl:text-[11px]`} value="topup">{`Rechargement`}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="send">
                            <div className={`mt-5 min-h-[20rem]`}>
                                <div className={`beneficiary-fav mb-5`}>
                                    <h3 className={`text-xs font-light text-gray-400`}>Bénéficiaires favoris</h3>
                                    <div className={`inline-flex space-x-1 mt-2`}>
                                        <Avatar className={`cursor-pointer`}>
                                            <AvatarFallback className={`bg-[#ffc5ae] text-[#ff723b]`}>AD</AvatarFallback>
                                        </Avatar>
                                        <Avatar className={`cursor-pointer`}>
                                            <AvatarFallback className={`bg-[#aedaff] text-[#31a1ff]`}>DB</AvatarFallback>
                                        </Avatar>
                                        <Avatar className={`cursor-pointer`}>
                                            <AvatarFallback className={`bg-[#e0aeff] text-[#bc51ff]`}>JK</AvatarFallback>
                                        </Avatar>
                                        <Avatar className={`cursor-pointer`}>
                                            <AvatarFallback className={`bg-[#aeffba] text-[#02b71a]`}>RA</AvatarFallback>
                                        </Avatar>
                                        <Avatar className={`cursor-pointer`}>
                                            <AvatarFallback className={`bg-[#ffadae] text-[#e03c3e]`}>YA</AvatarFallback>
                                        </Avatar>
                                        <button>
                                            <Avatar className={`cursor-pointer border border-[#cdcdcd] border-dashed`}>
                                                <AvatarFallback className={`bg-transparent text-[#cdcdcd]`}>
                                                    <Plus className={`h-4`} />
                                                </AvatarFallback>
                                            </Avatar>
                                        </button>
                                    </div>
                                </div>
                                <Form {...sendMoney}>
                                    <form onSubmit={sendMoney.handleSubmit(onSubmit)} className="space-y-3">
                                        <FormField
                                            control={sendMoney.control}
                                            name="beneficiary"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div>
                                                            <div className="relative">
                                                                <input type="text" id="beneficiary" className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`} placeholder=" " {...field} />
                                                                <label htmlFor="beneficiary"
                                                                       className={`primary-form-label !bg-[#f4f4f7] ${field.value && '!bg-white'} peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Nom du bénéficiaire
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <div className={``}>
                                            <div className={`border border-[#e4e4e4] flex items-center rounded-lg px-1 2xl:px-1 py-1 2xl:py-1`}>
                                                <div className={`flex items-center w-full`}>
                                                    <span className={`text-[10.5px] text-[#84818a] 2xl:text-[11px] font-normal whitespace-nowrap mr-1 2xl:mr-1`}>{`Mode d'envoi`}</span>
                                                    <div className={`w-full`}>
                                                        <FormField
                                                            control={sendMoney.control}
                                                            name="sendMode"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <RadioGroup
                                                                            onValueChange={field.onChange}
                                                                            defaultValue={field.value}
                                                                            className="flex items-center justify-between gap-0 rounded-lg !bg-[#f0f0f0] p-1 2xl:p-1 flex-row"
                                                                        >
                                                                            <FormItem onClick={() => triggerRadio('direct')} className="flex-1 items-center justify-center space-y-0">
                                                                                <button type={"button"} className={`w-full flex items-center justify-center rounded-lg ${field.value == 'direct' ? 'bg-white text-black' : 'text-[#64758b]'} whitespace-nowrap text-[10px] 2xl:text-[11px] font-medium px-1 2xl:px-2 py-1.5`}>
                                                                                    <svg className={`w-[.7rem] mr-1`} viewBox="0 0 44.203 44.203">
                                                                                        <defs>
                                                                                            <clipPath id="clip-path2">
                                                                                                <rect width="44.203" height="44.203"/>
                                                                                            </clipPath>
                                                                                        </defs>
                                                                                        <g transform="translate(0 -2)">
                                                                                            <g transform="translate(0 2)" clipPath="url(#clip-path2)">
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
                                                                            <FormItem onClick={() => triggerRadio('mm')} className="flex-1 items-center justify-center space-y-0">
                                                                                <button type={"button"} className={`w-full flex items-center justify-center rounded-lg ${field.value == 'mm' ? 'bg-white text-black' : 'text-[#64758b]'} whitespace-nowrap text-[10px] 2xl:text-[11px] font-medium px-1 2xl:px-2 py-1.5`}>
                                                                                    <span>Mobile Money</span>
                                                                                </button>
                                                                            </FormItem>
                                                                            <FormItem onClick={() => triggerRadio('bank')} className="flex-1 items-center justify-center space-y-0">
                                                                                <button type={"button"} className={`w-full flex items-center justify-center rounded-lg ${field.value == 'bank' ? 'bg-white text-black' : 'text-[#64758b]'} whitespace-nowrap text-[10px] 2xl:text-[11px] font-medium pl-1 pr-[2px] 2xl:px-2 py-1.5`}>
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
                                                                        <input type="text" id="accountNumber" className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`} placeholder=" " {...field} />
                                                                        <label htmlFor="accountNumber"
                                                                               className={`primary-form-label !bg-[#f4f4f7] ${field.value && '!bg-white'} peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Numéro de compte
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
                                                                            id="amount" className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`} placeholder=" " {...field}
                                                                            thousandSeparator=" " prefix="FCFA " />
                                                                        {/*<input type="text" id="bankAmount" className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`} placeholder=" " {...field} />*/}
                                                                        <label htmlFor="amount"
                                                                               className={`primary-form-label !bg-[#f4f4f7] ${field.value && '!bg-white'} peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Montant
                                                                        </label>
                                                                        <Button type={`submit`} className={`absolute rounded-lg p-3 top-0 right-0`}>
                                                                            <Send className={`h-[1.1rem] text-[#fff] `} />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        }
                                        {activeSendMode == "mm" &&
                                            <div className={`mm-form-inputs space-y-3`}>
                                                <FormField
                                                    control={sendMoney.control}
                                                    name="mmCountry"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <div className={`relative`}>
                                                                    <Select onValueChange={(value) => {field.onChange(value); changePhoneInputCountrySelect(value)}} defaultValue={'CI'}>
                                                                        <SelectTrigger className={`w-full text-sm !pt-[.8rem] h-[2.8rem] rounded-lg border border-[#e4e4e4] pl-2.5 pr-1 font-normal`} style={{
                                                                            backgroundColor: field.value ? '#fff' : '#fff',
                                                                        }}>
                                                                            <SelectValue placeholder=" "/>
                                                                        </SelectTrigger>
                                                                        <SelectContent className={`bg-[#f0f0f0] z-[100]`}>
                                                                            <SelectItem className={`text-sm px-7 flex items-center focus:bg-gray-100 font-normal`} value={'CI'}>
                                                                                <div className={`inline-flex items-center space-x-2.5`}>
                                                                                    <svg className={`w-[1.60rem] rounded-[3px]`} viewBox="0 0 38 25">
                                                                                        <defs>
                                                                                            <clipPath id="clip-path2">
                                                                                                <rect width="38" height="25" rx="3" transform="translate(0 -0.061)" fill="#fff"/>
                                                                                            </clipPath>
                                                                                        </defs>
                                                                                        <g transform="translate(0 0.061)" clipPath="url(#clip-path2)">
                                                                                            <g transform="translate(0.554 0.333)">
                                                                                                <path d="M0,4.5H36.765V29.009H0Z" transform="translate(0 -4.5)" fill="#f0f0f0"/>
                                                                                                <path d="M17.413,4.5H30.467V29.01H17.413Z" transform="translate(6.298 -4.5)" fill="#6da544"/>
                                                                                                <path d="M0,4.5H13.054V29.01H0Z" transform="translate(0 -4.5)" fill="#ff9811"/>
                                                                                            </g>
                                                                                        </g>
                                                                                    </svg>
                                                                                    <span className={`mt-[2px] text-sm`}>{`Côte d'Ivoire`}</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                            <SelectItem className={`text-sm px-7 flex items-center focus:bg-gray-100 font-normal`} value={'BJ'}>
                                                                                <div className={`inline-flex items-center space-x-2.5`}>
                                                                                    <svg className={`w-[1.60rem] rounded-[3px]`} viewBox="0 0 38 24">
                                                                                        <defs>
                                                                                            <clipPath id="clip-path2">
                                                                                                <rect width="38" height="24" rx="3" transform="translate(0 0)" fill="#fff"/>
                                                                                            </clipPath>
                                                                                        </defs>
                                                                                        <g transform="translate(0 0)" clipPath="url(#clip-path2)">
                                                                                            <g transform="translate(0.554 -0.157)">
                                                                                                <path d="M0,4.5H36.766V29.01H0Z" transform="translate(0 -4.5)" fill="#6da544"/>
                                                                                                <path d="M10.37,4.5H33.015V16.755H10.37Z" transform="translate(3.751 -4.5)" fill="#ffda44"/>
                                                                                                <path d="M10.37,13.5H33.015V25.755H10.37Z" transform="translate(3.751 -1.245)" fill="#d80027"/>
                                                                                            </g>
                                                                                        </g>
                                                                                    </svg>
                                                                                    <span className={`mt-[2px] text-sm`}>{`Bénin`}</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                            <SelectItem className={`text-sm px-7 flex items-center focus:bg-gray-100 font-normal`} value={'CM'}>
                                                                                <div className={`inline-flex items-center space-x-2.5`}>
                                                                                    <svg className={`w-[1.60rem] rounded-[3px]`} viewBox="0 0 38 24">
                                                                                        <defs>
                                                                                            <clipPath id="clip-path2">
                                                                                                <rect width="38" height="24" rx="3"
                                                                                                      transform="translate(0 -0.03)"
                                                                                                      fill="#fff"/>
                                                                                            </clipPath>
                                                                                        </defs>
                                                                                        <g transform="translate(0 0.03)"
                                                                                           clipPath="url(#clip-path2)">
                                                                                            <g transform="translate(0.554 0.088)">
                                                                                                <path d="M0,4.5H36.765V29.01H0Z"
                                                                                                      transform="translate(0 -4.5)"
                                                                                                      fill="#d80027"/>
                                                                                                <path d="M0,4.5H12.255V29.01H0Z"
                                                                                                      transform="translate(0 -4.5)"
                                                                                                      fill="#496e2d"/>
                                                                                                <path
                                                                                                    d="M20.58,4.5H32.835V29.01H20.58Zm-6.128,8.845.846,2.6h2.739l-2.216,1.61.846,2.605-2.216-1.61-2.216,1.61.847-2.605-2.216-1.61h2.739Z"
                                                                                                    transform="translate(3.93 -4.5)"
                                                                                                    fill="#ffda44"/>
                                                                                            </g>
                                                                                        </g>
                                                                                    </svg>
                                                                                    <span className={`mt-[2px] text-sm`}>{`Cameroun`}</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                            <SelectItem className={`text-sm px-7 flex items-center focus:bg-gray-100 font-normal`} value={'GN'}>
                                                                                <div className={`inline-flex items-center space-x-2.5`}>
                                                                                    <svg className={`w-[1.60rem] rounded-[3px]`} viewBox="0 0 38 24">
                                                                                        <defs>
                                                                                            <clipPath id="clip-path2">
                                                                                                <rect width="38" height="24" rx="3" transform="translate(0 -0.242)" fill="#fff"/>
                                                                                            </clipPath>
                                                                                        </defs>
                                                                                        <g transform="translate(0 0.242)" clipPath="url(#clip-path2)">
                                                                                            <g transform="translate(0.554 -0.573)">
                                                                                                <path id="Tracé_36" data-name="Tracé 36" d="M0,4.5H36.765V29.009H0Z" transform="translate(0 -4.5)" fill="#ffda44"/>
                                                                                                <path id="Tracé_37" data-name="Tracé 37" d="M17.413,4.5H30.467V29.01H17.413Z" transform="translate(6.298 -4.5)" fill="#6da544"/>
                                                                                                <path id="Tracé_38" data-name="Tracé 38" d="M0,4.5H13.054V29.01H0Z" transform="translate(0 -4.5)" fill="#d80027"/>
                                                                                            </g>
                                                                                        </g>
                                                                                    </svg>
                                                                                    <span className={`mt-[2px] text-sm`}>{`Guinée`}</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                            <SelectItem className={`text-sm px-7 flex items-center focus:bg-gray-100 font-normal`} value={'SN'}>
                                                                                <div className={`inline-flex items-center space-x-2.5`}>
                                                                                    <svg className={`w-[1.60rem] rounded-[3px]`} viewBox="0 0 38 24">
                                                                                        <defs>
                                                                                            <clipPath id="clip-path2">
                                                                                                <rect width="38" height="24" rx="3" transform="translate(0 -0.273)" fill="#fff"/>
                                                                                            </clipPath>
                                                                                        </defs>
                                                                                        <g transform="translate(0 0.273)" clipPath="url(#clip-path2)">
                                                                                            <g transform="translate(0.554 -0.328)">
                                                                                                <path d="M0,4.5H36.765V29.009H0Z" transform="translate(0 -4.5)" fill="#ffda44"/>
                                                                                                <path d="M17.413,4.5H30.467V29.01H17.413Z" transform="translate(6.298 -4.5)" fill="#d80027"/>
                                                                                                <path d="M0,4.5H13.054V29.01H0Zm18.382,7.992,1.058,3.256h3.424l-2.77,2.013,1.058,3.256L18.382,19l-2.77,2.012,1.058-3.256L13.9,15.748h3.424Z" transform="translate(0 -4.5)" fill="#496e2d"/>
                                                                                            </g>
                                                                                        </g>
                                                                                    </svg>
                                                                                    <span className={`mt-[2px] text-sm`}> {`Sénégal`}</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <label htmlFor=""
                                                                           className={`primary-form-label !bg-white peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Pays opérateur
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
                                                                                }  as React.CSSProperties
                                                                            }
                                                                            defaultCountry={`ci`}
                                                                            forceDialCode={true}
                                                                            ref={refPhone}
                                                                            hideDropdown={true}
                                                                            placeholder=" "
                                                                        />
                                                                        <label htmlFor="mmAccountNumber"
                                                                               className={`primary-form-label !bg-white peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-4`}>Numéro de compte
                                                                        </label>
                                                                        <div className={`absolute top-0 left-0`}>
                                                                            <FormField
                                                                                control={sendMoney.control}
                                                                                name="mmOperator"
                                                                                render={({field}) => (
                                                                                    <FormItem>
                                                                                        <FormControl>
                                                                                            <div>
                                                                                                <Select onValueChange={field.onChange} defaultValue={'om'}>
                                                                                                    <SelectTrigger className={`w-[4rem] h-[2.8rem] rounded-l-lg rounded-r-none border border-[#e4e4e4] pl-2.5 pr-1 font-light`} style={{
                                                                                                        backgroundColor: field.value ? '#fff' : '#fff',
                                                                                                    }}>
                                                                                                        <SelectValue  placeholder="Opérateur"/>
                                                                                                    </SelectTrigger>
                                                                                                    <SelectContent className={`bg-[#f0f0f0] !w-[2rem] z-[100]`}>
                                                                                                        <SelectItem className={`font-light px-7 flex items-center focus:bg-gray-100`} value={'om'}>
                                                                                                            <Image className={`h-[1.6rem] w-[1.6rem]`} src={`/${lang}/images/ORANGE-MONEY.png`} alt={`om`} height={512} width={512} />
                                                                                                        </SelectItem>
                                                                                                        <SelectItem className={`font-light px-7 flex items-center focus:bg-gray-100`} value={'mtn'}>
                                                                                                            <Image className={`h-[1.8rem] w-[1.8rem]`} src={`/${lang}/images/MTN MOMO.png`} alt={`mtn`} height={512} width={512} />
                                                                                                        </SelectItem>
                                                                                                        <SelectItem className={`font-light px-7 flex items-center focus:bg-gray-100`} value={'moov'}>
                                                                                                            <Image className={`h-[1.8rem] w-[1.8rem]`} src={`/${lang}/images/MOOV MONEY.png`} alt={`moov`} height={512} width={512} />
                                                                                                        </SelectItem>
                                                                                                        <SelectItem className={`font-light px-7 flex items-center focus:bg-gray-100`} value={'wave'}>
                                                                                                            <Image className={`h-[1.8rem] w-[1.8rem]`} src={`/${lang}/images/WAVE.png`} alt={`wave`} height={512} width={512} />
                                                                                                        </SelectItem>
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
                                                                            id="mmAmount" className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`} placeholder=" " {...field}
                                                                            thousandSeparator=" " prefix="FCFA " />
                                                                        {/*<input type="text" id="bankAmount" className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`} placeholder=" " {...field} />*/}
                                                                        <label htmlFor="mmAmount"
                                                                               className={`primary-form-label !bg-[#f4f4f7] ${field.value && '!bg-white'} peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Montant
                                                                        </label>
                                                                        <Button type={`submit`} className={`absolute rounded-lg p-3 top-0 right-0`}>
                                                                            <Send className={`h-[1.1rem] text-[#fff] `} />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        }
                                        {activeSendMode == "bank" &&
                                            <div className={`bank-form-inputs space-y-3`}>
                                                <FormField
                                                    control={sendMoney.control}
                                                    name="bankZone"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <div className={`relative`}>
                                                                    <Select onValueChange={field.onChange} defaultValue={'uemoa'}>
                                                                        <SelectTrigger className={`w-full text-sm !pt-[.8rem] h-[2.8rem] rounded-lg border border-[#e4e4e4] pl-2.5 pr-1 font-normal`} style={{
                                                                            backgroundColor: field.value ? '#fff' : '#fff',
                                                                        }}>
                                                                            <SelectValue placeholder=" "/>
                                                                        </SelectTrigger>
                                                                        <SelectContent className={`bg-[#f0f0f0]`}>
                                                                            <SelectItem className={`text-sm px-7 flex items-center focus:bg-gray-100 font-normal`} value={'uemoa'}>
                                                                                UEMOA
                                                                            </SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <label htmlFor=""
                                                                           className={`primary-form-label !bg-white peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Zone des banques
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
                                                                        <input type="text" id="bankAccountNumber" className={`primary-form-input !pr-[6rem] h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`} placeholder=" " {...field} />
                                                                        <label htmlFor="bankAccountNumber"
                                                                               className={`primary-form-label !bg-[#f4f4f7] ${field.value && '!bg-white'} peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Numéro de compte
                                                                        </label>
                                                                        <div className={`absolute top-0 right-0 h-full`}>
                                                                            <div className={`flex items-center h-full pr-2`}>
                                                                                {/*<Image className={`h-[1.2rem] w-auto mr-1`} src={`/svg/LOGO MASTERCARD.svg`} alt={`master-card`} height={10} width={10} />*/}
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
                                                                            id="bankAmount" className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`} placeholder=" " {...field}
                                                                            thousandSeparator=" " prefix="FCFA " />
                                                                        {/*<input type="text" id="bankAmount" className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`} placeholder=" " {...field} />*/}
                                                                        <label htmlFor="bankAmount"
                                                                               className={`primary-form-label !bg-[#f4f4f7] ${field.value && '!bg-white'} peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Montant
                                                                        </label>
                                                                        <Button type={`submit`} className={`absolute rounded-lg p-3 top-0 right-0`}>
                                                                            <Send className={`h-[1.1rem] text-[#fff] `} />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        }
                                    </form>
                                </Form>
                            </div>
                        </TabsContent>
                        <TabsContent value="link">
                            <div className={`mt-5 min-h-[20rem]`}>
                                <Form {...paymentLink}>
                                    <form onSubmit={paymentLink.handleSubmit(onSubmitPaymentLink)} className="space-y-3">
                                        <FormField
                                            control={paymentLink.control}
                                            name="accountNumber"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className={`relative`}>
                                                            <Select onValueChange={field.onChange} defaultValue={'om'}>
                                                                <SelectTrigger className={`w-full text-sm !pt-[.8rem] h-[2.8rem] rounded-lg border border-[#e4e4e4] pl-2.5 pr-1 font-normal`} style={{
                                                                    backgroundColor: field.value ? '#fff' : '#fff',
                                                                }}>
                                                                    <SelectValue placeholder=" "/>
                                                                </SelectTrigger>
                                                                <SelectContent className={`bg-[#f0f0f0]`}>
                                                                    <SelectItem className={`text-sm px-7 flex items-center focus:bg-gray-100 font-normal`} value={'om'}>
                                                                        Compte principal
                                                                    </SelectItem>
                                                                    <SelectItem className={`text-sm px-7 flex items-center focus:bg-gray-100 font-normal`} value={'mtn'}>
                                                                         Salariale
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <label htmlFor=""
                                                                   className={`primary-form-label !bg-white peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Compte à créditer
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
                                                                    id="amount" className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`} placeholder=" " {...field}
                                                                    thousandSeparator=" " prefix="FCFA " />
                                                                {/*<input type="text" id="bankAmount" className={`primary-form-input h-[2.8rem] peer !bg-[#f4f4f7] focus:border focus:border-[#e4e4e4] ${field.value && '!bg-white border border-[#e4e4e4]'} focus:!bg-white`} placeholder=" " {...field} />*/}
                                                                <label htmlFor="amount"
                                                                       className={`primary-form-label !bg-[#f4f4f7] ${field.value && '!bg-white'} peer-focus:!bg-white peer-focus:px-2 peer-focus:text-[#818181] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-3.5 left-5`}>Montant
                                                                </label>
                                                                <Button type={`submit`} className={`absolute rounded-lg p-3 top-0 right-0`}>
                                                                    <Send className={`h-[1.1rem] text-[#fff] `} />
                                                                </Button>
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