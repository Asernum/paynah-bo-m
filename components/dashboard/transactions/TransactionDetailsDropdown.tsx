"use client"

import { Button } from '@/components/ui/button';
import { ITransaction } from '@/core/interfaces/transaction';
// components/Dropdown.js
import React, { useState, useRef, useEffect } from 'react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {
    formatCFA,
    formatDate,
    getStatusBadge, getStatusName,
    getTransactionMode,
    getTransactionModeType,
    getTransactionType,
    TStatus
} from "@/lib/utils";
import toast from "react-hot-toast";

interface DropdownProps {
    transaction: ITransaction;
    lang: string;
    children: React.ReactNode;
}

export const TransactionDetailsDropdown = ({ transaction, lang, children }: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: any) => {
        // if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // setIsOpen(false);
        // }
    };

    const getFees = (transactionType: string, operator: string) => {
        let fees: number = 1;
        if (transactionType === 'PAYIN') {
            fees = 3;
        }
        if (transactionType === 'PAYOUT') {
            if (operator == 'WAVE') {
                fees = 0.01;
            } else if (operator == 'MTN') {
                fees = 0.005;
            }
        }
        return fees;
    }

    const getAmountDebited = (amount: number, fees: number) => {
        return amount + Math.ceil(fees * (amount / 100));
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const copyPaymentLink = async (label: string, dataToCopy: string) => {
        try {
            await navigator.clipboard.writeText(dataToCopy);
            toast.success(`${label} copié!`, {
                className: '!bg-green-50 !max-w-xl !text-green-600 !shadow-2xl !shadow-green-50/50 text-sm font-medium'
            });
        } catch (err) {
            return toast.error("une erreur est survenue!", {
                className: '!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium'
            });
        }
    }

    return (
        <div className="relative inline-block items-center justify-center" ref={dropdownRef}>
        <div onClick={toggleDropdown}>
            {children}
        </div>

        {isOpen && (
            <div className={`origin-top-right absolute h-auto right-0 w-[95.9rem] shadow-lg ring-1 bg-white ml-8 ring-black ring-opacity-5 ${isOpen ? 'z-50' : 'z-10'} mt-6 border-y-2 border-t-0 border-l-2 border-r-2 ${transaction.transaction_type.name == 'PAYIN' ? 'border-[#F7D8D8]' : 'border-[#ACEEFF]' } translate-x-9`}>
                <div className="py-1 flex text-left">
                    <div className={`min-h-[6rem] pt-6 pb-7 px-4 bg-white rounded-b-2xl`}>
                        <div className={`grid grid-cols-1 gap-1`}>
                            <div className=' w-full grid grid-cols-2 gap-3'>
                                <div className='col-span-1'>
                                    <h2 className='text-[#626262] -mb-3 text-[15px] font-medium'>Détails de transaction</h2>
                                    <div className={`grid grid-flow-col mt-4`}>
                                        <div className={`flex-col mr-2`}>
                                            <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>Type de transaction</h3>
                                            <span className={`text-sm font-medium leading-4`}>{getTransactionType(transaction.transaction_type.name)}</span>
                                        </div>
                                        <div className={`flex-col mr-2`}>
                                            <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>Montant</h3>
                                            <span className={`text-sm font-medium leading-4`}>{formatCFA(getAmountDebited(transaction.amount, getFees(transaction.transaction_type.name, transaction.operator)))}</span>
                                        </div>
                                        <div className={`flex-col mr-2`}>
                                            <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>Montant envoyé</h3>
                                            <span className={`text-sm font-medium leading-4`}>{formatCFA(transaction.amount)}</span>
                                        </div>
                                        <div className={`flex-col mr-2`}>
                                            <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>Frais de transaction</h3>
                                            <span className={`text-sm font-medium leading-4`}>{`${getFees(transaction.transaction_type.name, transaction.operator)}%`}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-span-1 ml-10'>
                                    <h2 className='text-[#626262] -mb-3 text-[15px] font-medium'>Détails Opérateur</h2>
                                    <div className={`grid grid-flow-col mt-4`}>
                                        <div className={`flex-col mr-2`}>
                                            <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>Nom Opérateur</h3>
                                            <span className={`text-sm font-medium leading-4`}>{getTransactionMode(transaction.operator)}</span>
                                        </div>
                                        <div className={`flex-col mr-2`}>
                                            <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>Référence</h3>
                                                <span className={`text-sm font-medium leading-4`}>
                                                    <TooltipProvider delayDuration={10}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span
                                                                    className={`text-sm cursor-pointer font-medium leading-4 line-clamp-1`}>{transaction.reference ?? "-"}</span>
                                                            </TooltipTrigger>
                                                            <TooltipContent onClick={() => copyPaymentLink('Référence', (transaction.reference ?? "-") as string)}>
                                                                <p className={`text-xs`}>{transaction.reference ?? "-"}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </span>
                                        </div>
                                        <div className={`flex-col mr-2`}>
                                            <h3 className={`font-light text-[#626262] text-xs mb-1`}>ID Transaction</h3>
                                            <span className={`text-sm font-medium leading-4`}>
                                                <TooltipProvider delayDuration={10}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span
                                                                className={`text-sm cursor-pointer font-medium leading-4 line-clamp-1`}>{transaction.transactionId}</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent onClick={() => copyPaymentLink('ID Transaction', transaction.transactionId as string)}>
                                                            <p className={`text-xs`}>{transaction.transactionId}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className=' w-full grid grid-cols-3 gap-3 mt-6'>
                                <div className='col-span-1'>
                                    <h2 className='text-[#626262] -mb-3 text-[15px] font-medium'>Détails {`${transaction.transaction_type.name == 'PAYIN' ? 'Destinataire' : 'Bénéficiaire'}`}</h2>
                                    <div className={`grid grid-flow-col mt-4`}>
                                        <div className={`flex-col mr-2`}>
                                            <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>Nom {`${transaction.transaction_type.name == 'PAYIN' ? 'destinataire' : 'bénéficiaire'}`}</h3>
                                            <span className={`text-sm font-medium leading-4`}>{transaction.customer_firstname == null && transaction.customer_lastname == null ? "-" : `${transaction.customer_firstname} ${transaction.customer_lastname}`}</span>
                                        </div>
                                        <div className={`flex-col mr-2`}>
                                            <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>N° de compte</h3>
                                            <span className={`text-sm font-medium leading-4`}>{transaction.number}</span>
                                        </div>
                                        <div className={`flex-col mr-2`}>
                                            <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>Type de compte</h3>
                                            <span className={`text-sm font-medium leading-4`}>{getTransactionModeType(transaction.operator)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-span-1 ml-10'>
                                    <h2 className='text-[#626262] -mb-3 text-[15px] font-medium'>Statut</h2>
                                    <div className={`grid grid-flow-col mt-4`}>
                                        <div className={`flex-col mr-2`}>
                                            <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>Nom Opérateur</h3>
                                            <span className={`text-sm font-medium leading-4`}>{getStatusName(transaction.status)}</span>
                                        </div>
                                        <div className={`flex-col mr-2`}>
                                            <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>Détails</h3>
                                            <span className={`text-sm font-medium leading-4`}>{formatDate(transaction.createdAt, lang)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-span-1'>
                                    <div className={`grid grid-flow-col`}>
                                        <div className={`flex justify-start items-center mt-3`}>
                                                        <Button
                                                            className={`mt-5 text-[13px] font-light text-black border border-black bg-transparent hover:text-white inline-flex items-center space-x-2 mr-3`}>
                                                            <svg className={`h-4 w-4`} viewBox="0 0 24 24" fill="none"
                                                                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                                strokeLinejoin="round">
                                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                                <polyline points="7 10 12 15 17 10"/>
                                                                <line x1="12" x2="12" y1="15" y2="3"/>
                                                            </svg>
                                                            <span>Télécharger le reçu</span>
                                                        </Button>
                                                        <Button
                                                            className={`mt-5 text-[13px] font-light text-black border border-black inline-flex items-center space-x-2 bg-transparent hover:text-white`}>
                                                            <svg className={`h-4 w-4`} viewBox="0 0 17.614 15.975" fill="currentColor">
                                                                <g
                                                                transform="translate(-1.25 -2.25)">
                                                                    <path
                                                                        d="M12,7.25a.75.75,0,0,1,.75.75v5a.75.75,0,0,1-1.5,0V8A.75.75,0,0,1,12,7.25Z"
                                                                        transform="translate(-1.943 -1.356)"/>
                                                                    <path
                                                                        d="M12,17a1,1,0,1,0-1-1A1,1,0,0,0,12,17Z"
                                                                        transform="translate(-1.943 -2.568)"/>
                                                                    <path
                                                                        d="M7.021,4.074A3.882,3.882,0,0,1,10.057,2.25a3.883,3.883,0,0,1,3.036,1.824,41.378,41.378,0,0,1,2.95,4.8L16.4,9.5a33.008,33.008,0,0,1,2.134,4.16,3.1,3.1,0,0,1-.113,3.012,3.858,3.858,0,0,1-2.875,1.385,44.285,44.285,0,0,1-5.14.166h-.7a44.287,44.287,0,0,1-5.14-.166,3.858,3.858,0,0,1-2.875-1.385,3.1,3.1,0,0,1-.113-3.012A33.015,33.015,0,0,1,3.714,9.5l.357-.632A41.372,41.372,0,0,1,7.021,4.074Zm.966.76A41.064,41.064,0,0,0,5.113,9.525l-.3.528a32.712,32.712,0,0,0-2.082,4.035c-.359.971-.309,1.486-.032,1.884.3.424.85.714,2.028.869A43.967,43.967,0,0,0,9.759,17h.6a43.967,43.967,0,0,0,5.03-.156c1.178-.155,1.732-.445,2.028-.869.277-.4.327-.912-.032-1.884A32.708,32.708,0,0,0,15.3,10.053L15,9.525a41.068,41.068,0,0,0-2.874-4.691c-.791-1-1.4-1.355-2.07-1.355S8.777,3.83,7.987,4.834Z"
                                                                        transform="translate(0)" fillRule="evenodd"/>
                                                                </g>
                                                            </svg>
                                                            <span>Réclamation sur la transaction</span>
                                                        </Button>
                                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};
