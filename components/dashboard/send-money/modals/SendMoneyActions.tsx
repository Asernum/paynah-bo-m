"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  PhoneInput,
  PhoneInputRefType,
  CountryData,
} from "react-international-phone";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Banknote,
  ClipboardList,
  Goal,
  Pencil,
  Search,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { formatCFA } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NumericFormat } from "react-number-format";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import BeneficiaryActions from "@/components/dashboard/send-money/modals/BeneficiaryActions";
import { IUser } from "@/core/interfaces/user";
import { getMerchantBeneficiaries } from "@/core/apis/beneficiary";
import { getCountries, getCountryOperators } from "@/core/apis/country";
import { getMerchantBankAccounts } from "@/core/apis/bank-account";
import { ICountry } from "@/core/interfaces/country";
import { IOperator } from "@/core/interfaces/operator";
import { IBeneficiary } from "@/core/interfaces/beneficiary";
import { IAccount } from "@/core/interfaces/account";
import { login } from "@/core/apis/login";
import { initPayout } from "@/core/apis/payment";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";
import { FlagImage } from "react-international-phone";
import Image from "next/image";
interface MainActionsProps {
  lang: string;
  merchant: IUser;
  children: React.ReactNode;
  countries?: ICountry[];
  accounts: IAccount[];
  beneficiaries: IBeneficiary[];
}

const defaultAccount = {
  id: "",
  reference: "",
  coreBankId: "",
  bankAccountId: "",
  balance: 0,
  name: "",
  balanceDayMinus1: 0,
  isMain: false,
  skaleet_balance: 0,
};
const defaultBeneficiary = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  infos: [],
};

export const RANDOM_AVATAR_COLORS_CONFIG = [
  { bg: "#ffc5ae", text: "#ff723b" },
  { bg: "#aedaff", text: "#31a1ff" },
  { bg: "#e0aeff", text: "#bc51ff" },
  { bg: "#aeffba", text: "#02b71a" },
  { bg: "#ffadae", text: "#e03c3e" },
];

