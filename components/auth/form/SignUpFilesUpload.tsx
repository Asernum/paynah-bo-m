"use client"

import React, {useCallback, useState} from "react";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import Dropzone, {useDropzone} from "react-dropzone";
import {FileDown} from "lucide-react";
import axios, {AxiosProgressEvent, CancelTokenSource} from "axios";
import {Progress} from "@/components/ui/progress";
import Link from "next/link";
import Routes from "@/components/Routes";
import toast from "react-hot-toast";


interface SignUpFilesUploadProps {
    lang: string,
    handleGoToBack: () => void,
    handleGoToNext: () => void,
    legalForm: {
        id: string;
        name: string;
        code: string;
        skaleetId: string;
        sk_document: any[];
        company_type: number
    },
    isLoading: boolean,
    errorsArray: any[],
    stepOne: any,
    onSubmit: any,
    progress: {
        PREUVE_IDENTITE_MANDATAIRE: number,
        CERTIFICAT_FISCAL: number,
        REGISTRE_DE_COMMERCE: number
    },
    showProgressBars: boolean
}

interface FileUploadProgress {
    progress: number;
    File: File;
    source: CancelTokenSource | null;
}

export default function SignUpFilesUpload({lang, handleGoToBack, handleGoToNext, legalForm, isLoading, errorsArray, stepOne, onSubmit, progress, showProgressBars}: SignUpFilesUploadProps) {

    // console.log(errorsArray);
    // console.log(legalForm);

    let progressObject = Object.entries(progress);
    const findValueByKey = (array: any[], key: number) => {
        for (let i = 0; i < array.length; i++) {
            const subArray = array[i];
            if (subArray[0] === key) {
                return subArray[1];
            }
        }
        return null;
    };

    return (
        <div className={`formContainer mx-auto max-w-5xl`}>
            <div className={`text-center mb-28`}>
                <h2 className={`font-semibold text-center text-2xl md:text-3xl mb-3`}>Insérez vos pièces
                    justificatives</h2>
                <p className={`text-[#626262] w-full md:w-[60%] md:mx-auto text-sm md:text-base`}>{`Joignez vos pièces d'identité et les documents d'entreprise en suivant l'ordre définie. `}
                </p>
            </div>
            <div className={`px-4 mb-[0.5rem] md:mb-[5.5rem]`}>
                <Form {...stepOne}>
                    <form onSubmit={stepOne.handleSubmit(onSubmit)} className="" encType={`multipart/form-data`}>
                        {legalForm.company_type == 1 &&
                            <div className={`grid grid-cols-1 md:grid-cols-6 gap-4`}>
                                <div className={`col-span-1 md:col-span-2`}>
                                </div>
                                <div className={`col-span-1 md:col-span-2`}>
                                    <FormField
                                        control={stepOne.control}
                                        name="kycFiles.0.file"
                                        render={(field) => (
                                            <Dropzone
                                                accept={{
                                                    "image/*": [".jpg", ".jpeg", ".png"],
                                                    "application/pdf": [".pdf"],
                                                }}
                                                onDropAccepted={(acceptedFiles) => {
                                                    acceptedFiles.map((acceptedFile) => {
                                                        return stepOne.setValue('kycFiles.0.file', acceptedFile);
                                                    });
                                                }}
                                                onDropRejected={(rejectedFiles) => {
                                                    console.log(rejectedFiles);
                                                    return toast.error(rejectedFiles[0].errors[0].code == 'file-too-large' ? "La taille du fichier est supérieur à limite autorisée (2MB)" : rejectedFiles[0].errors[0].message, {
                                                        className: '!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium'
                                                    });
                                                }}
                                                multiple={false}
                                                maxSize={2000000}
                                            >
                                                {({ getRootProps, getInputProps }) => (
                                                    <div  {...getRootProps()} className={`min-h-[15rem] ${stepOne.formState.errors.kycFiles?.[0]?.file && !stepOne.getValues('kycFiles.0.file') ? "border-[#e95d5d] bg-[#FFF8F8]" : ""} flex justify-center items-center rounded-3xl border border-dashed py-4 px-6 ${stepOne.getValues('kycFiles.0.file') ? "border-green-800 bg-green-50" : "border-[#AFAFAF] bg-[#F0F0F0]"}`}>
                                                        <div className={`inline-flex flex-col items-center cursor-pointer`}>
                                                            <FileDown className={`h-10 w-10 text-[#AFAFAF]`} />
                                                            <h3 className={`mt-2 text-sm`}>{`Justificatif d'identité`}</h3>
                                                            {stepOne.getValues('kycFiles.0.file') ?
                                                                <>
                                                                    <p className={`mt-6 text-xs mb-1 text-center font-medium`}>Fichier ajouté ! Cliquer pour changer le fichier</p>
                                                                    <p className={`font-light text-center text-[#626262] text-xs`}>{stepOne.getValues('kycFiles.0.file').name}</p>
                                                                </> :
                                                                <>
                                                                    <p className={`mt-6 text-xs text-center font-medium`}>Cliquer pour ajouter votre fichier</p>
                                                                    <p className={`font-light text-center text-xs`}>Votre document doit être au format Image ou PDF</p>
                                                                </>
                                                            }
                                                        </div>
                                                        <Input
                                                            {...getInputProps()}
                                                            id="dropzone-file"
                                                            accept="image/png, image/jpeg, application/pdf"
                                                            type="file"
                                                            className="hidden"
                                                        />
                                                    </div>
                                                )}
                                            </Dropzone>
                                        )}
                                    />
                                    <div className={`flex items-center justify-end mt-2`}>
                                        <p className={`font-light text-xs md:text-[9.6px] lg:text-[11px] xl:text-xs`}>Ajoutez avant de continuer. <Link className={`font-medium underline`} href={Routes.dashboard.home.replace('{lang}', lang)}>Ajouter plus tard</Link></p>
                                    </div>
                                    <div className={`mt-1 md:mt-3 ${showProgressBars ? "block" : "hidden"} duration-200`}>
                                        <span className={`text-sm font-light`}>{findValueByKey(progressObject, stepOne.getValues('kycFiles.0.type')) ?? 0}%</span>
                                        <div className={`relative`}>
                                            <Progress value={findValueByKey(progressObject, stepOne.getValues('kycFiles.0.type'))} className="w-[100%] bg-[#DBDBDB] mt-0.5 h-2" />
                                            <svg className={`${findValueByKey(progressObject, stepOne.getValues('kycFiles.0.type')) == 100 ? "block" : "hidden"} duration-200 absolute -right-[2px] top-[-7px]`} width="22" height="22" viewBox="0 0 22 22">
                                                <g transform="translate(-646.519 -863.519)">
                                                    <g transform="translate(648.519 865.519)" stroke="#f4f4f7" strokeWidth="2">
                                                        <circle cx="9" cy="9" r="9" stroke="none"/>
                                                        <circle cx="9" cy="9" r="10" fill="none"/>
                                                    </g>
                                                    <path d="M11.942,7.064a.507.507,0,0,0-.72,0L7.444,10.847,5.856,9.255a.518.518,0,1,0-.72.745l1.947,1.947a.507.507,0,0,0,.72,0L11.942,7.81a.507.507,0,0,0,0-.745Z" transform="translate(649.061 865.013)" fill="#fff" stroke="#fff" strokeWidth="1.5"/>
                                                </g>
                                            </svg>
                                        </div>
                                    </div>
                                    <FormField
                                        control={stepOne.control}
                                        name="kycFiles.0.type"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="hidden" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className={`col-span-1 md:col-span-2`}>
                                </div>
                            </div>
                        }
                        {legalForm.company_type == 2 &&
                            <div className={`grid grid-cols-1 md:grid-cols-6 gap-4`}>
                                <div className={`col-span-1 md:col-span-2`}>
                                    <FormField
                                        control={stepOne.control}
                                        name="kycFiles.0.file"
                                        render={(field) => (
                                            <Dropzone
                                                accept={{
                                                    "image/*": [".jpg", ".jpeg", ".png"],
                                                    "application/pdf": [".pdf"],
                                                }}
                                                onDropAccepted={(acceptedFiles) => {
                                                    acceptedFiles.map((acceptedFile) => {
                                                        return stepOne.setValue('kycFiles.0.file', acceptedFile);
                                                    });
                                                }}
                                                onDropRejected={(rejectedFiles) => {
                                                    console.log(rejectedFiles);
                                                    return toast.error(rejectedFiles[0].errors[0].code == 'file-too-large' ? "La taille du fichier est supérieur à limite autorisée (2MB)" : rejectedFiles[0].errors[0].message, {
                                                        className: '!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium'
                                                    });
                                                }}
                                                multiple={false}
                                                maxSize={2000000}
                                            >
                                                {({ getRootProps, getInputProps }) => (
                                                    <div  {...getRootProps()} className={`min-h-[15rem] ${stepOne.formState.errors.kycFiles?.[0]?.file && !stepOne.getValues('kycFiles.0.file') ? "border-[#e95d5d] bg-[#FFF8F8]" : ""} flex justify-center items-center rounded-3xl border border-dashed py-4 px-6 ${stepOne.getValues('kycFiles.0.file') ? "border-green-800 bg-green-50" : "border-[#AFAFAF] bg-[#F0F0F0]"}`}>
                                                        <div className={`inline-flex flex-col items-center cursor-pointer`}>
                                                            <FileDown className={`h-10 w-10 text-[#AFAFAF]`} />
                                                            <h3 className={`mt-2 text-sm`}>Déclaration fiscale</h3>
                                                            {stepOne.getValues('kycFiles.0.file') ?
                                                                <>
                                                                    <p className={`mt-6 text-xs mb-1 text-center font-medium`}>Fichier ajouté ! Cliquer pour changer le fichier</p>
                                                                    <p className={`font-light text-center text-[#626262] text-xs`}>{stepOne.getValues('kycFiles.0.file').name}</p>
                                                                </> :
                                                                <>
                                                                    <p className={`mt-6 text-xs text-center font-medium`}>Cliquer pour ajouter votre fichier</p>
                                                                    <p className={`font-light text-center text-xs`}>Votre document doit être au format Image ou PDF</p>
                                                                </>
                                                            }
                                                        </div>
                                                        <Input
                                                            {...getInputProps()}
                                                            id="dropzone-file"
                                                            accept="image/png, image/jpeg, application/pdf"
                                                            type="file"
                                                            className="hidden"
                                                        />
                                                    </div>
                                                )}
                                            </Dropzone>
                                        )}
                                    />
                                    {/*<Label htmlFor="picture" className={`mb-2 block`}>Déclaration fiscale</Label>*/}
                                    {/*<FormField*/}
                                    {/*    control={stepOne.control}*/}
                                    {/*    name="kycFiles.0.file"*/}
                                    {/*    render={({field}) => (*/}
                                    {/*        <FormItem>*/}
                                    {/*            <FormControl>*/}
                                    {/*                <Input type="file" onChange={(event) => {*/}
                                    {/*                    field.onChange(event.target?.files?.[0] ?? undefined);*/}
                                    {/*                }} disabled={isLoading} />*/}
                                    {/*            </FormControl>*/}
                                    {/*        </FormItem>*/}
                                    {/*    )}*/}
                                    {/*/>*/}

                                    <div className={`mt-1 md:mt-2.5 ${showProgressBars ? "block" : "hidden"} duration-200`}>
                                        <span className={`text-sm font-light`}>{findValueByKey(progressObject, stepOne.getValues('kycFiles.0.type')) ?? 0}%</span>
                                        <div className={`relative`}>
                                            <Progress value={findValueByKey(progressObject, stepOne.getValues('kycFiles.0.type'))} className="w-[100%] bg-[#DBDBDB] mt-0.5 h-2" />
                                            <svg className={`${findValueByKey(progressObject, stepOne.getValues('kycFiles.0.type')) == 100 ? "block" : "hidden"} duration-200 absolute -right-[2px] top-[-7px]`} width="22" height="22" viewBox="0 0 22 22">
                                                <g transform="translate(-646.519 -863.519)">
                                                    <g transform="translate(648.519 865.519)" stroke="#f4f4f7" strokeWidth="2">
                                                        <circle cx="9" cy="9" r="9" stroke="none"/>
                                                        <circle cx="9" cy="9" r="10" fill="none"/>
                                                    </g>
                                                    <path d="M11.942,7.064a.507.507,0,0,0-.72,0L7.444,10.847,5.856,9.255a.518.518,0,1,0-.72.745l1.947,1.947a.507.507,0,0,0,.72,0L11.942,7.81a.507.507,0,0,0,0-.745Z" transform="translate(649.061 865.013)" fill="#fff" stroke="#fff" strokeWidth="1.5"/>
                                                </g>
                                            </svg>
                                        </div>
                                    </div>
                                    <FormField
                                        control={stepOne.control}
                                        name="kycFiles.0.type"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="hidden" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className={`col-span-1 md:col-span-2`}>
                                    {/*<Label htmlFor="picture" className={`mb-2 block`}>{`Justificatif d'identité`}</Label>*/}
                                    {/*<FormField*/}
                                    {/*    control={stepOne.control}*/}
                                    {/*    name="kycFiles.1.file"*/}
                                    {/*    render={({field}) => (*/}
                                    {/*        <FormItem>*/}
                                    {/*            <FormControl>*/}
                                    {/*                <Input type="file" onChange={(event) => {*/}
                                    {/*                    field.onChange(event.target?.files?.[0] ?? undefined);*/}
                                    {/*                }} disabled={isLoading} />*/}
                                    {/*            </FormControl>*/}
                                    {/*        </FormItem>*/}
                                    {/*    )}*/}
                                    {/*/>*/}
                                    <FormField
                                        control={stepOne.control}
                                        name="kycFiles.1.file"
                                        render={(field) => (
                                            <Dropzone
                                                accept={{
                                                    "image/*": [".jpg", ".jpeg", ".png"],
                                                    "application/pdf": [".pdf"],
                                                }}
                                                onDropAccepted={(acceptedFiles) => {
                                                    acceptedFiles.map((acceptedFile) => {
                                                        return stepOne.setValue('kycFiles.1.file', acceptedFile);
                                                    });
                                                }}
                                                onDropRejected={(rejectedFiles) => {
                                                    console.log(rejectedFiles);
                                                    return toast.error(rejectedFiles[0].errors[0].code == 'file-too-large' ? "La taille du fichier est supérieur à limite autorisée (2MB)" : rejectedFiles[0].errors[0].message, {
                                                        className: '!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium'
                                                    });
                                                }}
                                                multiple={false}
                                                maxSize={2000000}
                                            >
                                                {({ getRootProps, getInputProps }) => (
                                                    <div  {...getRootProps()} className={`min-h-[15rem] ${stepOne.formState.errors.kycFiles?.[1]?.file && !stepOne.getValues('kycFiles.1.file') ? "border-[#e95d5d] bg-[#FFF8F8]" : ""} flex justify-center items-center rounded-3xl border border-dashed py-4 px-6 ${stepOne.getValues('kycFiles.1.file') ? "border-green-800 bg-green-50" : "border-[#AFAFAF] bg-[#F0F0F0]"}`}>
                                                        <div className={`inline-flex flex-col items-center cursor-pointer`}>
                                                            <FileDown className={`h-10 w-10 text-[#AFAFAF]`} />
                                                            <h3 className={`mt-2 text-sm`}>{`Justificatif d'identité`}</h3>
                                                            {stepOne.getValues('kycFiles.1.file') ?
                                                                <>
                                                                    <p className={`mt-6 text-xs mb-1 text-center font-medium`}>Fichier ajouté ! Cliquer pour changer le fichier</p>
                                                                    <p className={`font-light text-center text-[#626262] text-xs`}>{stepOne.getValues('kycFiles.1.file').name}</p>
                                                                </> :
                                                                <>
                                                                    <p className={`mt-6 text-xs text-center font-medium`}>Cliquer pour ajouter votre fichier</p>
                                                                    <p className={`font-light text-center text-xs`}>Votre document doit être au format Image ou PDF</p>
                                                                </>
                                                            }
                                                        </div>
                                                        <Input
                                                            {...getInputProps()}
                                                            id="dropzone-file"
                                                            accept="image/png, image/jpeg, application/pdf"
                                                            type="file"
                                                            className="hidden"
                                                        />
                                                    </div>
                                                )}
                                            </Dropzone>
                                        )}
                                    />
                                    <div className={`mt-1 md:mt-2.5 ${showProgressBars ? "block" : "hidden"} duration-200`}>
                                        <span className={`text-sm font-light`}>{findValueByKey(progressObject, stepOne.getValues('kycFiles.1.type')) ?? 0}%</span>
                                        <div className={`relative`}>
                                            <Progress value={findValueByKey(progressObject, stepOne.getValues('kycFiles.1.type'))} className="w-[100%] bg-[#DBDBDB] mt-0.5 h-2" />
                                            <svg className={`${findValueByKey(progressObject, stepOne.getValues('kycFiles.1.type')) == 100 ? "block" : "hidden"} duration-200 absolute -right-[2px] top-[-7px]`} width="22" height="22" viewBox="0 0 22 22">
                                                <g transform="translate(-646.519 -863.519)">
                                                    <g transform="translate(648.519 865.519)" stroke="#f4f4f7" strokeWidth="2">
                                                        <circle cx="9" cy="9" r="9" stroke="none"/>
                                                        <circle cx="9" cy="9" r="10" fill="none"/>
                                                    </g>
                                                    <path d="M11.942,7.064a.507.507,0,0,0-.72,0L7.444,10.847,5.856,9.255a.518.518,0,1,0-.72.745l1.947,1.947a.507.507,0,0,0,.72,0L11.942,7.81a.507.507,0,0,0,0-.745Z" transform="translate(649.061 865.013)" fill="#fff" stroke="#fff" strokeWidth="1.5"/>
                                                </g>
                                            </svg>
                                        </div>
                                    </div>
                                    <FormField
                                        control={stepOne.control}
                                        name="kycFiles.1.type"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="hidden" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className={`col-span-1 md:col-span-2`}>
                                    {/*<Label htmlFor="picture" className={`mb-2 block`}>{`RCCM`}</Label>*/}
                                    {/*<FormField*/}
                                    {/*    control={stepOne.control}*/}
                                    {/*    name="kycFiles.2.file"*/}
                                    {/*    render={({field}) => (*/}
                                    {/*        <FormItem>*/}
                                    {/*            <FormControl>*/}
                                    {/*                <Input type="file" onChange={(event) => {*/}
                                    {/*                    field.onChange(event.target?.files?.[0] ?? undefined);*/}
                                    {/*                }} disabled={isLoading}/>*/}
                                    {/*            </FormControl>*/}
                                    {/*        </FormItem>*/}
                                    {/*    )}*/}
                                    {/*/>*/}
                                    <FormField
                                        control={stepOne.control}
                                        name="kycFiles.2.file"
                                        render={(field) => (
                                            <Dropzone
                                                accept={{
                                                    "image/*": [".jpg", ".jpeg", ".png"],
                                                    "application/pdf": [".pdf"],
                                                }}
                                                onDropAccepted={(acceptedFiles) => {
                                                    acceptedFiles.map((acceptedFile) => {
                                                        return stepOne.setValue('kycFiles.2.file', acceptedFile);
                                                    });
                                                }}
                                                onDropRejected={(rejectedFiles) => {
                                                    console.log(rejectedFiles);
                                                    return toast.error(rejectedFiles[0].errors[0].code == 'file-too-large' ? "La taille du fichier est supérieur à limite autorisée (2MB)" : rejectedFiles[0].errors[0].message, {
                                                        className: '!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium'
                                                    });
                                                }}
                                                multiple={false}
                                                maxSize={2000000}
                                            >
                                                {({ getRootProps, getInputProps }) => (
                                                    <div  {...getRootProps()} className={`min-h-[15rem] ${stepOne.formState.errors.kycFiles?.[2]?.file && !stepOne.getValues('kycFiles.2.file') ? "border-[#e95d5d] bg-[#FFF8F8]" : ""} flex justify-center items-center rounded-3xl border border-dashed py-4 px-6 ${stepOne.getValues('kycFiles.2.file') ? "border-green-800 bg-green-50" : "border-[#AFAFAF] bg-[#F0F0F0]"}`}>
                                                        <div className={`inline-flex flex-col items-center cursor-pointer`}>
                                                            <FileDown className={`h-10 w-10 text-[#AFAFAF]`} />
                                                            <h3 className={`mt-2 text-sm`}>RCCM</h3>
                                                            {stepOne.getValues('kycFiles.2.file') ?
                                                                <>
                                                                    <p className={`mt-6 text-xs mb-1 text-center font-medium`}>Fichier ajouté ! Cliquer pour changer le fichier</p>
                                                                    <p className={`font-light text-center text-[#626262] text-xs`}>{stepOne.getValues('kycFiles.2.file').name}</p>
                                                                </> :
                                                                <>
                                                                    <p className={`mt-6 text-xs text-center font-medium`}>Cliquer pour ajouter votre fichier</p>
                                                                    <p className={`font-light text-center text-xs`}>Votre document doit être au format Image ou PDF</p>
                                                                </>
                                                            }
                                                        </div>
                                                        <Input
                                                            {...getInputProps()}
                                                            id="dropzone-file"
                                                            accept="image/png, image/jpeg, application/pdf"
                                                            type="file"
                                                            className="hidden"
                                                        />
                                                    </div>
                                                )}
                                            </Dropzone>
                                        )}
                                    />
                                    <div className={`flex items-center justify-end mt-2`}>
                                        <p className={`font-light text-xs md:text-[9.6px] lg:text-[11px] xl:text-xs`}>Ajoutez avant de continuer. <Link className={`font-medium underline`} href={Routes.dashboard.home.replace('{lang}', lang)}>Ajouter plus tard</Link></p>
                                    </div>
                                    <div className={`mt-1 md:mt-3 ${showProgressBars ? "block" : "hidden"} duration-200`}>
                                        {/*<span className={`text-sm font-light`}>{findValueByKey(progressObject, stepOne.getValues('kycFiles.2.type')) ?? 0}%</span>*/}
                                        <div className={`relative`}>
                                            <Progress value={findValueByKey(progressObject, stepOne.getValues('kycFiles.2.type'))} className="w-[100%] bg-[#DBDBDB] mt-0.5 h-2" />
                                            <svg className={`${findValueByKey(progressObject, stepOne.getValues('kycFiles.2.type')) == 100 ? "block" : "hidden"} duration-200 absolute -right-[2px] top-[-7px]`} width="22" height="22" viewBox="0 0 22 22">
                                                <g transform="translate(-646.519 -863.519)">
                                                    <g transform="translate(648.519 865.519)" stroke="#f4f4f7" strokeWidth="2">
                                                        <circle cx="9" cy="9" r="9" stroke="none"/>
                                                        <circle cx="9" cy="9" r="10" fill="none"/>
                                                    </g>
                                                    <path d="M11.942,7.064a.507.507,0,0,0-.72,0L7.444,10.847,5.856,9.255a.518.518,0,1,0-.72.745l1.947,1.947a.507.507,0,0,0,.72,0L11.942,7.81a.507.507,0,0,0,0-.745Z" transform="translate(649.061 865.013)" fill="#fff" stroke="#fff" strokeWidth="1.5"/>
                                                </g>
                                            </svg>
                                        </div>
                                    </div>
                                    <FormField
                                        control={stepOne.control}
                                        name="kycFiles.2.type"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="hidden" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        }
                        {legalForm.company_type == 3 &&
                            <div className={`grid grid-cols-1 md:grid-cols-6 gap-4`}>
                                <div className={`col-span-1 md:col-span-2`}>
                                    <FormField
                                        control={stepOne.control}
                                        name="kycFiles.0.file"
                                        render={(field) => (
                                            <Dropzone
                                                accept={{
                                                    "image/*": [".jpg", ".jpeg", ".png"],
                                                    "application/pdf": [".pdf"],
                                                }}
                                                onDropAccepted={(acceptedFiles) => {
                                                    acceptedFiles.map((acceptedFile) => {
                                                        return stepOne.setValue('kycFiles.0.file', acceptedFile);
                                                    });
                                                }}
                                                onDropRejected={(rejectedFiles) => {
                                                    console.log(rejectedFiles);
                                                    return toast.error(rejectedFiles[0].errors[0].code == 'file-too-large' ? "La taille du fichier est supérieur à limite autorisée (2MB)" : rejectedFiles[0].errors[0].message, {
                                                        className: '!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium'
                                                    });
                                                }}
                                                multiple={false}
                                                maxSize={2000000}
                                            >
                                                {({ getRootProps, getInputProps }) => (
                                                    <div  {...getRootProps()} className={`min-h-[15rem] ${stepOne.formState.errors.kycFiles?.[0]?.file && !stepOne.getValues('kycFiles.0.file') ? "border-[#e95d5d] bg-[#FFF8F8]" : ""} flex justify-center items-center rounded-3xl border border-dashed py-4 px-6 ${stepOne.getValues('kycFiles.0.file') ? "border-green-800 bg-green-50" : "border-[#AFAFAF] bg-[#F0F0F0]"}`}>
                                                        <div className={`inline-flex flex-col items-center cursor-pointer`}>
                                                            <FileDown className={`h-10 w-10 text-[#AFAFAF]`} />
                                                            <h3 className={`mt-2 text-sm`}>Déclaration fiscale</h3>
                                                            {stepOne.getValues('kycFiles.0.file') ?
                                                                <>
                                                                    <p className={`mt-6 text-xs mb-1 text-center font-medium`}>Fichier ajouté ! Cliquer pour changer le fichier</p>
                                                                    <p className={`font-light text-center text-[#626262] text-xs`}>{stepOne.getValues('kycFiles.0.file').name}</p>
                                                                </> :
                                                                <>
                                                                    <p className={`mt-6 text-xs text-center font-medium`}>Cliquer pour ajouter votre fichier</p>
                                                                    <p className={`font-light text-center text-xs`}>Votre document doit être au format Image ou PDF</p>
                                                                </>
                                                            }
                                                        </div>
                                                        <Input
                                                            {...getInputProps()}
                                                            id="dropzone-file"
                                                            accept="image/png, image/jpeg, application/pdf"
                                                            type="file"
                                                            className="hidden"
                                                        />
                                                    </div>
                                                )}
                                            </Dropzone>
                                        )}
                                    />
                                    {/*<Label htmlFor="picture" className={`mb-2 block`}>Déclaration fiscale</Label>*/}
                                    {/*<FormField*/}
                                    {/*    control={stepOne.control}*/}
                                    {/*    name="kycFiles.0.file"*/}
                                    {/*    render={({field}) => (*/}
                                    {/*        <FormItem>*/}
                                    {/*            <FormControl>*/}
                                    {/*                <Input type="file" onChange={(event) => {*/}
                                    {/*                    field.onChange(event.target?.files?.[0] ?? undefined);*/}
                                    {/*                }} disabled={isLoading} />*/}
                                    {/*            </FormControl>*/}
                                    {/*        </FormItem>*/}
                                    {/*    )}*/}
                                    {/*/>*/}
                                    <div className={`mt-1 md:mt-2.5 ${showProgressBars ? "block" : "hidden"} duration-200`}>
                                        <span className={`text-sm font-light`}>{findValueByKey(progressObject, stepOne.getValues('kycFiles.0.type')) ?? 0}%</span>
                                        <div className={`relative`}>
                                            <Progress value={findValueByKey(progressObject, stepOne.getValues('kycFiles.0.type'))} className="w-[100%] bg-[#DBDBDB] mt-0.5 h-2" />
                                            <svg className={`${findValueByKey(progressObject, stepOne.getValues('kycFiles.0.type')) == 100 ? "block" : "hidden"} duration-200 absolute -right-[2px] top-[-7px]`} width="22" height="22" viewBox="0 0 22 22">
                                                <g transform="translate(-646.519 -863.519)">
                                                    <g transform="translate(648.519 865.519)" stroke="#f4f4f7" strokeWidth="2">
                                                        <circle cx="9" cy="9" r="9" stroke="none"/>
                                                        <circle cx="9" cy="9" r="10" fill="none"/>
                                                    </g>
                                                    <path d="M11.942,7.064a.507.507,0,0,0-.72,0L7.444,10.847,5.856,9.255a.518.518,0,1,0-.72.745l1.947,1.947a.507.507,0,0,0,.72,0L11.942,7.81a.507.507,0,0,0,0-.745Z" transform="translate(649.061 865.013)" fill="#fff" stroke="#fff" strokeWidth="1.5"/>
                                                </g>
                                            </svg>
                                        </div>
                                    </div>
                                    <FormField
                                        control={stepOne.control}
                                        name="kycFiles.0.type"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="hidden" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className={`col-span-1 md:col-span-2`}>
                                    {/*<Label htmlFor="picture" className={`mb-2 block`}>{`Justificatif d'identité`}</Label>*/}
                                    {/*<FormField*/}
                                    {/*    control={stepOne.control}*/}
                                    {/*    name="kycFiles.1.file"*/}
                                    {/*    render={({field}) => (*/}
                                    {/*        <FormItem>*/}
                                    {/*            <FormControl>*/}
                                    {/*                <Input type="file" onChange={(event) => {*/}
                                    {/*                    field.onChange(event.target?.files?.[0] ?? undefined);*/}
                                    {/*                }} disabled={isLoading} />*/}
                                    {/*            </FormControl>*/}
                                    {/*        </FormItem>*/}
                                    {/*    )}*/}
                                    {/*/>*/}
                                    <FormField
                                        control={stepOne.control}
                                        name="kycFiles.1.file"
                                        render={(field) => (
                                            <Dropzone
                                                accept={{
                                                    "image/*": [".jpg", ".jpeg", ".png"],
                                                    "application/pdf": [".pdf"],
                                                }}
                                                onDropAccepted={(acceptedFiles) => {
                                                    acceptedFiles.map((acceptedFile) => {
                                                        return stepOne.setValue('kycFiles.1.file', acceptedFile);
                                                    });
                                                }}
                                                onDropRejected={(rejectedFiles) => {
                                                    console.log(rejectedFiles);
                                                    return toast.error(rejectedFiles[0].errors[0].code == 'file-too-large' ? "La taille du fichier est supérieur à limite autorisée (2MB)" : rejectedFiles[0].errors[0].message, {
                                                        className: '!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium'
                                                    });
                                                }}
                                                multiple={false}
                                                maxSize={2000000}
                                            >
                                                {({ getRootProps, getInputProps }) => (
                                                    <div  {...getRootProps()} className={`min-h-[15rem] ${stepOne.formState.errors.kycFiles?.[1]?.file && !stepOne.getValues('kycFiles.1.file') ? "border-[#e95d5d] bg-[#FFF8F8]" : ""} flex justify-center items-center rounded-3xl border border-dashed py-4 px-6 ${stepOne.getValues('kycFiles.1.file') ? "border-green-800 bg-green-50" : "border-[#AFAFAF] bg-[#F0F0F0]"}`}>
                                                        <div className={`inline-flex flex-col items-center cursor-pointer`}>
                                                            <FileDown className={`h-10 w-10 text-[#AFAFAF]`} />
                                                            <h3 className={`mt-2 text-sm`}>{`Justificatif d'identité`}</h3>
                                                            {stepOne.getValues('kycFiles.1.file') ?
                                                                <>
                                                                    <p className={`mt-6 text-xs mb-1 text-center font-medium`}>Fichier ajouté ! Cliquer pour changer le fichier</p>
                                                                    <p className={`font-light text-center text-[#626262] text-xs`}>{stepOne.getValues('kycFiles.1.file').name}</p>
                                                                </> :
                                                                <>
                                                                    <p className={`mt-6 text-xs text-center font-medium`}>Cliquer pour ajouter votre fichier</p>
                                                                    <p className={`font-light text-center text-xs`}>Votre document doit être au format Image ou PDF</p>
                                                                </>
                                                            }
                                                        </div>
                                                        <Input
                                                            {...getInputProps()}
                                                            id="dropzone-file"
                                                            accept="image/png, image/jpeg, application/pdf"
                                                            type="file"
                                                            className="hidden"
                                                        />
                                                    </div>
                                                )}
                                            </Dropzone>
                                        )}
                                    />
                                    <div className={`mt-1 md:mt-2.5 ${showProgressBars ? "block" : "hidden"} duration-200`}>
                                        <span className={`text-sm font-light`}>{findValueByKey(progressObject, stepOne.getValues('kycFiles.1.type')) ?? 0}%</span>
                                        <div className={`relative`}>
                                            <Progress value={findValueByKey(progressObject, stepOne.getValues('kycFiles.1.type'))} className="w-[100%] bg-[#DBDBDB] mt-0.5 h-2" />
                                            <svg className={`${findValueByKey(progressObject, stepOne.getValues('kycFiles.1.type')) == 100 ? "block" : "hidden"} duration-200 absolute -right-[2px] top-[-7px]`} width="22" height="22" viewBox="0 0 22 22">
                                                <g transform="translate(-646.519 -863.519)">
                                                    <g transform="translate(648.519 865.519)" stroke="#f4f4f7" strokeWidth="2">
                                                        <circle cx="9" cy="9" r="9" stroke="none"/>
                                                        <circle cx="9" cy="9" r="10" fill="none"/>
                                                    </g>
                                                    <path d="M11.942,7.064a.507.507,0,0,0-.72,0L7.444,10.847,5.856,9.255a.518.518,0,1,0-.72.745l1.947,1.947a.507.507,0,0,0,.72,0L11.942,7.81a.507.507,0,0,0,0-.745Z" transform="translate(649.061 865.013)" fill="#fff" stroke="#fff" strokeWidth="1.5"/>
                                                </g>
                                            </svg>
                                        </div>
                                    </div>
                                    <FormField
                                        control={stepOne.control}
                                        name="kycFiles.1.type"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="hidden" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className={`col-span-1 md:col-span-2`}>
                                    {/*<Label htmlFor="picture" className={`mb-2 block`}>{`RCCM`}</Label>*/}
                                    {/*<FormField*/}
                                    {/*    control={stepOne.control}*/}
                                    {/*    name="kycFiles.2.file"*/}
                                    {/*    render={({field}) => (*/}
                                    {/*        <FormItem>*/}
                                    {/*            <FormControl>*/}
                                    {/*                <Input type="file" onChange={(event) => {*/}
                                    {/*                    field.onChange(event.target?.files?.[0] ?? undefined);*/}
                                    {/*                }} disabled={isLoading}/>*/}
                                    {/*            </FormControl>*/}
                                    {/*        </FormItem>*/}
                                    {/*    )}*/}
                                    {/*/>*/}
                                    <FormField
                                        control={stepOne.control}
                                        name="kycFiles.2.file"
                                        render={(field) => (
                                            <Dropzone
                                                accept={{
                                                    "image/*": [".jpg", ".jpeg", ".png"],
                                                    "application/pdf": [".pdf"],
                                                }}
                                                onDropAccepted={(acceptedFiles) => {
                                                    acceptedFiles.map((acceptedFile) => {
                                                        return stepOne.setValue('kycFiles.2.file', acceptedFile);
                                                    });
                                                }}
                                                onDropRejected={(rejectedFiles) => {
                                                    console.log(rejectedFiles);
                                                    return toast.error(rejectedFiles[0].errors[0].code == 'file-too-large' ? "La taille du fichier est supérieur à limite autorisée (2MB)" : rejectedFiles[0].errors[0].message, {
                                                        className: '!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium'
                                                    });
                                                }}
                                                multiple={false}
                                                maxSize={2000000}
                                            >
                                                {({ getRootProps, getInputProps }) => (
                                                    <div  {...getRootProps()} className={`min-h-[15rem] ${stepOne.formState.errors.kycFiles?.[2]?.file && !stepOne.getValues('kycFiles.2.file') ? "border-[#e95d5d] bg-[#FFF8F8]" : ""} flex justify-center items-center rounded-3xl border border-dashed py-4 px-6 ${stepOne.getValues('kycFiles.2.file') ? "border-green-800 bg-green-50" : "border-[#AFAFAF] bg-[#F0F0F0]"}`}>
                                                        <div className={`inline-flex flex-col items-center cursor-pointer`}>
                                                            <FileDown className={`h-10 w-10 text-[#AFAFAF]`} />
                                                            <h3 className={`mt-2 text-sm`}>Décision Ministériel</h3>
                                                            {stepOne.getValues('kycFiles.2.file') ?
                                                                <>
                                                                    <p className={`mt-6 text-xs mb-1 text-center font-medium`}>Fichier ajouté ! Cliquer pour changer le fichier</p>
                                                                    <p className={`font-light text-center text-[#626262] text-xs`}>{stepOne.getValues('kycFiles.2.file').name}</p>
                                                                </> :
                                                                <>
                                                                    <p className={`mt-6 text-xs text-center font-medium`}>Cliquer pour ajouter votre fichier</p>
                                                                    <p className={`font-light text-center text-xs`}>Votre document doit être au format Image ou PDF</p>
                                                                </>
                                                            }
                                                        </div>
                                                        <Input
                                                            {...getInputProps()}
                                                            id="dropzone-file"
                                                            accept="image/png, image/jpeg, application/pdf"
                                                            type="file"
                                                            className="hidden"
                                                        />
                                                    </div>
                                                )}
                                            </Dropzone>
                                        )}
                                    />
                                    <div className={`flex items-center justify-end mt-2`}>
                                        <p className={`font-light text-xs md:text-[9.6px] lg:text-[11px] xl:text-xs`}>Ajoutez avant de continuer. <Link className={`font-medium underline`} href={Routes.dashboard.home.replace('{lang}', lang)}>Ajouter plus tard</Link></p>
                                    </div>
                                    <div className={`mt-1 md:mt-3 ${showProgressBars ? "block" : "hidden"} duration-200`}>
                                        {/*<span className={`text-sm font-light`}>{findValueByKey(progressObject, stepOne.getValues('kycFiles.2.type')) ?? 0}%</span>*/}
                                        <div className={`relative`}>
                                            <Progress value={findValueByKey(progressObject, stepOne.getValues('kycFiles.2.type'))} className="w-[100%] bg-[#DBDBDB] mt-0.5 h-2" />
                                            <svg className={`${findValueByKey(progressObject, stepOne.getValues('kycFiles.2.type')) == 100 ? "block" : "hidden"} duration-200 absolute -right-[2px] top-[-7px]`} width="22" height="22" viewBox="0 0 22 22">
                                                <g transform="translate(-646.519 -863.519)">
                                                    <g transform="translate(648.519 865.519)" stroke="#f4f4f7" strokeWidth="2">
                                                        <circle cx="9" cy="9" r="9" stroke="none"/>
                                                        <circle cx="9" cy="9" r="10" fill="none"/>
                                                    </g>
                                                    <path d="M11.942,7.064a.507.507,0,0,0-.72,0L7.444,10.847,5.856,9.255a.518.518,0,1,0-.72.745l1.947,1.947a.507.507,0,0,0,.72,0L11.942,7.81a.507.507,0,0,0,0-.745Z" transform="translate(649.061 865.013)" fill="#fff" stroke="#fff" strokeWidth="1.5"/>
                                                </g>
                                            </svg>
                                        </div>
                                    </div>
                                    <FormField
                                        control={stepOne.control}
                                        name="kycFiles.2.type"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="hidden" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        }
                        <div
                            className={`flex flex-col md:flex-row justify-center items-center space-y-1 md:space-x-5 mt-[3.5rem] md:mt-[5rem]`}>
                            <Button onClick={handleGoToBack} type={"button"}
                                    className={`!mb-1 bg-transparent text-black hover:text-white border border-black w-full md:w-[9rem] h-[2.8rem]`}
                                    disabled={isLoading}>
                                Retour
                            </Button>
                            <Button type={`submit`} className={`!mb-1 w-full md:w-[9rem] h-[2.8rem]`}
                                    disabled={isLoading}>
                                Uploader
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}