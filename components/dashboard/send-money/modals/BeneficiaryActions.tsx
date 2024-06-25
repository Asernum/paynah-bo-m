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
  PlusCircle,
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
import { NumericFormat } from "react-number-format";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Plus, Send } from "lucide-react";
import { IUser } from "@/core/interfaces/user";
import { IBeneficiary } from "@/core/interfaces/beneficiary";
import { IOperator } from "@/core/interfaces/operator";
import { getOperators } from "@/core/apis/operator";
import { addBeneficiary } from "@/core/apis/beneficiary";
import Image from "next/image";
import IMask from "imask";
import { getBankName } from "@/lib/utils";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";
import { useRouter } from "next/navigation";

interface MainActionsProps {
  lang: string;
  merchant: IUser;
  children: React.ReactNode;
  operators?: IOperator[];
}

interface IBeneficiarySchema {
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  paynahAccountNumber: string;
  operator: string;
  number: string;
  bankAccount: string;
}

export default function BeneficiaryActions({
  lang,
  merchant,
  children,
}: MainActionsProps) {
  const divOptionsRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  const [step, setStep] = useState(1);
  const [account, setAccount] = useState<{ id: string; name: string }>({
    id: "",
    name: "",
  });
  const [beneficiary, setBeneficiary] = useState<{ id: string; name: string }>({
    id: "",
    name: "",
  });
  const [existBenef, setExistBenef] = useState(true);
  const [payFees, setPayFees] = useState(false);
  const [amount, setAmount] = useState("0");
  const [totalAmount, setTotalAmount] = useState("");
  const [reason, setReason] = useState("");
  const [percentage, setPercentage] = useState("w-1/3");

  const [confirmStep, setConfirmStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  //
  const [isLoading, setLoading] = useState(false);
  const [isAddBenefLoading, setAddBenefLoading] = useState(false);
  const [accountType, setAccountType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [operators, setOperators] = useState([]);
  const [showConError, setShowConError] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<IBeneficiarySchema[]>([]);
  const [bankName, setBankName] = useState("");

  // const [isBenefStore, setIsBenefStore] = useState(false);

  const refBankAccount = useRef(null);

  const formSchema = z.object({
    lastName: z
      .string()
      .min(2, { message: "Le nom doit contenir au moins deux lettres" }),
    firstName: z
      .string()
      .min(2, { message: "Le prénoms doit contenir au moins deux lettres" }),
    email: z
      .string()
      .email({ message: "votre email doit avoir un format valide" }),
  });

  const formSchemaInfo = z
    .object({
      type: z.string().refine(
        (val) => {
          return !(val == "default" || val == "");
        },
        { message: "Veuillez choisir une option" }
      ),
      paynahAccountNumber: z.string(),
      operator: z.string(),
      number: z.string(),
      bankAccount: z.string(),
    })
    .refine(
      (data) => {
        if (data.type == "BANK") {
          return data.bankAccount.trim().length > 0;
        }
        return true;
      },
      {
        message: "Le numéro de compte ne doit pas être vide",
        path: ["bankAccount"],
      }
    )
    .refine(
      (data) => {
        if (data.type == "PAYNAH") {
          return data.paynahAccountNumber.trim().length > 0;
        }
        return true;
      },
      {
        message: "Le numéro de compte ne doit pas être vide",
        path: ["paynahAccountNumber"],
      }
    )
    .refine(
      (data) => {
        if (data.type == "MOBILE") {
          return data.number.trim().length > 0;
        }
        return true;
      },
      {
        message: "veuillez renseigner un numéro de téléphone",
        path: ["number"],
      }
    )
    .refine(
      (data) => {
        if (data.type == "MOBILE") {
          return data.operator.trim().length > 0;
        }
        return true;
      },
      {
        message: "veuillez choissir un opérateur",
        path: ["operator"],
      }
    );

  const beneficiaryForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      email: "",
    },
  });

  const beneficiaryFormInfo = useForm<z.infer<typeof formSchemaInfo>>({
    resolver: zodResolver(formSchemaInfo),
    defaultValues: {
      type: "",
      paynahAccountNumber: "",
      operator: "",
      number: "",
      bankAccount: "",
    },
  });

  async function onSubmitBenefPersForm(values: z.infer<typeof formSchema>) {
    console.log(values);
    getOperatorList();
    nextStep();
  }

  async function onSubmitBenefInfoForm(values: z.infer<typeof formSchemaInfo>) {
    console.log(values);
    let dataSup: any;

    const persoData = {
      firstName: beneficiaryForm.getValues("firstName"),
      lastName: beneficiaryForm.getValues("lastName"),
      email: beneficiaryForm.getValues("email"),
      type: values.type,
    };

    if (values.type == "BANK") {
      dataSup = {
        bankAccount: values.bankAccount,
      };
    } else if (values.type == "PAYNAH") {
      dataSup = {
        paynahAccountNumber: values.paynahAccountNumber,
      };
    } else if (values.type == "MOBILE") {
      dataSup = {
        operator: values.operator,
        number: values.number,
      };
    }

    const data = { ...persoData, ...dataSup } as IBeneficiarySchema;

    setBeneficiaries([...beneficiaries, data]);
    resetAccountBeneficiaryValues();
  }

  // console.log(beneficiaries);
  // const errorsArray = Object.values(beneficiaryFormInfo.formState.errors);
  // console.log('errorsArray', errorsArray);

  function prevStep() {
    if (step > 1) {
      setStep(step - 1);

      if (step - 1 == 1) {
        setPercentage("w-1/3");
      } else if (step - 1 == 2) {
        setPercentage("w-2/3");
      }
    }
  }

  function nextStep() {
    if (step < 3) {
      setStep(step + 1);

      if (step + 1 == 3) {
        setPercentage("w-3/3");
      } else if (step + 1 == 2) {
        setPercentage("w-2/3");
      }
    }
  }

  // const { register, handleSubmit, formState: {errors}, setValue } = beneficiaryFormInfo;

  const resetCreateBeneficiaryValues = () => {
    resetAccountBeneficiaryValues();
    // setBeneficiaries([]);
  };

  const resetAccountBeneficiaryValues = () => {
    setAccountType("");
    beneficiaryFormInfo.reset();
  };

  const getOperatorList = () => {
    // @ts-ignore
    getOperators(String(merchant.accessToken))
      .then((data) => {
        setOperators(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setOperators([]);
      });
  };

  const handleChangeAccountType = (accountType: string) => {
    setAccountType(accountType);
    if (accountType === "BANK") {
      beneficiaryFormInfo.setValue("operator", ""),
        beneficiaryFormInfo.setValue("number", "");
    }
    if (accountType === "MOBILE") {
      beneficiaryFormInfo.setValue("bankAccount", "");
      beneficiaryFormInfo.setValue("paynahAccountNumber", "");
    }
    if (accountType === "PAYNAH") {
      beneficiaryFormInfo.setValue("bankAccount", "");
      beneficiaryFormInfo.setValue("operator", ""),
        beneficiaryFormInfo.setValue("number", "");
    }
  };

  const deleteBeneficiaryItem = (index: number) => {
    let beneficiariesCopy: IBeneficiarySchema[] = [...beneficiaries];
    beneficiariesCopy.splice(index, 1);
    setBeneficiaries(beneficiariesCopy);
  };

  const addBeneficiaryItems = (data: any) => {
    if (divOptionsRef.current) {
      divOptionsRef?.current.scrollIntoView({ behavior: "smooth" });
    } else {
      console.log(divOptionsRef.current);
    }
    try {
      formSchema.parse(data); // Valider les données
      setBeneficiaries([...beneficiaries, data]);
      resetAccountBeneficiaryValues();
      console.log("Les données du formulaire sont valides !");
    } catch (error: any) {
      console.error("Erreur de validation du formulaire :", error.errors);
    }
  };

  const displayAccountTypeLabel = (accountType: string) => {
    let accountLabel = "";
    if (accountType == "BANK") {
      accountLabel = "Compte Bancaire";
    }
    if (accountType == "PAYNAH") {
      accountLabel = "Compte Paynah";
    }
    if (accountType == "MOBILE") {
      accountLabel = "Compte Mobile Money";
    }
    return accountLabel;
  };

  const createBeneficiary = () => {
    let isBenefStore = false;
    setAddBenefLoading(true);
    let index = 0;

    const benefNumber = beneficiaries.length;

    for (const benef of beneficiaries) {
      addBeneficiary(
        benef,
        String(merchant.merchantsIds[0].id),
        String(merchant.accessToken)
      )
        .then((data) => {
          if (data.success) {
            console.log(data);
            isBenefStore = true;

            if (index === benefNumber) {
              setAddBenefLoading(false);
            }

            if (isBenefStore) {
              if (index == benefNumber) {
                // console.log(1);
                nextStep();
              }
            }
          } else {
            setAddBenefLoading(false);
            return toast.error(`Le compte ${benef.type} n'a pu être ajouté.`, {
              className:
                "!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          setAddBenefLoading(false);
          return toast.error(
            `Le compte ${benef.type} n'a pu être ajouté. Une erreur est survénue !`,
            {
              className:
                "!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium",
            }
          );
        });

      index++;
    }

    // console.log('isBenefStore', index);
    // if (isBenefStore && index === beneficiaries.length - 1) {
    //     console.log('isBenefStore');
    //     nextStep();
    // }

    // @ts-ignore
    // addBeneficiary(beneficiaries[0], String(merchant.merchantsIds[0].id), String(merchant.accessToken))
    // .then(data => {
    //     if (data.success) {
    //         setErrorMessage('');
    //         setStep(2);
    //         setPercentage('w-4/4');
    //     } else {
    //         setErrorMessage(data.message);
    //     }
    // })
    // .catch(err => {
    //     setErrorMessage('Une erreur est survénue');
    // });
  };

  function closeModal() {
    const benefArray = beneficiaries;
    console.log(benefArray);

    setAccountType("");
    beneficiaryFormInfo.reset();
    beneficiaryForm.reset();
    setStep(1);
    setPercentage("w-1/4");
    setBeneficiaries([]);
  }

  function getRibBank(rib: string) {
    const bankCode = rib.split(" ")[0];
    if (rib.length == 5) {
      setBankName(getBankName(bankCode));
    }

    if (rib.length == 0) {
      setBankName("");
    }
  }

  useEffect(() => {
    getOperatorList();
    if (refBankAccount.current) {
      const mask = IMask(refBankAccount.current, {
        mask: "CCNNN NNNNN NNNNNNNNNNNN NN",
        lazy: true,
        blocks: {
          C: { placeholderChar: "C", mask: "a" },
          N: { placeholderChar: "0", mask: "0" },
        },
        expose: true,
      });

      console.log(mask.value);
    }

    // createBeneficiary();
  }, []);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent
          className={`sm:max-w-[42rem] xl:max-w-[46rem] 2xl:max-w-[49rem] overflow-y-hidden overflow-x-hidden duration-200 !rounded-3xl bg-[#f4f4f7] px-3 py-3`}
        >
          <div>
            <div className={`rounded-t-2xl bg-white px-8 pb-4 pt-5`}>
              <div className={`flex justify-between items-center space-x-3`}>
                <h2
                  className={`text-base text-[#626262] font-medium`}
                >{`Ajouter un bénéficiaire`}</h2>

                <DialogClose
                  className={`${step == 3 ? "block" : "hidden"}`}
                  onClick={() => {
                    closeModal();
                    window.location.reload();
                  }}
                >
                  <X strokeWidth={2.4} className={`text-[#767676] h-5 w-5`} />
                </DialogClose>

                <DialogClose
                  className={`${step != 3 ? "block" : "hidden"}`}
                  onClick={() => closeModal()}
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

          <div className={`max-h-[33.5rem] pt-2 pb-4 px-8`}>
            {/* <div className={`min-h-[6rem] pt-2 pb-4 px-8`}> */}

            <div>
              <Form {...beneficiaryForm}>
                <form
                  key={1}
                  onSubmit={beneficiaryForm.handleSubmit(onSubmitBenefPersForm)}
                  className={`${step == 1 ? "block" : "hidden"} space-y-6 mt-2`}
                >
                  <div className={`flex items-center gap-5`}>
                    <div className={"w-1/3"}>
                      <FormField
                        control={beneficiaryForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <div className={`inline-flex space-x-3`}>
                              <h3 className={`text-sm font-medium`}>Nom</h3>
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
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className={"w-2/3"}>
                      <FormField
                        control={beneficiaryForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <div className={`inline-flex space-x-3`}>
                              <h3 className={`text-sm font-medium`}>Prénoms</h3>
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
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className={`gap-5`}>
                    <div className={""}>
                      <FormField
                        control={beneficiaryForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <div className={`inline-flex space-x-3`}>
                              <h3 className={`text-sm font-medium`}>Email</h3>
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
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className={`flex justify-center items-center`}>
                    <Button type="submit" className={`mt-3 w-40 text-sm`}>
                      Continuer
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            <div>
              <Form {...beneficiaryFormInfo}>
                <form
                  key={2}
                  onSubmit={beneficiaryFormInfo.handleSubmit(
                    onSubmitBenefInfoForm
                  )}
                  className={`${step == 2 ? "block" : "hidden"}`}
                >
                  <div
                    className={`inline-flex space-x-3 overflow-x-auto w-[43rem] ${
                      beneficiaries.length == 0 ? "hidden" : "block mb-3"
                    }`}
                    ref={divOptionsRef}
                  >
                    {beneficiaries &&
                      beneficiaries.map(
                        (beneficiary: IBeneficiarySchema, index: number) => (
                          <div
                            key={index}
                            className={`snap-end shrink-0 w-[13.3rem] 2xl:w-[14rem] bg-white flex flex-col justify-between space-y-8 2xl:space-y-8 p-4 rounded-3xl`}
                          >
                            <div className={`flex justify-between items-start`}>
                              <div>
                                <div className={`inline-flex flex-col`}>
                                  <span
                                    className={`text-[12px] font-light text-[#626262]`}
                                  >
                                    {displayAccountTypeLabel(beneficiary.type)}
                                  </span>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  className={`focus:outline-none`}
                                  asChild
                                >
                                  <button
                                    className={`text-[#626262]`}
                                    onClick={() => deleteBeneficiaryItem(index)}
                                  >
                                    <X
                                      strokeWidth={2.4}
                                      className={`text-[#767676] h-5 w-5`}
                                    />
                                  </button>
                                </DropdownMenuTrigger>
                              </DropdownMenu>
                            </div>
                            <div className={`inline-flex flex-col`}>
                              {beneficiary.type == "BANK" && (
                                <>
                                  <h3
                                    className={`text-[10px] font-normal text-[#afafaf]`}
                                  >
                                    Numéro Compte bancaire
                                  </h3>
                                  <span className={`text-base break-all leading-4 font-semibold`}>
                                    {beneficiary.bankAccount}
                                  </span>
                                </>
                              )}
                              {beneficiary.type == "PAYNAH" && (
                                <>
                                  <h3
                                    className={`text-[10px] mb-0.5 font-normal text-[#afafaf]`}
                                  >
                                    Numéro Compte Paynah
                                  </h3>
                                  <span className={`text-base break-all leading-4 font-semibold`}>
                                    {beneficiary.paynahAccountNumber}
                                  </span>
                                </>
                              )}
                              {beneficiary.type == "MOBILE" && (
                                <>
                                  <h3
                                    className={`text-[10px] mb-0.5 font-normal text-[#afafaf]`}
                                  >
                                    Opérateur Mobile
                                  </h3>
                                  <span className={`text-base break-all leading-4 font-semibold`}>
                                    {beneficiary.operator}
                                  </span>
                                  <h3
                                    className={`text-[10px] mt-1 mb-0.5 font-normal text-[#afafaf]`}
                                  >
                                    Numéro de téléphone
                                  </h3>
                                  <span className={`text-base break-all leading-4 font-semibold`}>
                                    {beneficiary.number}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      )}
                  </div>
                  <div className={``}>
                    <div className={"mb-5"}>
                      <FormField
                        control={beneficiaryFormInfo.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <div className={`inline-flex space-x-3`}>
                              <h3 className={`text-sm font-medium`}>
                                Type de compte
                              </h3>
                            </div>
                            <FormControl>
                              <div>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    handleChangeAccountType(value);
                                  }}
                                  value={field.value}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger
                                    className={`w-full ${
                                      showConError && "!border-[#e95d5d]"
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
                                    {/*<SelectItem*/}
                                    {/*    className={`h-[3.1rem] inline-flex items-center font-light focus:bg-gray-100 cursor-pointer`}*/}
                                    {/*    value="default">*/}
                                    {/*    <div*/}
                                    {/*        className={`inline-flex items-center space-x-2.5`}>*/}
                                    {/*    <span*/}
                                    {/*        className={`mt-[2px]`}>Choisir un type de compte</span>*/}
                                    {/*    </div>*/}
                                    {/*</SelectItem>*/}
                                    <SelectItem
                                      className={`h-[3.1rem] inline-flex items-center font-light focus:bg-gray-100 cursor-pointer`}
                                      value="MOBILE"
                                    >
                                      <div
                                        className={`inline-flex items-center space-x-2.5`}
                                      >
                                        <span className={`mt-[2px]`}>
                                          Mobile Money
                                        </span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem
                                      className={`h-[3.1rem] inline-flex items-center font-light focus:bg-gray-100 cursor-pointer`}
                                      value="BANK"
                                    >
                                      <div
                                        className={`inline-flex items-center space-x-2.5`}
                                      >
                                        <span className={`mt-[2px]`}>
                                          Compte Bancaire
                                        </span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem
                                      className={`h-[3.1rem] inline-flex items-center font-light focus:bg-gray-100 cursor-pointer`}
                                      value="PAYNAH"
                                    >
                                      <div
                                        className={`inline-flex items-center space-x-2.5`}
                                      >
                                        <span className={`mt-[2px]`}>
                                          Compte Paynah
                                        </span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </FormControl>
                            <FormMessage className={`text-xs`}>
                              {beneficiaryFormInfo.formState.errors.type &&
                                (beneficiaryFormInfo.formState.errors.type
                                  .message as string)}
                            </FormMessage>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  {accountType == "MOBILE" && (
                    <div className={`flex items-start gap-5`}>
                      <div className={"w-1/2"}>
                        <FormField
                          control={beneficiaryFormInfo.control}
                          name="operator"
                          render={({ field }) => (
                            <FormItem>
                              <div className={`inline-flex space-x-3`}>
                                <h3 className={`text-sm font-medium`}>
                                  Opérateur Mobile Money
                                </h3>
                              </div>
                              <FormControl>
                                <div>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <SelectTrigger
                                      className={`w-full ${
                                        showConError && "border-[#e95d5d]"
                                      } px-4 font-light text-sm ${
                                        showConError && "border-[#e95d5d]"
                                      }`}
                                      style={{
                                        backgroundColor: field.value
                                          ? "#fff"
                                          : "#f0f0f0",
                                      }}
                                    >
                                      <SelectValue placeholder="Choisir un opérateur" />
                                    </SelectTrigger>
                                    <SelectContent
                                      className={`z-[999] bg-[#f0f0f0]`}
                                    >
                                      {operators &&
                                        operators.map((operator: IOperator) => (
                                          <SelectItem
                                            key={operator.id}
                                            className={`h-[3.1rem] inline-flex items-center font-light focus:bg-gray-100 cursor-pointer`}
                                            value={String(operator.code)}
                                          >
                                            <div
                                              className={`inline-flex items-center space-x-2.5`}
                                            >
                                              <Image
                                                className={`h-[1.6rem] w-[1.6rem]`}
                                                src={operator.logoUrl}
                                                alt={operator.code}
                                                height={512}
                                                width={512}
                                              />
                                              <span className={`mm-label`}>
                                                {operator.name}
                                              </span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </FormControl>
                              <FormMessage className={`text-xs`}>
                                {beneficiaryFormInfo.formState.errors
                                  .operator &&
                                  (beneficiaryFormInfo.formState.errors.operator
                                    .message as string)}
                              </FormMessage>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className={"w-1/2"}>
                        <FormField
                          control={beneficiaryFormInfo.control}
                          name="number"
                          render={({ field }) => (
                            <FormItem>
                              <div className={`inline-flex space-x-3`}>
                                <h3 className={`text-sm font-medium`}>
                                  Numéro de téléphone
                                </h3>
                              </div>
                              <FormControl className={""}>
                                <div>
                                  <Input
                                    type={`text`}
                                    className={`font-light text-sm ${
                                      showConError && "border-[#e95d5d]"
                                    }`}
                                    placeholder="Entrez votre numéro de téléphone"
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
                                {beneficiaryFormInfo.formState.errors.number &&
                                  (beneficiaryFormInfo.formState.errors.number
                                    .message as string)}
                              </FormMessage>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  {accountType == "BANK" && (
                    <div className={`gap-5`}>
                      <div className={""}>
                        <FormField
                          control={beneficiaryFormInfo.control}
                          name="bankAccount"
                          render={({ field }) => (
                            <FormItem>
                              <div className={`inline-flex space-x-3`}>
                                <h3 className={`text-sm font-medium`}>
                                  Numéro de compte bancaire
                                </h3>
                              </div>
                              <FormControl className={""}>
                                <div>
                                  <Input
                                    type={`text`}
                                    className={`font-light text-sm ${
                                      showConError && "border-[#e95d5d]"
                                    }`}
                                    placeholder="Entrez votre numéro de compte bancaire"
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
                                {beneficiaryFormInfo.formState.errors
                                  .bankAccount &&
                                  (beneficiaryFormInfo.formState.errors
                                    .bankAccount.message as string)}
                              </FormMessage>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  {accountType == "PAYNAH" && (
                    <div className={`gap-5`}>
                      <div className={""}>
                        <FormField
                          control={beneficiaryFormInfo.control}
                          name="paynahAccountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <div className={`inline-flex space-x-3`}>
                                <h3 className={`text-sm font-medium`}>
                                  Numéro de compte Paynah
                                </h3>
                              </div>
                              <FormControl className={""}>
                                <div>
                                  <Input
                                    type={`text`}
                                    className={`font-light text-sm ${
                                      showConError && "border-[#e95d5d]"
                                    }`}
                                    placeholder="Entrez votre numéro de compte Paynah"
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
                                {beneficiaryFormInfo.formState.errors
                                  .paynahAccountNumber &&
                                  (beneficiaryFormInfo.formState.errors
                                    .paynahAccountNumber.message as string)}
                              </FormMessage>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  <div className={`flex items-center gap-6 mt-4 max-h-[90px]`}>
                    <Button
                      type={"submit"}
                      className={`px-6 items-center text-xs`}
                      disabled={isAddBenefLoading}
                    >
                      <PlusCircle className={`h-4 w-4 mr-2`} />
                      <span>Ajouter un compte</span>
                    </Button>
                  </div>

                  <div className={`flex justify-center items-center mb-1`}>
                    <Button
                      type={"button"}
                      onClick={() => {
                        resetCreateBeneficiaryValues();
                        prevStep();
                      }}
                      className={`mt-10 w-32 text-sm text-black border border-black bg-transparent hover:text-white mr-3 ${
                        step == 1 || step == 4 || confirmStep != 0
                          ? "hidden"
                          : "block"
                      }`}
                    >
                      Retour
                    </Button>
                    <Button
                      type={"button"}
                      onClick={() => {
                        setAddBenefLoading(true);
                        createBeneficiary();
                      }}
                      className={`mt-10 w-46 text-sm`}
                      disabled={beneficiaries.length == 0 || isAddBenefLoading}
                    >
                      {isAddBenefLoading ? (
                        <ScaleLoader color="#fff" height={15} width={3} />
                      ) : (
                        "Ajouter le bénéficiaire"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            <div
              className={`${step == 3 ? "flex" : "hidden"} flex-col mb-4 mt-5`}
            >
              <div className={`w-[70%] mx-auto`}>
                <div className={`flex flex-col items-center`}>
                  <span className="relative flex w-40 h-40">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#caebe4]"></span>
                    <span className="relative inline-flex rounded-full w-40 h-40 bg-[#41a38c]"></span>
                  </span>
                  <p
                    className={`text-base mt-10`}
                  >{`Votre bénéficiaire a été ajouté avec succès.`}</p>
                </div>
              </div>
            </div>
            <div
              className={`${
                step == 3 ? "flex" : "hidden"
              } justify-center items-center mb-3`}
            >
              <DialogClose
                onClick={() => {
                  closeModal();
                  window.location.reload();
                }}
              >
                <Button className={`mt-5 w-32 text-sm`}>Terminer</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