export default function SendMoneyActions({
  lang,
  merchant,
  countries,
  accounts,
  beneficiaries,
  children,
}: MainActionsProps) {
  const [step, setStep] = useState(1);
  const [account, setAccount] = useState<IAccount>(defaultAccount);
  const [beneficiary, setBeneficiary] =
    useState<IBeneficiary>(defaultBeneficiary);
  const [existBenef, setExistBenef] = useState(true);
  const [payFees, setPayFees] = useState(false);
  const [amount, setAmount] = useState("0");
  const [totalAmount, setTotalAmount] = useState("");
  const [reason, setReason] = useState("");
  const [percentage, setPercentage] = useState("w-1/6");

  const [errorMessage, setErrorMessage] = useState("");
  const [showConError, setShowConError] = useState(false);
  const [confirmStep, setConfirmStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [country, setCountry] = useState("CI");
  const [isLoading, setLoading] = useState(false);
  const [beneficiariesSearch, setBeneficiaries] =
    useState<IBeneficiary[]>(beneficiaries);
  const [accountsSearch, setAccounts] = useState<IAccount[]>(accounts);
  // const [countries, setCountries] = useState([]);
  const [operators, setOperators] = useState([]);
  const [displayBeneficiaryForm, setDisplayBeneficiaryForm] = useState(false);
  const [activeSendModeSelected, setActiveSendModeSelected] =
    useState("direct");
  const [operator, setOperator] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [isSendLoading, setIsSendLoading] = useState(false);

  const refPhone = useRef<PhoneInputRefType>(null);

  const formSchema = z
    .object({
      // lastName: z.string().min(2, {message: 'veuillez saisir votre nom'}),
      // firstName: z.string().min(2, {message: 'veuillez saisir votre prénoms'}),
      // email: z.string().email({message: 'veuillez saisir votre email'}),
      lastName: z.string(),
      firstName: z.string(),
      email: z.string(),
      beneficiary: z.string(),
      amount: z.number(),
      sendMode: z.string(),
      accountNumber: z.string(),
      country: z.string(),
      mmAccountNumber: z.string(),
      mmOperator: z.string(),
    })
    .refine(
      (data) => {
        if (data.sendMode == "direct") {
          return data.accountNumber.trim().length > 0;
        }
        return true;
      },
      {
        message: "veuillez saisir un numéro de compte",
        path: ["accountNumber"],
      }
    )
    .refine(
      (data) => {
        if (data.sendMode == "mm") {
          return data.mmAccountNumber.trim().length > 4;
        }
        return true;
      },
      {
        message: "veuillez saisir votre numéro de téléphone",
        path: ["mmAccountNumber"],
      }
    )
    .refine(
      (data) => {
        if (data.sendMode == "mm") {
          return data.mmOperator.trim().length > 0;
        }
        return true;
      },
      {
        message: "veuillez choisir un opérateur",
        path: ["mmAccountNumber"],
      }
    )
    .refine(
      (data) => {
        if (displayBeneficiaryForm) {
          return data.lastName.trim().length > 2;
        }
        return true;
      },
      {
        message: "veuillez saisir votre nom",
        path: ["lastName"],
      }
    )
    .refine(
      (data) => {
        if (displayBeneficiaryForm) {
          return data.firstName.trim().length > 2;
        }
        return true;
      },
      {
        message: "veuillez saisir votre prénoms",
        path: ["firstName"],
      }
    )
    .refine(
      (data) => {
        if (displayBeneficiaryForm) {
          const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(data.email);
        }
        return true;
      },
      {
        message: "veuillez saisir votre email",
        path: ["email"],
      }
    );

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const sendMoneyForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      email: "",
      beneficiary: "",
      amount: 0,
      sendMode: "direct",
      accountNumber: "",
      country: "",
      mmAccountNumber: "",
      mmOperator: "",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = sendMoneyForm;

  const transformBeneficiaryFullNameToBeneficiaryAvatar = (
    beneficiaryFullName: string
  ) => {
    const beneficiaryFullNameSplit =
      beneficiaryFullName.trim().length > 0
        ? beneficiaryFullName.split(" ")
        : [];
    const beneficiaryFullNameAvatar =
      beneficiaryFullNameSplit.length > 0
        ? beneficiaryFullNameSplit.length >= 2
          ? `${beneficiaryFullNameSplit[0][0]}${beneficiaryFullNameSplit[1][0]}`
          : `${beneficiaryFullNameSplit[0][0]}`
        : "";
    return beneficiaryFullNameAvatar;
  };

  function updateFormValue(value: any) {
    if (step == 1) {
      setAccount(value);
      setStep(2);
      setPercentage("w-2/6");
    } else if (step == 2) {
      setBeneficiary(value);
      setStep(3);
      setPercentage("w-3/6");
    }
  }

  function changePhoneInputCountrySelect(value: string) {
    refPhone.current?.setCountry(value.toLowerCase());
  }

  async function triggerRadio(inputName: "direct" | "mm" | "bank") {
    sendMoneyForm.setValue("sendMode", inputName);
    setActiveSendModeSelected(inputName);
  }

  function updateBeneficiaryData(beneficiary: IBeneficiary) {
    setBeneficiary(beneficiary);
    setStep(3);
    setPercentage("w-3/6");
  }

  function updateAccountData(account: IAccount) {
    setAccount(account);
    setStep(4);
    setPercentage("w-4/6");
  }

  function showBeneficiaryForm() {
    if (displayBeneficiaryForm) {
      // resetCreateBeneficiaryValues();
    }
    setDisplayBeneficiaryForm(!displayBeneficiaryForm);
  }

  const checkSendMode = (data: any) => {
    try {
      console.log(data);
      formSchema.parse(data); // Valider les données
      nextStep();
    } catch (error) {
      console.error("Erreur de validation du formulaire :", error);
    }
  };

  const addNewBeneficiary = (data: any) => {
    try {
      formSchema.parse(data); // Valider les données
      updateBeneficiaryData(data);
    } catch (error) {
      console.error("Erreur de validation du formulaire :", error);
    }
  };

  const initSendMoneyPayload = () => {
    // const amount = 'XXXX  100 000 000';
    const startIndex = amount.indexOf(" ") + 1; // Get index after first space
    const endIndex = amount.length;
    const extractedNumber = amount.substring(startIndex, endIndex);
    const amountConverted = parseInt(extractedNumber.split(" ").join(""));
    sendMoneyForm.setValue("amount", amountConverted);

    if (activeSendModeSelected == "mm") {
      setOperator(
        sendMoneyForm.getValues("country") +
          "_" +
          sendMoneyForm.getValues("mmOperator")
      );
      setAccountNumber(sendMoneyForm.getValues("mmAccountNumber"));
    }
    if (activeSendModeSelected == "direct") {
      setAccountNumber(sendMoneyForm.getValues("accountNumber"));
    }

    setConfirmStep(1);
    setStep(0);
    setPercentage("w-full");
  };

  const authenticateMerchant = async (password: string) => {
    // @ts-ignore
    let isAuthenticate = false;
    if (password.trim().length > 0) {
      const payload = {
        username: merchant.login,
        password: password,
      };
      try {
        await login(payload, false);
        setShowConError(false);
        setErrorMessage("");
        isAuthenticate = true;
      } catch (error) {
        setShowConError(true);
        setErrorMessage("Identifiants invalides");
      }
    } else {
      setShowConError(true);
      setErrorMessage("veuillez saisir votre clé d'accès");
    }
    return isAuthenticate;
  };

  function nextStep() {
    const finalStep = 6;
    if (step < finalStep) {
      const nextStep = step + 1;
      setStep(nextStep);
      if (confirmStep == 1) {
        setPercentage("w-full");
      } else {
        setPercentage(`w-${nextStep}/${finalStep}`);
      }
    }

    console.log("NEXTSTEP - CONFIRM - PERC", step, confirmStep, percentage);

    // if (step < 5) {
    //     setStep(step + 1);

    //     if (step + 1 == 5) {
    //         setPercentage('w-full');
    //     } else if (step + 1 == 4) {
    //         setPercentage('w-4/6');
    //     } else if (step + 1 == 3) {
    //         setPercentage('w-3/6');
    //     } else {
    //         setPercentage('w-2/6');
    //     }
    // }
  }

  function prevStep() {
    const finalStep = 6;
    if (confirmStep == 1) {
      setStep(5);
      setConfirmStep(0);
      setPercentage(`w-5/6`);
    } else {
      if (step > 1) {
        const nextStep = step - 1;
        nextStep == 2 && setDisplayBeneficiaryForm(false);
        setStep(nextStep);
        setPercentage(`w-${nextStep}/${finalStep}`);
      }
    }
    console.log("PREVSTEP - CONFIRM - PERC", step, confirmStep, percentage);

    // if (step > 1) {
    //     setStep(step - 1);

    //     if (step - 1 == 1) {
    //         setPercentage('w-1/6');
    //     } else if (step - 1 == 2) {
    //         setPercentage('w-2/6');
    //     } else if (step - 1 == 3) {
    //         setPercentage('w-3/6');
    //     } else {
    //         setPercentage('w-4/6');
    //     }
    // }
  }

  async function sendMoneyAction() {
    setIsSendLoading(true);
    // @ts-ignore
    // const operator = 'OCI';
    // const accountNumber = sendMoneyForm.getValues('accountNumber');
    const payload = {
      bankAccountId: account.id,
      firstName: beneficiary.firstName,
      lastName: beneficiary.lastName,
      operator: activeSendModeSelected == "mm" ? operator : "",
      phoneNumber: activeSendModeSelected == "mm" ? accountNumber : "",
      paynahAccount: activeSendModeSelected == "direct" ? accountNumber : "",
      bankAccount: activeSendModeSelected == "bank" ? accountNumber : "",
      amount: sendMoneyForm.getValues("amount"),
      mode: activeSendModeSelected,
      feeSupport: payFees,
    };
    console.log(payload);
    const isAuthenticate = await authenticateMerchant(accessKey);
    if (isAuthenticate) {
      // @ts-ignore
      initPayout(
        payload,
        String(merchant?.merchantsIds[0]?.id),
        String(merchant.accessToken)
      )
        .then((data) => {
          //   console.log(data);
          setIsSendLoading(false);
          if (data.success) {
            setErrorMessage("");
            // setStep(5);
            setConfirmStep(2);
            // setPercentage('w-full');
          } else {
            return toast.error(data.message, {
              className:
                "!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium",
            });
          }
        })
        .catch((err) => {
          setIsSendLoading(false);
          return toast.error("Une erreur est survénue", {
            className:
              "!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium",
          });
        });
    }
    setIsSendLoading(false);
  }

  function downloadTicket() {
    console.log("downloadTicket");
  }

  function resetSendMoneyValues() {
    setStep(1);
    setAccount(defaultAccount);
    setBeneficiary(defaultBeneficiary);
    setExistBenef(true);
    setPayFees(false);
    setAmount("0");
    setTotalAmount("");
    setReason("");
    setPercentage("w-1/6");
    setDisplayBeneficiaryForm(false);

    setConfirmStep(0);
    setShowPassword(false);
    setAccessKey("");
    setErrorMessage("");
    setIsSendLoading(false);
    setShowConError(false);

    setValue("lastName", "");
    setValue("firstName", "");
    setValue("email", "");
    setValue("accountNumber", "");
  }

  function searchAccount(e: React.ChangeEvent<HTMLInputElement>) {
    const keyword = e.target.value;
    let accountsMatch = [...accounts];
    if (keyword.trim().length > 0 && keyword.trim().length < 3) {
      accountsMatch = [...accountsSearch];
    } else {
      accountsMatch = accounts.filter(
        (account) => account.coreBankId.search(keyword) !== -1
      );
    }
    // console.log(accountsMatch);
    setAccounts(accountsMatch);
  }

  function searchBeneficiary(e: React.ChangeEvent<HTMLInputElement>) {
    const keyword = e.target.value;
    let beneficiariesMatch = [...beneficiaries];
    if (keyword.trim().length > 0 && keyword.trim().length < 3) {
      beneficiariesMatch = [...beneficiariesSearch];
    } else {
      beneficiariesMatch = beneficiaries.filter(
        (beneficiary) =>
          beneficiary.lastName.search(keyword) !== -1 ||
          beneficiary.firstName.search(keyword) !== -1 ||
          beneficiary.email.search(keyword) !== -1
      );
    }
    // console.log(beneficiariesMatch);
    setBeneficiaries(beneficiariesMatch);
  }

  function fetchCountryOperators(countryCode: string) {
    // console.log(countryCode, countries);
    // @ts-ignore
    const countryFilter: Icountry[] =
      countries && countries.length > 0
        ? countries.filter((country: ICountry) => country.code == countryCode)
        : [];
    const countryId = countryFilter[0]?.id;
    // console.log(countryId);
    getCountryOperators(String(countryId), String(merchant.accessToken))
      .then((data) => {
        // console.log(1, data);
        setOperators(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }

  useEffect(() => {
    console.log("INIT", step);
    setAccounts(accounts);
    setBeneficiaries(beneficiaries);
    fetchCountryOperators("CI");
    if (payFees) {
      const amountWithoutString = amount.match(/\d+/g)?.join("");
      const amountNumber = parseInt(amountWithoutString ?? "0");
      const finalAmountNumber = amountNumber * (1 / 100) + amountNumber;
      const finalAmount = formatCFA(finalAmountNumber);
      setTotalAmount(finalAmount);
    } else {
      setTotalAmount(amount);
    }
  }, [amount, payFees, accounts, beneficiaries]);

  // console.log(accounts, accountsSearch);
  // console.log(beneficiaries, beneficiariesSearch);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent
          className={`${
            confirmStep == 0 && step != 1
              ? "sm:max-w-[52rem] xl:max-w-[56rem] 2xl:max-w-[59rem]"
              : "sm:max-w-[40rem]"
          }  overflow-x-hidden duration-200 !rounded-3xl bg-[#f4f4f7] px-3 py-3`}
        >
          <div>
            <div className={`rounded-t-2xl bg-white px-8 pb-4 pt-5`}>
              <div className={`flex justify-between items-center space-x-3`}>
                <h2
                  className={`text-base text-[#626262] font-medium`}
                >{`Envoi d'argent`}</h2>
                <DialogClose
                  onClick={() => {
                    setStep(1);
                    setPercentage("w-1/6");
                    setConfirmStep(0);
                    resetSendMoneyValues();
                  }}
                >
                  <X strokeWidth={2.4} className={`text-[#767676] h-5 w-5`} />
                </DialogClose>
              </div>
            </div>
            <div className={`h-1 bg-[#cfcfcf]`}>
              <div
                className={`h-full ${percentage} duration-200 bg-black`}
              ></div>
            </div>
          </div>

          <div className={`min-h-[6rem] pt-2 pb-4 px-8`}>
            <Form {...sendMoneyForm}>
              {/*Step 1*/}
              <div
                className={`${
                  step == 1 ? "flex" : "hidden"
                } items-center justify-between space-x-3`}
              >
                <h3
                  className={`text-sm font-medium`}
                >{`1- Choisissez le mode d'envoi`}</h3>
                {/* <div className={`relative`}>
                                    <Input type={`text`} className={`font-normal pl-9 bg-white text-xs rounded-full h-[2.8rem] w-[15rem]`}
                                           placeholder="Recherchez un compte" onChange={(e) => console.log(e.target.value) }/>
                                    <Search className={`absolute h-4 w-4 top-3.5 left-3`} />
                                </div> */}
              </div>

              {/*Step 2*/}
              <div
                className={`${
                  step == 2 ? "flex" : "hidden"
                } items-center justify-between space-x-3`}
              >
                <h3 className={`text-sm font-medium`}>
                  2- Choisissez le bénéficiaire
                </h3>
                <div className={`relative`}>
                  {!displayBeneficiaryForm && (
                    <>
                      <Input
                        type={`text`}
                        className={`font-normal pl-9 bg-white text-xs rounded-full h-[2.8rem] w-[15rem]`}
                        placeholder="Recherchez un bénéficiaire"
                        onChange={(e) => searchBeneficiary(e)}
                      />
                      <Search className={`absolute h-4 w-4 top-3.5 left-3`} />
                    </>
                  )}
                </div>
              </div>

              {/*Step 3*/}
              <div
                className={`${
                  step == 3 ? "flex" : "hidden"
                } items-center justify-between space-x-3`}
              >
                <h3 className={`text-sm font-medium`}>
                  3- Choisissez le compte à débiter
                </h3>
                <div className={`relative`}>
                  <Input
                    type={`text`}
                    className={`font-normal pl-9 bg-white text-xs rounded-full h-[2.8rem] w-[15rem]`}
                    placeholder="Recherchez un compte"
                    onChange={(e) => searchAccount(e)}
                  />
                  <Search className={`absolute h-4 w-4 top-3.5 left-3`} />
                </div>
              </div>

              <div className={`mt-4`}>
                {/*Step 1*/}
                <div className={`${step == 1 ? "flex" : "hidden"} flex-col`}>
                  <div className={``}>
                    <div
                      className={`flex items-center rounded-lg px-1 2xl:px-1 py-1 2xl:py-1`}
                    >
                      <div className={`flex items-center w-full`}>
                        {/* <span
                                                    className={`text-[10.5px] text-[#84818a] 2xl:text-[11px] font-normal whitespace-nowrap mr-1 2xl:mr-1`}>{`Mode d'envoi`}</span> */}
                        <div className={`w-full`}>
                          <FormField
                            control={sendMoneyForm.control}
                            name="sendMode"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex items-center justify-between gap-0 rounded-lg !bg-[#f0f0f0] p-2 2xl:p-2 flex-row"
                                  >
                                    <FormItem
                                      onClick={() => triggerRadio("direct")}
                                      className="flex-1 items-center justify-center space-y-0"
                                    >
                                      <button
                                        type={"button"}
                                        className={`w-full flex items-center justify-center rounded-lg ${
                                          field.value == "direct"
                                            ? "bg-white text-black"
                                            : "text-[#64758b]"
                                        } whitespace-nowrap text-[10px] 2xl:text-[11px] font-medium px-1 2xl:px-2 py-3`}
                                      >
                                        <svg
                                          className={`w-[.7rem] mr-1`}
                                          viewBox="0 0 44.203 44.203"
                                        >
                                          <defs>
                                            <clipPath id="clip-path2">
                                              <rect
                                                width="44.203"
                                                height="44.203"
                                              />
                                            </clipPath>
                                          </defs>
                                          <g transform="translate(0 -2)">
                                            <g
                                              transform="translate(0 2)"
                                              clipPath="url(#clip-path2)"
                                            >
                                              <path
                                                d="M22.1,0C5.319,0,0,5.319,0,22.1S5.319,44.2,22.1,44.2s22.1-5.319,22.1-22.1S38.884,0,22.1,0m0,40.746C7.944,40.746,3.458,36.259,3.458,22.1S7.944,3.457,22.1,3.457,40.745,7.944,40.745,22.1,36.259,40.746,22.1,40.746"
                                                transform="translate(0 0)"
                                              />
                                              <path
                                                d="M39.814,20.3a8.227,8.227,0,0,0-5.73-2.075h-10.6v22.5h4.06v-7.31a4.455,4.455,0,0,1,0-4.28V22.046h6.268a4.366,4.366,0,0,1,2.959,1.05,3.351,3.351,0,0,1,1.191,2.673A3.267,3.267,0,0,1,36.775,28.4a4.428,4.428,0,0,1-2.961,1.029H30.36a2.15,2.15,0,0,0,.111,3.759h3.5a8.4,8.4,0,0,0,5.808-2.074A6.958,6.958,0,0,0,42.1,25.706a7.006,7.006,0,0,0-2.29-5.408"
                                                transform="translate(-8.464 -6.567)"
                                              />
                                            </g>
                                          </g>
                                        </svg>
                                        <span className="text-sm">Direct</span>
                                      </button>
                                    </FormItem>
                                    <FormItem
                                      onClick={() => triggerRadio("mm")}
                                      className="flex-1 items-center justify-center space-y-0"
                                    >
                                      <button
                                        type={"button"}
                                        className={`w-full flex items-center justify-center rounded-lg ${
                                          field.value == "mm"
                                            ? "bg-white text-black"
                                            : "text-[#64758b]"
                                        } whitespace-nowrap text-[10px] 2xl:text-[11px] font-medium px-1 2xl:px-2 py-3`}
                                      >
                                        <span className="text-sm">
                                          Mobile Money
                                        </span>
                                      </button>
                                    </FormItem>
                                    {/* <FormItem onClick={() => triggerRadio('bank')} className="flex-1 items-center justify-center space-y-0">
                                                                            <button type={"button"} className={`w-full flex items-center justify-center rounded-lg ${field.value == 'bank' ? 'bg-white text-black' : 'text-[#64758b]'} whitespace-nowrap text-[10px] 2xl:text-[11px] font-medium pl-1 pr-[2px] 2xl:px-2 py-1.5`}>
                                                                                <span>Virement</span>
                                                                            </button>
                                                                        </FormItem> */}
                                  </RadioGroup>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*Step select send mode */}
                  <div className={`mt-3`}>
                    {activeSendModeSelected == "direct" && (
                      <form
                        onSubmit={undefined}
                        className={`${step == 2 && "hidden"} space-y-5 gap-6`}
                      >
                        <div className={`flex items-center gap-5`}>
                          <div className={"w-full"}>
                            <FormField
                              control={sendMoneyForm.control}
                              name="accountNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <div className={`inline-flex space-x-3`}>
                                    <h3 className={`text-sm font-medium`}>
                                      Numéro de compte
                                    </h3>
                                  </div>
                                  <FormControl className={""}>
                                    <div>
                                      <Input
                                        type={`text`}
                                        className={`font-light text-sm ${
                                          showConError && "border-[#e95d5d]"
                                        }`}
                                        placeholder="Entrez le numéro de compte"
                                        {...field}
                                        style={{
                                          backgroundColor: field.value
                                            ? "#fff"
                                            : "#f0f0f0",
                                        }}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage className={`text-xs`}>
                                    {errors.accountNumber &&
                                      (errors.accountNumber.message as string)}
                                  </FormMessage>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </form>
                    )}
                    {
                      // changePhoneInputCountrySelect(value); fetchCountryOperators(value);
                      activeSendModeSelected == "mm" && (
                        <form
                          onSubmit={undefined}
                          className={`${step == 2 && "hidden"} space-y-5 gap-6`}
                        >
                          <div className={`flex items-center gap-5`}>
                            <div className={"w-full"}>
                              <FormField
                                control={sendMoneyForm.control}
                                name="country"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className={`inline-flex space-x-3`}>
                                      <h3 className={`text-sm font-medium`}>
                                        Pays Opérateur
                                      </h3>
                                    </div>
                                    <FormControl>
                                      <div>
                                        <Select
                                          onValueChange={(value) => {
                                            field.onChange(value);
                                            changePhoneInputCountrySelect(
                                              value
                                            );
                                            setCountry(value);
                                            fetchCountryOperators(value);
                                          }}
                                          defaultValue={"CI"}
                                        >
                                          <SelectTrigger
                                            className={`w-full ${
                                              showConError &&
                                              "!border-[#e95d5d]"
                                            } px-4 font-light text-sm ${
                                              showConError && "border-[#e95d5d]"
                                            }`}
                                            style={{
                                              backgroundColor: field.value
                                                ? "#fff"
                                                : "#f0f0f0",
                                            }}
                                          >
                                            <SelectValue placeholder="Choisir un type de compte" />
                                          </SelectTrigger>
                                          <SelectContent
                                            className={`z-[999] bg-[#f0f0f0]`}
                                          >
                                            {countries &&
                                              countries.map(
                                                (country: ICountry) => (
                                                  <SelectItem
                                                    key={country.id}
                                                    className={`text-sm px-7 flex items-center focus:bg-gray-100 font-normal`}
                                                    value={country.code}
                                                  >
                                                    <div
                                                      className={`inline-flex items-center space-x-2.5`}
                                                    >
                                                      <FlagImage
                                                        className={`w-7`}
                                                        iso2={country.code.toLowerCase()}
                                                      />
                                                      <span
                                                        className={`mt-[2px] text-sm`}
                                                      >
                                                        {country.name}
                                                      </span>
                                                    </div>
                                                  </SelectItem>
                                                )
                                              )}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </FormControl>
                                    <FormMessage className={`text-xs`}>
                                      {errors.country &&
                                        (errors.country.message as string)}
                                    </FormMessage>
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div
                              className={
                                "w-full relative flex items-center justify-center"
                              }
                            >
                              <FormField
                                control={sendMoneyForm.control}
                                name="mmAccountNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className={`inline-flex space-x-3`}>
                                      <h3 className={`text-sm font-medium`}>
                                        Numéro de compte
                                      </h3>
                                    </div>
                                    <FormControl>
                                      <div>
                                        <div className="relative">
                                          <PhoneInput
                                            {...field}
                                            className={`mt-[.5rem] op-tel`}
                                            style={
                                              {
                                                "--react-international-phone-text-color":
                                                  "#000",
                                                "--react-international-phone-border-color":
                                                  "#f0f0f0",
                                                "--react-international-phone-height":
                                                  "2.8rem",
                                                "--react-international-phone-font-size":
                                                  "14px",
                                                "--react-international-phone-border-radius":
                                                  "0.5rem",
                                              } as React.CSSProperties
                                            }
                                            defaultCountry={country}
                                            forceDialCode={true}
                                            ref={refPhone}
                                            hideDropdown={true}
                                            placeholder=" "
                                          />
                                          <div
                                            className={`absolute top-0 left-0`}
                                          >
                                            <FormField
                                              control={sendMoneyForm.control}
                                              name="mmOperator"
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormControl>
                                                    <div>
                                                      <Select
                                                        onValueChange={
                                                          field.onChange
                                                        }
                                                        defaultValue={operator}
                                                      >
                                                        <SelectTrigger
                                                          className={`w-[4rem] selectedItemMM h-[2.8rem] rounded-l-lg !pb-[0px] rounded-r-none border border-[#e4e4e4] pl-2.5 pr-1 font-light`}
                                                          style={{
                                                            backgroundColor:
                                                              field.value
                                                                ? "#fff"
                                                                : "#fff",
                                                          }}
                                                        >
                                                          <SelectValue placeholder="Opérateur" />
                                                        </SelectTrigger>
                                                        <SelectContent
                                                          className={`bg-[#f0f0f0] !w-[10rem] z-[999]`}
                                                        >
                                                          {operators &&
                                                            operators.map(
                                                              (
                                                                operator: IOperator
                                                              ) => (
                                                                <SelectItem
                                                                  key={
                                                                    operator.id
                                                                  }
                                                                  className={`font-normal px-7 flex items-center focus:bg-gray-100 h-[2.4rem] cursor-pointer`}
                                                                  value={
                                                                    operator.code
                                                                  }
                                                                >
                                                                  <div
                                                                    className={`inline-flex items-center space-x-2.5`}
                                                                  >
                                                                    <Image
                                                                      className={`h-[1.6rem] w-[1.6rem]`}
                                                                      src={
                                                                        operator.logoUrl
                                                                      }
                                                                      alt={
                                                                        operator.code
                                                                      }
                                                                      height={
                                                                        512
                                                                      }
                                                                      width={
                                                                        512
                                                                      }
                                                                    />
                                                                    <span
                                                                      className={`mm-label`}
                                                                    >
                                                                      {
                                                                        operator.name
                                                                      }
                                                                    </span>
                                                                  </div>
                                                                </SelectItem>
                                                              )
                                                            )}
                                                        </SelectContent>
                                                      </Select>
                                                    </div>
                                                  </FormControl>
                                                  <FormMessage
                                                    className={`text-xs`}
                                                  >
                                                    {errors.mmAccountNumber &&
                                                      (errors.mmAccountNumber
                                                        .message as string)}
                                                  </FormMessage>
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
                            </div>
                          </div>
                        </form>
                      )
                    }
                  </div>
                </div>

                {/*Step 2*/}
                <div className={`${step == 2 ? "flex" : "hidden"} flex-col`}>
                  <div className={`mb-3`}>
                    <div
                      className={`inline-flex text-sm font-normal space-x-1 rounded-lg py-1 px-1 bg-[#f0f0f0]`}
                    >
                      <button
                        onClick={() => showBeneficiaryForm()}
                        type={"button"}
                        className={`${
                          !displayBeneficiaryForm
                            ? "bg-white px-3 py-1.5 rounded-lg"
                            : "px-3 py-1.5"
                        }`}
                      >
                        Bénéficiaires enregistrés
                      </button>
                      <button
                        onClick={() => showBeneficiaryForm()}
                        type={"button"}
                        className={`${
                          displayBeneficiaryForm
                            ? "bg-white px-3 py-1.5 rounded-lg"
                            : "px-3 py-1.5"
                        }`}
                      >
                        Nouveau bénéficiaire
                      </button>
                    </div>
                  </div>
                  <div className={`mt-1`}>
                    {!displayBeneficiaryForm && (
                      <div className={`grid grid-cols-3 gap-3`}>
                        {beneficiariesSearch &&
                          beneficiariesSearch.length > 0 &&
                          beneficiariesSearch.map(
                            (beneficiary: IBeneficiary, index: number) => (
                              <div
                                key={beneficiary.id}
                                onClick={() =>
                                  updateBeneficiaryData(beneficiary)
                                }
                                className={`bg-white inline-flex items-center cursor-pointer space-x-2 rounded-lg p-2 ${
                                  beneficiary.id == "1" &&
                                  "outline outline-offset-2 outline-2 outline-[#3c3c3c]"
                                }`}
                              >
                                <Avatar className={`cursor-pointer`}>
                                  <AvatarFallback
                                    className={`bg-[${
                                      RANDOM_AVATAR_COLORS_CONFIG[index % 5].bg
                                    }] text-[${
                                      RANDOM_AVATAR_COLORS_CONFIG[index % 5]
                                        .text
                                    }]`}
                                  >
                                    {transformBeneficiaryFullNameToBeneficiaryAvatar(
                                      `${beneficiary.lastName} ${beneficiary.firstName}`
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`inline-flex flex-col`}>
                                  <h3
                                    className={`text-xs font-medium`}
                                  >{`${beneficiary.firstName} ${beneficiary.lastName}`}</h3>
                                  {/* <span className={`text-xs text-[#626262]`}>{index}</span> */}
                                  <span
                                    className={`text-xs block mt-[2px] text-[#626262] break-all leading-3`}
                                  >
                                    {beneficiary.email}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    )}
                    {displayBeneficiaryForm && (
                      <div className={``}>
                        <form
                          onSubmit={undefined}
                          className={`${step == 3 && "hidden"} space-y-5 gap-6`}
                        >
                          <div className={`flex items-center gap-5`}>
                            <div className={"w-1/3"}>
                              <FormField
                                control={sendMoneyForm.control}
                                name="lastName"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className={`inline-flex space-x-3`}>
                                      <h3 className={`text-sm font-medium`}>
                                        Nom
                                      </h3>
                                    </div>
                                    <FormControl className={""}>
                                      <div>
                                        <Input
                                          type={`text`}
                                          className={`font-light text-sm ${
                                            showConError && "border-[#e95d5d]"
                                          }`}
                                          placeholder="Entrez votre nom"
                                          {...field}
                                          style={{
                                            backgroundColor: field.value
                                              ? "#fff"
                                              : "#f0f0f0",
                                          }}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage className={`text-xs`}>
                                      {errors.lastName &&
                                        (errors.lastName.message as string)}
                                    </FormMessage>
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className={"w-2/3"}>
                              <FormField
                                control={sendMoneyForm.control}
                                name="firstName"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className={`inline-flex space-x-3`}>
                                      <h3 className={`text-sm font-medium`}>
                                        Prénoms
                                      </h3>
                                    </div>
                                    <FormControl className={""}>
                                      <div>
                                        <Input
                                          type={`text`}
                                          className={`font-light text-sm ${
                                            showConError && "border-[#e95d5d]"
                                          }`}
                                          placeholder="Entrez votre prénoms"
                                          {...field}
                                          style={{
                                            backgroundColor: field.value
                                              ? "#fff"
                                              : "#f0f0f0",
                                          }}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage className={`text-xs`}>
                                      {errors.firstName &&
                                        (errors.firstName.message as string)}
                                    </FormMessage>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          <div className={`gap-5`}>
                            <div className={""}>
                              <FormField
                                control={sendMoneyForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className={`inline-flex space-x-3`}>
                                      <h3 className={`text-sm font-medium`}>
                                        Email
                                      </h3>
                                    </div>
                                    <FormControl className={""}>
                                      <div>
                                        <Input
                                          type={`text`}
                                          className={`font-light text-sm ${
                                            showConError && "border-[#e95d5d]"
                                          }`}
                                          placeholder="Entrez votre email"
                                          {...field}
                                          style={{
                                            backgroundColor: field.value
                                              ? "#fff"
                                              : "#f0f0f0",
                                          }}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage className={`text-xs`}>
                                      {errors.email &&
                                        (errors.email.message as string)}
                                    </FormMessage>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>

                {/*Step 3*/}
                <div
                  className={`p-1 space-x-2.5 2xl:min-h-[10rem] max-w-[54rem] snap-x snap-mandatory overflow-x-auto ${
                    step == 3 ? "flex" : "hidden"
                  }`}
                >
                  {accountsSearch &&
                    accountsSearch.map((account: IAccount) => (
                      <div
                        key={account.id}
                        onClick={() => updateAccountData(account)}
                        className={`snap-end shrink-0 w-[40%] 2xl:w-[35%] bg-white flex flex-col justify-between cursor-pointer ${
                          account.id == "3" &&
                          "outline outline-offset-2 outline-2 outline-[#3c3c3c]"
                        } space-y-6 2xl:space-y-6 p-4 rounded-3xl`}
                      >
                        <div className={`flex justify-between items-start`}>
                          <div>
                            <div className={`inline-flex flex-col`}>
                              <div
                                className={`mb-1 rounded-xl p-2 bg-[#f0f0f0] w-[2.7rem] h-[2.7rem] inline-flex justify-center items-center`}
                              >
                                <svg
                                  className={`h-[1.1rem] fill-[#767676] w-auto`}
                                  viewBox="0 0 19.474 17.751"
                                >
                                  <defs>
                                    <clipPath id="clipPath1">
                                      <rect width="19.474" height="17.751" />
                                    </clipPath>
                                  </defs>
                                  <g transform="translate(0)">
                                    <g
                                      transform="translate(0)"
                                      clipPath="url(#clipPath1)"
                                    >
                                      <path
                                        d="M18.422,131.245v.295c0,.477,0,.954,0,1.431a2.758,2.758,0,0,1-2.792,2.786q-6.191,0-12.381,0a4.087,4.087,0,0,1-1.4-.157A2.762,2.762,0,0,1,0,132.973c0-2.774,0-5.548,0-8.323a3.5,3.5,0,0,1,.2-1.361,2.764,2.764,0,0,1,2.566-1.728q6.432,0,12.863,0a2.743,2.743,0,0,1,2.7,2.075,2.966,2.966,0,0,1,.085.663c.012.555,0,1.109,0,1.664,0,.028,0,.057-.009.1H15.7a2.586,2.586,0,0,0-.235,5.165c.924.031,1.849.01,2.774.012h.184"
                                        transform="translate(0 -118.007)"
                                      />
                                      <path
                                        d="M466.573,292.279c.486,0,.973,0,1.459,0a.906.906,0,0,1,.96.96q0,1.145,0,2.291a.9.9,0,0,1-.949.958c-.978,0-1.955.008-2.933,0a2.1,2.1,0,0,1-.055-4.2c.505-.018,1.012,0,1.517,0v0m-1.438,2.844v-.01c.078,0,.156,0,.233,0a.729.729,0,0,0-.034-1.458c-.141,0-.282,0-.422,0a.726.726,0,0,0-.124,1.435,3.1,3.1,0,0,0,.347.032"
                                        transform="translate(-449.52 -283.733)"
                                      />
                                      <path
                                        d="M232.826,2.991q2.429-1.4,4.859-2.805a1.238,1.238,0,0,1,1.748.471c.1.163.189.328.295.512l-6.9,1.848,0-.027"
                                        transform="translate(-226.02 0)"
                                      />
                                      <path
                                        d="M301.2,56.416h-6.9l-.006-.017c.036-.013.072-.029.109-.039q2.519-.675,5.039-1.349a1.292,1.292,0,0,1,1.639.937c.041.149.079.3.123.468"
                                        transform="translate(-285.691 -53.352)"
                                      />
                                    </g>
                                  </g>
                                </svg>
                              </div>
                              <span
                                className={`text-[12px] font-normal text-[#626262] -mb-0.5`}
                              >
                                {account.name
                                  ? account.name
                                  : account.isMain
                                  ? "Compte Principal"
                                  : "Compte"}
                              </span>
                              <span
                                className={`text-[11px] font-light text-[#afafaf]`}
                              >
                                {account.coreBankId}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`flex justify-between items-center space-x-3 border-t border-[#d0d0d0] pt-1`}
                        >
                          <div className={`inline-flex flex-col`}>
                            <h3
                              className={`text-[10px] font-light text-[#afafaf] -mb-0.5`}
                            >
                              Solde actuel
                            </h3>
                            <span className={`text-sm font-semibold`}>
                              {formatCFA(account.balance)}
                            </span>
                          </div>
                          <div className={`inline-flex flex-col`}>
                            <h3
                              className={`text-[10px] font-light text-[#afafaf] -mb-0.5`}
                            >
                              Solde disponible
                            </h3>
                            <span className={`text-sm font-semibold`}>
                              {formatCFA(account.skaleet_balance)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  <div className={`w-0.5 snap-end`}></div>
                </div>

                {/*Step 4*/}
                <div
                  className={`${
                    step == 4 ? "flex" : "hidden"
                  } flex-col mb-4 -mt-3`}
                >
                  <div className={`grid grid-cols-2 gap-x-6 gap-y-4`}>
                    <div>
                      <div className={`inline-flex space-x-3`}>
                        <h3 className={`text-sm font-medium`}>
                          1- Bénéficiaire
                        </h3>
                        <button onClick={() => setStep(1)}>
                          <SquarePen className={`h-4 w-4`} />
                        </button>
                      </div>
                      <div className={`mt-2.5 w-full`}>
                        <div
                          className={`bg-white w-full inline-flex items-center space-x-2 rounded-lg py-3 px-2.5`}
                        >
                          <Goal className={`text-[#767676] h-5 w-5`} />
                          <span
                            className={`w-full text-sm ${
                              reason == "" && "text-center"
                            } font-normal capitalize`}
                          >
                            {activeSendModeSelected == ""
                              ? "-"
                              : activeSendModeSelected}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className={`inline-flex space-x-3`}>
                        <h3 className={`text-sm font-medium`}>
                          2- Bénéficiaire
                        </h3>
                        <button onClick={() => setStep(2)}>
                          <SquarePen className={`h-4 w-4`} />
                        </button>
                      </div>
                      <div className={`w-full mt-2.5`}>
                        <div
                          className={`bg-white w-full inline-flex items-center space-x-2 rounded-lg p-2.5`}
                        >
                          <Avatar className={`cursor-pointer`}>
                            <AvatarFallback
                              className={`bg-[#ffc5ae] text-[#ff723b]`}
                            >
                              AD
                            </AvatarFallback>
                          </Avatar>
                          <div className={`inline-flex flex-col`}>
                            <h3
                              className={`text-xs font-medium`}
                            >{`${beneficiary?.firstName} ${beneficiary?.lastName}`}</h3>
                            {/* <span className={`text-xs text-[#626262]`}>+225 07 09 87 35 23</span> */}
                            <span
                              className={`text-xs -mt-[1px] text-[#626262]`}
                            >{`${beneficiary?.email}`}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className={`inline-flex space-x-3`}>
                        <h3 className={`text-sm font-medium`}>
                          3- Compte à débiter
                        </h3>
                        <button onClick={() => setStep(3)}>
                          <SquarePen className={`h-4 w-4`} />
                        </button>
                      </div>
                      <div className={`mt-2.5`}>
                        <div
                          className={`snap-end shrink-0 w-[100%] bg-white flex flex-row items-end justify-between space-x-3 2xl:space-y-6 px-2 py-2.5 rounded-xl`}
                        >
                          <div className={`flex justify-between items-start`}>
                            <div>
                              <div
                                className={`inline-flex flex-row items-center space-x-2`}
                              >
                                <div
                                  className={`mb-1 rounded-xl p-2 bg-[#f0f0f0] w-[2.7rem] h-[2.7rem] inline-flex justify-center items-center`}
                                >
                                  <svg
                                    className={`h-[1.1rem] fill-[#767676] w-auto`}
                                    viewBox="0 0 19.474 17.751"
                                  >
                                    <defs>
                                      <clipPath id="clipPath1">
                                        <rect width="19.474" height="17.751" />
                                      </clipPath>
                                    </defs>
                                    <g transform="translate(0)">
                                      <g
                                        transform="translate(0)"
                                        clipPath="url(#clipPath1)"
                                      >
                                        <path
                                          d="M18.422,131.245v.295c0,.477,0,.954,0,1.431a2.758,2.758,0,0,1-2.792,2.786q-6.191,0-12.381,0a4.087,4.087,0,0,1-1.4-.157A2.762,2.762,0,0,1,0,132.973c0-2.774,0-5.548,0-8.323a3.5,3.5,0,0,1,.2-1.361,2.764,2.764,0,0,1,2.566-1.728q6.432,0,12.863,0a2.743,2.743,0,0,1,2.7,2.075,2.966,2.966,0,0,1,.085.663c.012.555,0,1.109,0,1.664,0,.028,0,.057-.009.1H15.7a2.586,2.586,0,0,0-.235,5.165c.924.031,1.849.01,2.774.012h.184"
                                          transform="translate(0 -118.007)"
                                        />
                                        <path
                                          d="M466.573,292.279c.486,0,.973,0,1.459,0a.906.906,0,0,1,.96.96q0,1.145,0,2.291a.9.9,0,0,1-.949.958c-.978,0-1.955.008-2.933,0a2.1,2.1,0,0,1-.055-4.2c.505-.018,1.012,0,1.517,0v0m-1.438,2.844v-.01c.078,0,.156,0,.233,0a.729.729,0,0,0-.034-1.458c-.141,0-.282,0-.422,0a.726.726,0,0,0-.124,1.435,3.1,3.1,0,0,0,.347.032"
                                          transform="translate(-449.52 -283.733)"
                                        />
                                        <path
                                          d="M232.826,2.991q2.429-1.4,4.859-2.805a1.238,1.238,0,0,1,1.748.471c.1.163.189.328.295.512l-6.9,1.848,0-.027"
                                          transform="translate(-226.02 0)"
                                        />
                                        <path
                                          d="M301.2,56.416h-6.9l-.006-.017c.036-.013.072-.029.109-.039q2.519-.675,5.039-1.349a1.292,1.292,0,0,1,1.639.937c.041.149.079.3.123.468"
                                          transform="translate(-285.691 -53.352)"
                                        />
                                      </g>
                                    </g>
                                  </svg>
                                </div>
                                <div>
                                  <span
                                    className={`block text-[12px] font-normal leading-3 text-[#626262] -mb-0.5`}
                                  >
                                    {account?.name
                                      ? account?.name
                                      : account?.isMain
                                      ? "Compte Principal"
                                      : "Compte"}
                                  </span>
                                  <span
                                    className={`block text-[10px] mt-1 font-light text-[#afafaf]`}
                                  >
                                    {account?.coreBankId}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`flex flex-row justify-between items-start space-x-2`}
                          >
                            <div className={`inline-flex flex-col`}>
                              <h3
                                className={`text-[9px] font-light text-[#afafaf] -mb-0.5`}
                              >
                                Solde actuel
                              </h3>
                              <span className={`text-[11px] font-semibold`}>
                                {formatCFA(account?.balance)}
                              </span>
                            </div>
                            <div className={`inline-flex flex-col`}>
                              <h3
                                className={`text-[9px] font-light text-[#afafaf] -mb-0.5`}
                              >
                                Solde disponible
                              </h3>
                              <span className={`text-[11px] font-semibold`}>
                                {formatCFA(account?.skaleet_balance)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className={`inline-flex space-x-3`}>
                        <h3 className={`text-sm font-medium`}>4- Montant</h3>
                      </div>
                      <div className={`relative mt-2`}>
                        <NumericFormat
                          value={amount}
                          className={`primary-form-input !pr-[12rem] !pt-2 h-[2.8rem] peer !bg-white focus:border focus:border-[#e4e4e4] focus:!bg-white`}
                          placeholder=" "
                          thousandSeparator=" "
                          prefix="FCFA "
                          onChange={(e) => {
                            setAmount(e.target.value);
                          }}
                        />

                        <div className={`absolute right-1 top-[4.4px]`}>
                          <div
                            className={`inline-flex text-xs font-normal space-x-1 rounded-lg py-1 px-1 bg-[#f0f0f0]`}
                          >
                            <button
                              onClick={() => setAmount("FCFA 100 000")}
                              type={"button"}
                              className={`${
                                amount == "FCFA 100 000" &&
                                "bg-white text-center rounded-lg"
                              } px-1 py-1.5`}
                            >
                              100.000
                            </button>
                            <button
                              onClick={() => setAmount("FCFA 300 000")}
                              type={"button"}
                              className={`${
                                amount == "FCFA 300 000" &&
                                "bg-white text-center rounded-lg"
                              } px-1 py-1.5`}
                            >
                              300.000
                            </button>
                            <button
                              onClick={() => setAmount("FCFA 500 000")}
                              type={"button"}
                              className={`${
                                amount == "FCFA 500 000" &&
                                "bg-white text-center rounded-lg"
                              } px-1 py-1.5`}
                            >
                              500.000
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className={`w-full`}>
                        <div className={`inline-flex space-x-3`}>
                          <h3 className={`text-sm font-medium`}>5- Motif</h3>
                        </div>
                        <div className={`relative mt-2 w-full`}>
                          <Input
                            type={`text`}
                            className={`font-normal bg-white text-xs w-full rounded-lg h-[2.8rem]`}
                            placeholder="Entrez une raison"
                            onChange={(e) => setReason(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/*Step 5*/}
                <div
                  className={`${
                    step == 5 ? "flex" : "hidden"
                  } flex-col mb-4 -mt-3`}
                >
                  <div className={`grid grid-cols-2 gap-x-6 gap-y-4`}>
                    <div>
                      <div className={`inline-flex space-x-3`}>
                        <h3 className={`text-sm text-[#626262] font-normal`}>
                          {"Mode d'envoi"}
                        </h3>
                        <button onClick={() => setStep(1)}>
                          <SquarePen className={`text-[#626262] h-4 w-4`} />
                        </button>
                      </div>
                      <div className={`mt-2.5 w-full`}>
                        <div
                          className={`bg-white w-full inline-flex items-center space-x-2 rounded-lg py-3 px-2.5`}
                        >
                          <Goal className={`text-[#767676] h-5 w-5`} />
                          <span
                            className={`w-full text-sm ${
                              reason == "" && "text-center"
                            } font-normal capitalize`}
                          >
                            {activeSendModeSelected == ""
                              ? "-"
                              : activeSendModeSelected}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className={`inline-flex space-x-3`}>
                        <h3 className={`text-sm text-[#626262] font-normal`}>
                          Bénéficiaire
                        </h3>
                        <button onClick={() => setStep(2)}>
                          <SquarePen className={`text-[#626262] h-4 w-4`} />
                        </button>
                      </div>
                      <div className={`w-full mt-2.5`}>
                        <div
                          className={`bg-white w-full inline-flex items-center space-x-2 rounded-lg p-2.5`}
                        >
                          <Avatar className={`cursor-pointer`}>
                            <AvatarFallback
                              className={`bg-[#ffc5ae] text-[#ff723b]`}
                            >
                              AD
                            </AvatarFallback>
                          </Avatar>
                          <div className={`inline-flex flex-col`}>
                            <h3
                              className={`text-xs font-medium`}
                            >{`${beneficiary?.firstName} ${beneficiary?.lastName}`}</h3>
                            {/* <span className={`text-xs text-[#626262]`}>+225 07 09 87 35 23</span> */}
                            <span
                              className={`text-xs -mt-[1px] text-[#626262]`}
                            >{`${beneficiary?.email}`}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className={`inline-flex space-x-3`}>
                        <h3 className={`text-sm text-[#626262] font-normal`}>
                          Compte à débiter
                        </h3>
                        <button onClick={() => setStep(3)}>
                          <SquarePen className={`text-[#626262] h-4 w-4`} />
                        </button>
                      </div>
                      <div className={`mt-2.5`}>
                        <div
                          className={`snap-end shrink-0 w-[100%] bg-white flex flex-row items-end justify-between space-x-3 2xl:space-y-6 px-2 py-2.5 rounded-xl`}
                        >
                          <div className={`flex justify-between items-start`}>
                            <div>
                              <div
                                className={`inline-flex flex-row items-center space-x-2`}
                              >
                                <div
                                  className={`mb-1 rounded-xl p-2 bg-[#f0f0f0] w-[2.7rem] h-[2.7rem] inline-flex justify-center items-center`}
                                >
                                  <svg
                                    className={`h-[1.1rem] fill-[#767676] w-auto`}
                                    viewBox="0 0 19.474 17.751"
                                  >
                                    <defs>
                                      <clipPath id="clipPath1">
                                        <rect width="19.474" height="17.751" />
                                      </clipPath>
                                    </defs>
                                    <g transform="translate(0)">
                                      <g
                                        transform="translate(0)"
                                        clipPath="url(#clipPath1)"
                                      >
                                        <path
                                          d="M18.422,131.245v.295c0,.477,0,.954,0,1.431a2.758,2.758,0,0,1-2.792,2.786q-6.191,0-12.381,0a4.087,4.087,0,0,1-1.4-.157A2.762,2.762,0,0,1,0,132.973c0-2.774,0-5.548,0-8.323a3.5,3.5,0,0,1,.2-1.361,2.764,2.764,0,0,1,2.566-1.728q6.432,0,12.863,0a2.743,2.743,0,0,1,2.7,2.075,2.966,2.966,0,0,1,.085.663c.012.555,0,1.109,0,1.664,0,.028,0,.057-.009.1H15.7a2.586,2.586,0,0,0-.235,5.165c.924.031,1.849.01,2.774.012h.184"
                                          transform="translate(0 -118.007)"
                                        />
                                        <path
                                          d="M466.573,292.279c.486,0,.973,0,1.459,0a.906.906,0,0,1,.96.96q0,1.145,0,2.291a.9.9,0,0,1-.949.958c-.978,0-1.955.008-2.933,0a2.1,2.1,0,0,1-.055-4.2c.505-.018,1.012,0,1.517,0v0m-1.438,2.844v-.01c.078,0,.156,0,.233,0a.729.729,0,0,0-.034-1.458c-.141,0-.282,0-.422,0a.726.726,0,0,0-.124,1.435,3.1,3.1,0,0,0,.347.032"
                                          transform="translate(-449.52 -283.733)"
                                        />
                                        <path
                                          d="M232.826,2.991q2.429-1.4,4.859-2.805a1.238,1.238,0,0,1,1.748.471c.1.163.189.328.295.512l-6.9,1.848,0-.027"
                                          transform="translate(-226.02 0)"
                                        />
                                        <path
                                          d="M301.2,56.416h-6.9l-.006-.017c.036-.013.072-.029.109-.039q2.519-.675,5.039-1.349a1.292,1.292,0,0,1,1.639.937c.041.149.079.3.123.468"
                                          transform="translate(-285.691 -53.352)"
                                        />
                                      </g>
                                    </g>
                                  </svg>
                                </div>
                                <div>
                                  <span
                                    className={`block text-[12px] font-normal leading-3 text-[#626262] -mb-0.5`}
                                  >
                                    {account?.name
                                      ? account?.name
                                      : account?.isMain
                                      ? "Compte Principal"
                                      : "Compte"}
                                  </span>
                                  <span
                                    className={`block text-[10px] mt-1 font-light text-[#afafaf]`}
                                  >
                                    {account?.coreBankId}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`flex flex-row justify-between items-start space-x-2`}
                          >
                            <div className={`inline-flex flex-col`}>
                              <h3
                                className={`text-[9px] font-light text-[#afafaf] -mb-0.5`}
                              >
                                Solde actuel
                              </h3>
                              <span className={`text-[11px] font-semibold`}>
                                {formatCFA(account?.balance)}
                              </span>
                            </div>
                            <div className={`inline-flex flex-col`}>
                              <h3
                                className={`text-[9px] font-light text-[#afafaf] -mb-0.5`}
                              >
                                Solde disponible
                              </h3>
                              <span className={`text-[11px] font-semibold`}>
                                {formatCFA(account?.skaleet_balance)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className={`inline-flex space-x-3`}>
                        <h3 className={`text-sm text-[#626262] font-normal`}>
                          Montant
                        </h3>
                        <button onClick={() => setStep(4)}>
                          <SquarePen className={`text-[#626262] h-4 w-4`} />
                        </button>
                      </div>
                      <div className={`mt-2.5 w-full`}>
                        <div
                          className={`bg-white w-full inline-flex items-center space-x-2 rounded-lg py-3 px-2.5`}
                        >
                          <Banknote className={`text-[#767676] h-5 w-5`} />
                          <span className={`text-sm font-normal`}>
                            {amount}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <Checkbox
                          onCheckedChange={(checked) => {
                            checked == "indeterminate"
                              ? setPayFees(false)
                              : setPayFees(checked);
                          }}
                          className={`bg-white border-[#dfdfdf]`}
                          id="fees"
                        />
                        <label
                          htmlFor="fees"
                          className="text-xs text-[#777778] cursor-pointer font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Payer les frais{" "}
                          <span className={`text-black`}>(1%)</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <div className={`w-full`}>
                        <div className={`inline-flex space-x-3`}>
                          <h3 className={`text-sm text-[#626262] font-normal`}>
                            Motif
                          </h3>
                          <button onClick={() => setStep(4)}>
                            <SquarePen className={`text-[#626262] h-4 w-4`} />
                          </button>
                        </div>
                        <div className={`mt-2.5 w-full`}>
                          <div
                            className={`bg-white w-full inline-flex items-center space-x-2 rounded-lg py-3 px-2.5`}
                          >
                            <Goal className={`text-[#767676] h-5 w-5`} />
                            <span
                              className={`w-full text-sm ${
                                reason == "" && "text-center"
                              } font-normal`}
                            >
                              {reason == "" ? "-" : reason}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className={`w-full`}>
                        <div className={`inline-flex space-x-3 mt-3`}>
                          <h3 className={`text-sm text-[#626262] font-normal`}>
                            Montant total
                          </h3>
                        </div>
                        <div className={`mt-1 w-full`}>
                          <div
                            className={`bg-white w-full inline-flex items-center space-x-2 rounded-lg py-3 px-2.5`}
                          >
                            <Banknote className={`text-[#767676] h-5 w-5`} />
                            <span className={`text-sm font-medium`}>
                              {totalAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/*Confirm 1*/}
                <div
                  className={`${
                    confirmStep == 1 ? "flex" : "hidden"
                  } flex-col mb-4 -mt-3`}
                >
                  <div className={`w-[70%] mx-auto`}>
                    <div className={`flex flex-col items-center`}>
                      <svg
                        className={`w-32 h-auto`}
                        viewBox="0 0 136.22 124.183"
                      >
                        <defs>
                          <clipPath id="clip-pathConfirm">
                            <rect width="136.22" height="124.183" fill="none" />
                          </clipPath>
                        </defs>
                        <g clipPath="url(#clip-pathConfirm)">
                          <path
                            d="M97.532,86.1c-1.421,4.278-2.629,8.42-4.166,12.437A69.633,69.633,0,0,1,80.3,119.66a10.445,10.445,0,0,1-3.626,2.162c-1.081.485-2.349.549-3.438,1.021-6.519,2.83-12.716.578-18.852-1.291-19.568-5.962-33.239-18.8-42.27-36.849C5.49,71.459,2.122,57.253.061,42.682c-.342-2.421.761-3.845,2.78-4.979,6.792-3.813,12.242-8.948,15.4-16.215A32.587,32.587,0,0,0,20.928,8.079c-.031-3.848.755-4.684,4.434-5.64A68.7,68.7,0,0,1,45.475.1c5.989.235,12,.01,18-.1a4.649,4.649,0,0,1,4.843,3.015c3.7,8.112,9.23,14.388,17.859,17.6a5.214,5.214,0,0,1,2.592,3c2.585,7.822,4.977,15.707,7.431,23.572.149.477.3.954.48,1.544,2.9-3.754,3.743-4.1,8.212-3.526a38.344,38.344,0,0,1-2.337-4.068c-.717-1.662-.816-3.436.717-4.791,1.517-1.341,3.266-.873,4.641.069,3.678,2.517,7.366,5.059,10.774,7.919,7.571,6.353,13.717,13.8,16.451,23.545,1.661,5.919,1.727,11.763-2.024,17.032-3.858,5.419-9.537,6.733-15.731,6.357A52.841,52.841,0,0,1,97.532,86.1M87.267,35.012c-.9-2.5-1.864-5.388-3.017-8.2a3.812,3.812,0,0,0-1.829-1.725A38.266,38.266,0,0,1,65.337,8.818,4.607,4.607,0,0,0,60.775,6.28c-4.931.11-9.863.119-14.8.154-3.3.024-4.06.616-4.584,3.942a39.056,39.056,0,0,1-16.661,26.67c-2.548,1.808-3.325,3.6-2.748,6.673,2.468,13.161,6.031,25.912,12.873,37.56Q48.5,104.5,74.763,110.486c1.818.418,3.353.351,4.61-1.338A66.781,66.781,0,0,0,90.8,85.813c.753-2.929.731-2.934-2.382-4.1-3.124,4.041-7.654,5.7-12.455,6.861-1.812.44-3.634.862-5.406,1.429-6.711,2.149-12.741.669-18.316-3.326-13.734-9.84-20.005-31.82-13.5-47.4,2.494-5.979,6.386-10.6,12.832-12.527,3.251-.969,6.577-1.686,9.835-2.635a18.112,18.112,0,0,1,16.015,2.541c3.563,2.478,6.667,5.616,9.852,8.355m1.765,44.542c.972-1.472,2.8-2.4,1.307-3.877a15.451,15.451,0,0,0-4.269-2.885,2.208,2.208,0,0,0-2.645,3.157,8.82,8.82,0,0,0,2.6,2.89c9.006,6.231,18.841,10.458,29.806,11.638,4.916.529,9.8.156,13.892-3.073,5.444-4.3,6.569-10.224,5.313-16.576C132.165,56.31,122,47.259,111.076,39.234c-.3,1.075-.285,2.382-.931,2.983-.817.763-4.615-1.028-5.142-2.613-.268-.8.677-2.01,1.07-3.028-1.868-.683-3.346.27-3.193,2.609a7.926,7.926,0,0,0,3.935,6.408A38.249,38.249,0,0,1,118.912,57a10.059,10.059,0,0,0,1.795,1.515L119.17,60.5a10.139,10.139,0,0,0-.726-2.79,28.755,28.755,0,0,0-9.688-9.908,18.17,18.17,0,0,0-7.133-1.943c-2.161-.219-3.428,1.342-3.644,3.481,1.578.731,3.174,1.4,4.707,2.192,4.588,2.365,8.543,5.357,10.706,10.306a1.774,1.774,0,0,1-.655,2.545,18.641,18.641,0,0,0-.753-3.663,11.725,11.725,0,0,0-2.029-2.942c-3.408-3.97-8.084-5.967-12.74-7.937a6.747,6.747,0,0,0-3.776-.673,3.551,3.551,0,0,0-2.075,2.413c-.186.918.312,2.64,1,2.963a37.926,37.926,0,0,1,13.1,10.251,8,8,0,0,0,1.878,1.17l-1.178,1.517a14.7,14.7,0,0,0-1.113-2.018,35.9,35.9,0,0,0-10.921-9.212c-.407-.224-1.039-.683-1.232-.549-1.35.932-1.762-.413-2.468-.941C88.764,53.509,87.139,52.2,85.5,50.92c.247,1.047.928,1.769,1.1,2.6a3.33,3.33,0,0,1-.389,2.528,2.59,2.59,0,0,1-2.349.429C80.14,55,79.746,54.057,82,51.053l.664-.882-.351-.646c-1.113.5-2.654.713-3.223,1.571a4.361,4.361,0,0,0-.32,3.673,12.161,12.161,0,0,0,3.366,4.1c5.415,4.318,11.089,8.319,16.4,12.76,2.944,2.463,6.133,2.876,9.649,2.727a11.056,11.056,0,0,1,1.34.1,3.212,3.212,0,0,1-2.105.623A37.621,37.621,0,0,1,88,69.2c-1.429-.887-2.926-1.779-4.585-.446a4.859,4.859,0,0,0-1.238,5.252c2.062-2.629,3.292-2.792,6.147-.811.6.418,1.211.828,1.785,1.281,2.151,1.7,1.918,3.553-1.072,5.075M32.1,1.765c-2.489.518-4.7.954-6.895,1.44-2.909.645-3.551,1.408-3.538,4.365.056,12.879-5.484,22.8-16.4,29.379-3.791,2.285-4.834,4.561-4.1,8.806,2.458,14.24,5.984,28.1,12.881,40.915,5.814,10.8,13.589,19.858,23.974,26.545.522.336,1.276.841,1.717.687,2.714-.951,5.37-2.07,8.322-3.243C31.585,99.879,22.507,84.1,16.614,66.107l-7.2,2.178c-.057-.178-.113-.356-.17-.534l6.783-2.307c-1.87-8.755-3.708-17.358-5.547-25.973L3.028,40q-.019-.309-.037-.62c2.094-.189,4.19-.348,6.278-.589.533-.061,1.416-.29,1.49-.6.5-2.053,2.25-2.683,3.77-3.6,8.539-5.154,14.581-12.212,16.484-22.224.641-3.37.72-6.848,1.088-10.6m53.289,77.5c-2.384.942-4.4,2.117-6.55,2.513-5.4.991-9.778-1.423-13.516-5-6.6-6.308-9.827-14.282-10.841-23.2-.745-6.552-.091-12.914,3.527-18.653,3.874-6.146,10.495-8.011,17.035-4.855A21.823,21.823,0,0,1,84.4,38.556c2.361,3.94,4.217,8.183,6.173,12.055l1.746-2.356A37.786,37.786,0,0,0,80.459,29.627c-4.633-3.877-9.867-6.521-16.117-5.539-7.932,1.247-12.464,6.659-14.933,13.743-4.028,11.559-2.157,22.731,3.383,33.373,3.368,6.469,8.09,11.719,14.949,14.693,7.3,3.165,15.664,1.19,20.1-4.787l-2.454-1.846m-26.944.974A43.559,43.559,0,0,1,48.9,64.394l-7.763,1.56c-.037-.185-.075-.369-.113-.555l7.643-1.8a44.15,44.15,0,0,1-.909-23.183c-2.807.545-5.266,1.064-7.741,1.484a2.226,2.226,0,0,0-2.023,2.007,39,39,0,0,0-.7,14.475C38.553,67.6,42.047,75.8,48.561,82.574c.4.413,1.171.942,1.562.809,2.688-.912,5.322-1.986,8.324-3.144m7.583-35.711a7.062,7.062,0,0,0,2.617,5.877,4.649,4.649,0,0,1,1.454,2.4c.989,5.22,1.846,10.466,2.733,15.705.215,1.27.759,2.267,2.212,1.893,2.507-.647,5-1.393,7.432-2.262A1.943,1.943,0,0,0,83.41,66.5c-1.124-2.964-2.033-6.12-3.764-8.715a11.9,11.9,0,0,1-1.814-10.2,6.2,6.2,0,0,0-1.95-6.5,5.773,5.773,0,0,0-6.662-1.13,5.152,5.152,0,0,0-3.193,4.58M40.114,114.435c.792.475,1.283.789,1.793,1.072a70.788,70.788,0,0,0,21.182,7.5,13.121,13.121,0,0,0,4.508.5c2.863-.5,5.65-1.446,8.468-2.208-9.736-1.928-18.963-5.015-27.142-10.131l-8.808,3.262M73.271,88.343c-.045-.186-.091-.372-.137-.557L67.41,89.38l-.127-.338L69.6,87.916c-3.149-2.038-6.46-4.194-9.791-6.318-.407-.26-1.007-.609-1.372-.485-2.666.907-5.294,1.925-8.04,2.947,6.748,6.434,14.49,7.741,22.878,4.284M38.746,41.432c3-.589,5.66-1.083,8.3-1.661a1.892,1.892,0,0,0,1.161-.874c1.465-3.008,2.857-6.052,4.269-9.08l-3.938.9c2.5-1.833,6.167-1.3,7.934-4.36-9.057,1.118-14.753,6.242-17.731,15.08m43.883,9.39c-.4,1.282-1.354,2.819-.947,3.4.638.9,2.175,1.228,3.387,1.625.2.066.982-.734,1-1.151.07-1.944-1.245-2.914-3.438-3.871m22.644-12.374.013.854c1.221.748,2.41,1.56,3.688,2.2.3.148.891-.306,1.349-.483a20.677,20.677,0,0,0-2.783-3.177c-.367-.29-1.489.379-2.267.609M92.98,70.963c1.476-2.419-.494-2.969-1.857-3.93-.913,2.826-.913,2.826,1.857,3.93"
                            transform="translate(0 0)"
                          />
                          <path
                            d="M150.994,31.111l-3.911,7.936a7.439,7.439,0,0,0-5.867-4.952c3.253-2.251,3.46-5.377,3.479-8.788.685,3.719,3.544,4.87,6.3,5.8m-5.607-2.14-2.117,4.743,3.789,3.095,2.828-5.126-4.5-2.712"
                            transform="translate(-37.908 -6.794)"
                          />
                          <path
                            d="M128.129,151.191a61.57,61.57,0,0,0,6.226-19.981,37.772,37.772,0,0,1-6.226,19.981"
                            transform="translate(-34.395 -35.222)"
                          />
                          <path
                            d="M175.386,54.476l-2.266,4.549L169.7,55.96c.6-1.7,1.249-3.541,1.777-5.039l3.909,3.555m-3.5-1.484-1.258,2.735,2.179,1.693,1.707-2.933-2.629-1.5"
                            transform="translate(-45.554 -13.669)"
                          />
                          <path
                            d="M157.765,144.113c-3.28-1.177-8.892-8.958-8.782-13.153A73.223,73.223,0,0,0,152.9,138.3a62.58,62.58,0,0,0,4.868,5.812"
                            transform="translate(-39.992 -35.155)"
                          />
                          <path
                            d="M136.707,31.968l-3.727-4.724.48-.388,3.779,4.662-.532.451"
                            transform="translate(-35.697 -7.209)"
                          />
                          <path
                            d="M153.935,24.877l2.8-5.16.568.3-2.8,5.153-.571-.293"
                            transform="translate(-41.322 -5.293)"
                          />
                          <path
                            d="M108.126,132.169l6.725-9.686a23.116,23.116,0,0,1-6.725,9.686"
                            transform="translate(-29.025 -32.879)"
                          />
                          <path
                            d="M87.743,23l-5.684-7.922.552-.394,5.67,7.932L87.743,23"
                            transform="translate(-22.028 -3.94)"
                          />
                          <path
                            d="M37.865,129.158l-6.983,2.165c-.067-.213-.135-.427-.2-.64l6.978-2.182q.1.328.208.656"
                            transform="translate(-8.236 -34.495)"
                          />
                        </g>
                      </svg>
                      <p
                        className={`text-sm text-[#707070] mt-3`}
                      >{`Entrez votre clé d'accès pour valider l'envoi`}</p>

                      <div className={`w-full mt-12`}>
                        <div className={`relative`}>
                          <Input
                            className={`font-normal text-sm ${
                              showConError && "border-[#e95d5d]"
                            }`}
                            type={showPassword ? "text" : "password"}
                            placeholder="Clé d'accès"
                            onChange={(e) => {
                              setAccessKey(e.target.value);
                            }}
                            style={{
                              backgroundColor:
                                accessKey != "" ? "#fff" : "#f0f0f0",
                            }}
                          />
                          <svg
                            onClick={handleTogglePassword}
                            className={`h-6 w-6 cursor-pointer ${
                              showPassword ? "fill-[#414141]" : "fill-[#c1c1c1]"
                            }  absolute top-4 right-4`}
                            viewBox="0 0 28.065 19.104"
                          >
                            <g transform="translate(0.325) rotate(1)">
                              <path
                                d="M0,0H18.622V18.622H0Z"
                                transform="translate(0.539)"
                                fill="none"
                              />
                              <g transform="matrix(1, -0.017, 0.017, 1, 5.314, 18.08)">
                                <path
                                  d="M0,0H0Z"
                                  transform="translate(0 -3.249)"
                                  fill="none"
                                />
                                <path
                                  d="M12.917,15.748a5.622,5.622,0,1,0,0,3.748h4.076v3.748h3.748V19.5h1.874V15.748ZM7.622,19.5A1.874,1.874,0,1,1,9.5,17.622,1.874,1.874,0,0,1,7.622,19.5Z"
                                  transform="translate(-7.063 -26.436)"
                                />
                              </g>
                            </g>
                          </svg>
                          {showConError && (
                            <div>
                              <span
                                className={`text-xs text-[#e95d5d] mt-1 hover:font-medium duration-200`}
                              >
                                {errorMessage}
                              </span>
                            </div>
                          )}
                          <Link
                            className={`text-xs mt-1 hover:font-medium duration-200`}
                            href={`#`}
                          >{`J'ai perdu ma clé`}</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/*Confirm 2*/}
                <div
                  className={`${
                    confirmStep == 2 ? "flex" : "hidden"
                  } flex-col mb-4 -mt-3`}
                >
                  <div className={`w-[70%] mx-auto`}>
                    <div className={`flex flex-col items-center`}>
                      <span className="relative flex w-40 h-40">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#caebe4]"></span>
                        <span className="relative inline-flex rounded-full w-40 h-40 bg-[#41a38c]"></span>
                      </span>
                      <p
                        className={`text-base mt-10`}
                      >{`Votre envoi est traité avec succès.`}</p>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-center items-center mb-3`}>
                  <Button
                    onClick={() => prevStep()}
                    className={`mt-5 w-32 text-sm text-black border border-black bg-transparent hover:text-white mr-3 ${
                      step == 1 || step == 6 || confirmStep == 1
                        ? "hidden"
                        : "block"
                    }`}
                    disabled={isSendLoading}
                  >
                    Retour
                  </Button>
                  <Button
                    onClick={handleSubmit((data) => checkSendMode(data))}
                    className={`mt-5 w-36 text-sm ${
                      step == 1 ? "block" : "hidden"
                    }`}
                  >
                    Suivant
                  </Button>
                  <Button
                    onClick={() => nextStep()}
                    className={`mt-5 w-36 text-sm ${
                      step < 5 && step > 3 ? "block" : "hidden"
                    }`}
                  >
                    Continuer
                  </Button>
                  <Button
                    onClick={handleSubmit((data) => addNewBeneficiary(data))}
                    className={`mt-5 w-41 text-sm ${
                      step == 2 && displayBeneficiaryForm ? "block" : "hidden"
                    }`}
                  >
                    Ajouter bénéficiaire
                  </Button>
                  <Button
                    onClick={() => {
                      initSendMoneyPayload();
                    }}
                    className={`mt-5 w-[30%] text-sm ${
                      step == 5 ? "block" : "hidden"
                    }`}
                  >
                    {`Confirmer l'envoi`}
                  </Button>
                  <Button
                    onClick={() => sendMoneyAction()}
                    className={`mt-3 w-[30%] text-sm ${
                      confirmStep == 1 ? "block" : "hidden"
                    }`}
                    disabled={isSendLoading}
                  >
                    {isSendLoading ? (
                      <ScaleLoader color="#fff" height={15} width={3} />
                    ) : (
                      `Déverouiller`
                    )}
                  </Button>
                  <DialogClose
                    onClick={() => {
                      setStep(1);
                      setPercentage("w-1/6");
                      setConfirmStep(0);
                      resetSendMoneyValues();
                    }}
                  >
                    <Button
                      className={`mt-3 w-36 text-sm text-black border border-black bg-transparent hover:text-white mr-3 ${
                        confirmStep == 2 ? "block" : "hidden"
                      }`}
                    >
                      Terminer
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={() => downloadTicket()}
                    className={`mt-3 w-48 text-sm ${
                      confirmStep == 2 ? "block" : "hidden"
                    }`}
                  >
                    {`Télécharger le reçu`}
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
