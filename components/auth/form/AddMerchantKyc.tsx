"use client"
import {Locale} from "@/i18n.config";
import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod";
import {useFieldArray, useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import toast from "react-hot-toast";
import {useRouter} from "next13-progressbar";
import SignUpFilesInfo from "@/components/auth/form/SignUpFilesInfo";
import SignUpFilesUpload from "@/components/auth/form/SignUpFilesUpload";
import SignUpOK from "@/components/auth/form/SignUpOK";
import {IUser} from "@/core/interfaces/user";
import Routes from "@/components/Routes";
import {makeKycFilesUpload} from "@/core/apis/client-requests";

interface AddMerchantKycProps {
    lang: Locale,
    merchant: IUser,
    merchantIdsInfos: any,
    legalForm: {
        id: string;
        name: string;
        code: string;
        skaleetId: string;
        sk_document: any[];
        company_type: number
    }
}

// .refine((file) => {
//     const byteSize = new Blob([file]).size;
//     const maxSize = 2 * 1024 * 1024;
//     return byteSize <= maxSize;
// }, {
//     message: 'La taille de l’image doit être inférieure ou égale à 2 Mo',
// })

const formSchema = z.object({
    kycFiles: z.array(
        z.object({
            type: z.string(),
            file: z.any().refine((file) => {
                return file != undefined;
            }, {
                message: 'Fichier requis',
            }),
        })
    ),
})

export default function AddMerchantKyc({lang, merchant, merchantIdsInfos, legalForm}: AddMerchantKycProps) {

    // console.log(legalForm);
    // console.log(merchant);

    const [isLoading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [showError, setShowError] = useState(false);
    const [showConError, setShowConError] = useState(false);

    const [showProgressBars, setShowProgressBars] = useState(false);


    const ProgressArray = {
        CERTIFICAT_FISCAL: 0,
        PREUVE_IDENTITE_MANDATAIRE: 0,
        REGISTRE_DE_COMMERCE: 0,
    }
    const [progress, setProgress] = useState(ProgressArray)


    const router = useRouter();

    const stepOne = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kycFiles: []
        },
    });

    const kycFilesRef = stepOne.register("kycFiles");
    // setLoading(false);


    const errorsArray = Object.values(stepOne.formState.errors);

    const findValueByKey = (array: any[], key: number) => {
        for (let i = 0; i < array.length; i++) {
            const subArray = array[i];
            if (subArray[0] === key) {
                return subArray[1];
            }
        }
        return null;
    };

    // if (errorsArray.length > 0) {
    //     // @ts-ignore
    //     toast.error(errorsArray[0][0].file.message, {
    //         className: '!bg-yellow-50 !max-w-xl !text-yellow-600 !shadow-2xl !shadow-yellow-50/50 text-sm font-medium'
    //     });
    // }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);

        const fileToUpload = await Promise.all(
            values.kycFiles.map(async (kyc) => {
                // console.log(kyc);
                const base64 = await readFileAsBase64(kyc.file);
                // @ts-ignore
                const base64WithoutPrefix = base64.split(',')[1];
                // const base64WithoutPrefix = JSON.stringify(base64.replace(/^data:\w+\/\w+;base64,/, ''));

                return {
                    type: kyc.type,
                    content: base64WithoutPrefix,
                    name: kyc.file.name,
                    description: kyc.file.name,
                };
            })
        );

        console.log('DataToUpload', fileToUpload);
        // console.log(values);

        const toastLoading = toast.loading('Action en cours de traitement...', {
            className: 'text-sm font-medium !max-w-xl !shadow-2xl border border-[#ededed]'
        });

        setShowProgressBars(true);

        for (let i = 0; i < fileToUpload.length; i++) {
            const file = fileToUpload[i];

                const type: any = file.type;
                let progressObject = Object.entries(progress);
                let currentTime = findValueByKey(progressObject, type);
                // console.log(currentTime)

                const intervalId = setInterval(() => {
                    if (currentTime <= 50) {
                        currentTime += 1;
                    }

                    setProgress((prevProgress) => ({
                        ...prevProgress,
                        [type]: currentTime,
                    }));
                }, 50);

                console.log(file);

                const uploadKycFileRes = await makeKycFilesUpload(merchant, file);
                // console.log(uploadKycFileRes);

                if (!uploadKycFileRes.success) {
                    setLoading(false);
                    setShowConError(true);
                    toast.dismiss(toastLoading);

                    return toast.error(uploadKycFileRes.message, {
                        className: '!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium'
                    });
                } else {
                    clearInterval(intervalId);
                    setProgress((prevProgress) => ({
                        ...prevProgress,
                        [type]: 100,
                    }));
                }
        }

        if (!showConError) {
            setLoading(false);
            setShowConError(false);

            toast.dismiss(toastLoading);
            toast.success("Fichier(s) ajouté(s) avec succès", {
                className: '!bg-green-50 !max-w-xl !text-green-600 !shadow-2xl !shadow-green-50/50 text-sm font-medium'
            });

            setStep(3);
            setTimeout(() => {
                router.push(Routes.dashboard.home.replace('{lang}', lang))
            }, 2500);
        }
    }

    const readFileAsBase64 = (file: any) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };


    function handleGoToBack() {
        if (step > 1) {
            const backNumber = step - 1;
            setStep(backNumber)
        }
    }

    function handleGoToNext() {
        if (step < 9) {
            const backNumber = step + 1;
            setStep(backNumber)
        }
    }

    useEffect(() => {
        if (legalForm.company_type == 1) {
            stepOne.setValue('kycFiles.0.type', 'PREUVE_IDENTITE_INDIVIDUEL');
        } else if (legalForm.company_type == 2) {
            stepOne.setValue('kycFiles.0.type', 'CERTIFICAT_FISCAL');
            stepOne.setValue('kycFiles.1.type', 'PREUVE_IDENTITE_MANDATAIRE');
            stepOne.setValue('kycFiles.2.type', 'REGISTRE_DE_COMMERCE');
        } else if (legalForm.company_type == 3) {
            stepOne.setValue('kycFiles.0.type', 'CERTIFICAT_FISCAL');
            stepOne.setValue('kycFiles.1.type', 'PREUVE_IDENTITE_MANDATAIRE');
            stepOne.setValue('kycFiles.2.type', 'DECISION');
        }
    }, []);

    return (
        <div>
            <div className={`duration-200 ${step == 1 ? 'block fade-in' : 'hidden fade-out'}`}>
                <SignUpFilesInfo lang={lang} handleGoToBack={handleGoToBack} handleGoToNext={handleGoToNext}
                                 legalForm={legalForm}/>
            </div>
            <div className={`duration-200 ${step == 2 ? 'block fade-in' : 'hidden fade-out'}`}>
                <SignUpFilesUpload lang={lang} handleGoToBack={handleGoToBack} handleGoToNext={handleGoToNext}
                                   legalForm={legalForm} isLoading={isLoading} onSubmit={onSubmit} stepOne={stepOne}
                                   errorsArray={errorsArray} progress={progress} showProgressBars={showProgressBars}/>
            </div>
            <div className={`duration-200 ${step == 3 ? 'block fade-in' : 'hidden fade-out'}`}>
                <SignUpOK lang={lang}/>
            </div>
        </div>
    );
}