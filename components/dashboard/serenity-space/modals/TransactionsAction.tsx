"use client";

import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ITransaction } from "@/core/interfaces/transaction";
import {
  formatCFA,
  formatDate,
  getStatusBadge,
  getStatusName,
  getTransactionMode,
  getTransactionModeType,
  getTransactionType,
  TStatus,
} from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TransactionsActionProps {
  lang: string;
  children: React.ReactNode;
  transaction: ITransaction;
  open: boolean;
  setOpen: (value: ((prevState: boolean) => boolean) | boolean) => void;
}
import toast from "react-hot-toast";

export default function TransactionsAction({
  lang,
  children,
  transaction,
  open,
  setOpen,
}: TransactionsActionProps) {
  const copyPaymentLink = async (label: string, dataToCopy: string) => {
    try {
      await navigator.clipboard.writeText(dataToCopy);
      toast.success(`${label} copié!`, {
        className:
          "!bg-green-50 !max-w-xl !text-green-600 !shadow-2xl !shadow-green-50/50 text-sm font-medium",
      });
    } catch (err) {
      return toast.error("une erreur est survenue!", {
        className:
          "!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={`sm:max-w-[45rem] gap-2 overflow-x-hidden duration-200 !rounded-3xl bg-[#f4f4f7] px-3 py-3`}
      >
        <div>
          <div className={`rounded-t-2xl bg-white px-8 pb-4 pt-5`}>
            <div className={`flex justify-between items-center space-x-3`}>
              <h2
                className={`text-base text-[#626262] inline-flex items-center space-x-3 font-medium`}
              >
                <span>{`Description transaction`}</span>
                <div
                  className={`border text-black text-sm border-[#626262] line-clamp-1 font-normal rounded-md py-1 px-2 bg-[#F0F0F0]`}
                >
                  ID: {transaction?.transactionId}
                </div>
              </h2>
              <DialogClose className={`outline-none`}>
                <X strokeWidth={2.4} className={`text-[#767676] h-5 w-5`} />
              </DialogClose>
            </div>
          </div>
        </div>

        <div className={`min-h-[6rem] pt-6 pb-7 px-8 bg-white rounded-b-2xl`}>
          <div className={`grid grid-cols-1 gap-6`}>
            <div className={`grid grid-cols-4 gap-3`}>
              <div className={`col-span-4`}>
                <h2 className={`text-[#626262] -mb-3 text-[15px] font-medium`}>
                  Details transactions
                </h2>
              </div>
              <div>
                <div className={`inline-flex flex-col`}>
                  <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>
                    Type de transaction
                  </h3>
                  <span className={`text-sm font-medium leading-4`}>
                    {getTransactionType(transaction?.transaction_type.name)}
                  </span>
                </div>
              </div>
              <div>
                <div className={`inline-flex flex-col`}>
                  <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>
                    Montant
                  </h3>
                  <span className={`text-sm font-medium leading-4`}>
                    {formatCFA(transaction?.amount)}
                  </span>
                </div>
              </div>
              <div>
                <div className={`inline-flex flex-col`}>
                  <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>
                    Montant envoyé
                  </h3>
                  <span className={`text-sm font-medium leading-4`}>
                    {formatCFA(transaction?.amount)}
                  </span>
                </div>
              </div>
              <div>
                <div className={`inline-flex flex-col`}>
                  <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>
                    Frais de transaction
                  </h3>
                  <span className={`text-sm font-medium`}>{"-"}</span>
                </div>
              </div>
            </div>

            <div className={`grid grid-cols-4 gap-3`}>
              <div className={`col-span-4`}>
                <h2 className={`text-[#626262] -mb-3 text-[15px] font-medium`}>
                  Details bénéficiaire
                </h2>
              </div>
              <div>
                <div className={`inline-flex flex-col`}>
                  <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>
                    Nom bénéficiaire
                  </h3>
                  <span className={`text-sm font-medium leading-4`}>
                    {transaction?.customer_firstname == null &&
                    transaction?.customer_lastname == null
                      ? "-"
                      : `${transaction?.customer_firstname} ${transaction?.customer_lastname}`}
                  </span>
                </div>
              </div>
              <div>
                <div className={`inline-flex flex-col`}>
                  <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>
                    N° de compte
                  </h3>
                  <span className={`text-sm font-medium leading-4`}>
                    {transaction?.number}
                  </span>
                </div>
              </div>
              <div>
                <div className={`inline-flex flex-col`}>
                  <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>
                    Type de compte
                  </h3>
                  <span className={`text-sm font-medium leading-4`}>
                    {getTransactionModeType(transaction?.operator)}
                  </span>
                </div>
              </div>
            </div>

            <div className={`grid grid-cols-4 gap-3`}>
              <div className={`col-span-4`}>
                <h2 className={`text-[#626262] -mb-3 text-[15px] font-medium`}>
                  Details Opérateur
                </h2>
              </div>
              <div>
                <div className={`inline-flex flex-col`}>
                  <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>
                    Nom opérateur
                  </h3>
                  <span className={`text-sm font-medium leading-4`}>
                    {getTransactionMode(transaction?.operator)}
                  </span>
                </div>
              </div>
              <div>
                <div className={`inline-flex flex-col`}>
                  <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>
                    Référence
                  </h3>
                  <TooltipProvider delayDuration={10}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={`text-sm cursor-pointer font-medium leading-4 line-clamp-1`}
                        >
                          {transaction?.reference ?? "-"}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        onClick={() =>
                          copyPaymentLink(
                            "Référence",
                            (transaction?.reference ?? "-") as string
                          )
                        }
                      >
                        <p className={`text-xs`}>
                          {transaction?.reference ?? "-"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className={`col-span-2`}>
                <div className={`inline-flex flex-col`}>
                  <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>
                    ID Transaction
                  </h3>
                  <TooltipProvider delayDuration={10}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={`text-sm cursor-pointer font-medium leading-4 line-clamp-1`}
                        >
                          {transaction?.transactionId}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        onClick={() =>
                          copyPaymentLink(
                            "ID Transaction",
                            transaction?.transactionId as string
                          )
                        }
                      >
                        <p className={`text-xs`}>
                          {transaction?.transactionId}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            <div className={`grid grid-cols-4 gap-3`}>
              <div className={`col-span-4`}>
                <h2 className={`text-[#626262] -mb-3 text-[15px] font-medium`}>
                  Statut
                </h2>
              </div>
              <div>
                <div className={`inline-flex flex-col`}>
                  <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>
                    Statut actuel
                  </h3>
                  <span className={`text-sm font-medium leading-4`}>
                    {getStatusName(transaction?.status)}
                  </span>
                </div>
              </div>
              <div>
                <div className={`inline-flex flex-col`}>
                  <h3 className={`font-light text-[#626262] text-xs mb-0.5`}>
                    Date d’envoi
                  </h3>
                  <span className={`text-sm font-medium leading-4`}>
                    {formatDate(transaction?.createdAt, lang)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`flex justify-start items-center mt-3`}>
            <Button
              className={`mt-5 text-[13px] font-light text-black border border-black bg-transparent hover:text-white inline-flex items-center space-x-2 mr-3`}
            >
              <svg
                className={`h-4 w-4`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              <span>Télécharger le reçu</span>
            </Button>
            <Button
              className={`mt-5 text-[13px] font-light text-black border border-black inline-flex items-center space-x-2 bg-transparent hover:text-white`}
            >
              <svg
                className={`h-4 w-4`}
                viewBox="0 0 17.614 15.975"
                fill="currentColor"
              >
                <g transform="translate(-1.25 -2.25)">
                  <path
                    d="M12,7.25a.75.75,0,0,1,.75.75v5a.75.75,0,0,1-1.5,0V8A.75.75,0,0,1,12,7.25Z"
                    transform="translate(-1.943 -1.356)"
                  />
                  <path
                    d="M12,17a1,1,0,1,0-1-1A1,1,0,0,0,12,17Z"
                    transform="translate(-1.943 -2.568)"
                  />
                  <path
                    d="M7.021,4.074A3.882,3.882,0,0,1,10.057,2.25a3.883,3.883,0,0,1,3.036,1.824,41.378,41.378,0,0,1,2.95,4.8L16.4,9.5a33.008,33.008,0,0,1,2.134,4.16,3.1,3.1,0,0,1-.113,3.012,3.858,3.858,0,0,1-2.875,1.385,44.285,44.285,0,0,1-5.14.166h-.7a44.287,44.287,0,0,1-5.14-.166,3.858,3.858,0,0,1-2.875-1.385,3.1,3.1,0,0,1-.113-3.012A33.015,33.015,0,0,1,3.714,9.5l.357-.632A41.372,41.372,0,0,1,7.021,4.074Zm.966.76A41.064,41.064,0,0,0,5.113,9.525l-.3.528a32.712,32.712,0,0,0-2.082,4.035c-.359.971-.309,1.486-.032,1.884.3.424.85.714,2.028.869A43.967,43.967,0,0,0,9.759,17h.6a43.967,43.967,0,0,0,5.03-.156c1.178-.155,1.732-.445,2.028-.869.277-.4.327-.912-.032-1.884A32.708,32.708,0,0,0,15.3,10.053L15,9.525a41.068,41.068,0,0,0-2.874-4.691c-.791-1-1.4-1.355-2.07-1.355S8.777,3.83,7.987,4.834Z"
                    transform="translate(0)"
                    fillRule="evenodd"
                  />
                </g>
              </svg>
              <span>Réclamation sur la transaction</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
