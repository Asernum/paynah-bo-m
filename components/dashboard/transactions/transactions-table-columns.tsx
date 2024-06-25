import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/dashboard/transactions/data-table/data-table-column-header";
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
import { Eye, X } from "lucide-react";
import React from "react";
import { TransactionsDataType } from "@/components/dashboard/transactions/TransactionsTable";
import {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
} from "@/core/interfaces";
import { TransactionsType } from "@/components/dashboard/serenity-space/LastTransactions";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { TransactionDetailsDropdown } from "@/components/dashboard/transactions/TransactionDetailsDropdown";
import { ITransaction } from "@/core/interfaces/transaction";
import { IAccount } from "@/core/interfaces/account";

const defaultAccount: IAccount = {
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

export function getColumns(
  lang: string,
  accounts: IAccount[]
): ColumnDef<ITransaction>[] {
  console.log("ACC1", accounts);
  const getBankAccount = (bankAccountId: string): any => {
    const searchAccount = accounts.find(
      (account: IAccount) => account.id == bankAccountId
    );
    return searchAccount !== undefined
      ? {
          coreBankId: searchAccount.coreBankId,
          name: searchAccount.isMain ? "Compte Principal" : searchAccount.name,
        }
      : { coreBankId: "-", name: "-" };
  };

  console.log("TEST", getBankAccount("baff465b-b1c3-406a-975b-941934575560"));

  return [
    // {
    //     id: "select",
    //     header: ({ table }) => (
    //         <Checkbox
    //             checked={
    //                 table.getIsAllPageRowsSelected() ||
    //                 (table.getIsSomePageRowsSelected() && "indeterminate")
    //             }
    //             onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //             aria-label="Select all"
    //             className="translate-y-[2px]"
    //         />
    //     ),
    //     cell: ({ row }) => (
    //         <Checkbox
    //             checked={row.getIsSelected()}
    //             onCheckedChange={(value) => row.toggleSelected(!!value)}
    //             aria-label="Select row"
    //             className="translate-y-[2px]"
    //         />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    // },
    {
      accessorKey: "transactionId",
      header: ({ column }) => (
        <DataTableColumnHeader
          className={`text-xs font-normal`}
          column={column}
          title="ID Transaction"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className={`inline-flex space-x-2.5 items-center`}>
            {row.original.transaction_type.name == "PAYOUT" && (
              <div className={`bg-[#D8F7FF] p-2 rounded-lg`}>
                <svg className={`h-3.5 w-3.5`} viewBox="0 0 11.783 11.783">
                  <path
                    id="Send"
                    d="M10.764,1.3a.943.943,0,0,1,1.2,1.2L8.857,11.387a.943.943,0,0,1-1.752.071l-1.6-3.6a.192.192,0,0,0-.1-.1l-3.6-1.6a.943.943,0,0,1,.071-1.752Zm.9.838a.376.376,0,0,0-.531-.531L5.618,7.12a.376.376,0,0,0,.531.531Z"
                    transform="translate(-0.75 -0.736)"
                    stroke="#000"
                    strokeWidth="1"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
            )}
            {row.original.transaction_type.name == "PAYIN" &&
              row.original.pos == null && (
                <div className={`bg-[#FFC5AF] p-2 rounded-lg`}>
                  <svg className={`h-3.5 w-3.5`} viewBox="0 0 11.144 10.914">
                    <g id="Link" transform="translate(0.378 0.15)">
                      <path
                        d="M7.534.5A3.556,3.556,0,0,0,5,1.55l-.523.523a.663.663,0,0,0,0,.938.679.679,0,0,0,.938,0l.523-.523A2.254,2.254,0,1,1,9.128,5.676L8.6,6.2a.664.664,0,0,0,.939.939l.523-.523A3.579,3.579,0,0,0,7.534.5ZM4.079,11.117A3.558,3.558,0,0,0,6.612,10.07l.522-.523a.663.663,0,0,0,0-.938.679.679,0,0,0-.938,0l-.523.523A2.254,2.254,0,1,1,2.485,5.943l.523-.523a.663.663,0,0,0-.938-.938l-.523.523a3.579,3.579,0,0,0,2.532,6.112Z"
                        transform="translate(-0.5 -0.503)"
                        stroke="#000"
                        strokeWidth="0.3"
                      />
                      <path
                        d="M9.043,13.566a.663.663,0,0,0,.938,0L13.55,10a.663.663,0,0,0,0-.938.679.679,0,0,0-.938,0L9.043,12.627a.664.664,0,0,0,0,.938Z"
                        transform="translate(-5.99 -6.005)"
                        stroke="#000"
                        strokeWidth="0.3"
                      />
                    </g>
                  </svg>
                </div>
              )}
            {row.original.transaction_type.name == "PAYIN" &&
              row.original.pos !== null && <div></div>}
            <div className="max-w-[10rem] leading-4">
              {row.getValue("transactionId")}
            </div>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader
          className={`text-xs font-normal`}
          column={column}
          title="Description"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="max-w-[25rem]">
            {row.original.transaction_type.name == "PAYOUT" && (
              <div>
                Envoi{" "}
                {row.original.customer_firstname == null &&
                row.original.customer_lastname == null
                  ? ""
                  : `à ${row.original.customer_firstname} ${row.original.customer_lastname}`}{" "}
                | {getTransactionMode(row.original.operator)}{" "}
                {getTransactionMode(row.original.number)} | Ref{" "}
                {row.original.reference ?? "-"}
              </div>
            )}
            {row.original.transaction_type.name == "PAYIN" &&
              row.original.pos == null && (
                <div>
                  Paiement{" "}
                  {row.original.customer_firstname == null &&
                  row.original.customer_lastname == null
                    ? ""
                    : `de ${row.original.customer_firstname} ${row.original.customer_lastname}`}{" "}
                  | {getTransactionMode(row.original.operator)}{" "}
                  {getTransactionMode(row.original.number)} | Via Guichet | Ref{" "}
                  {row.original.reference ?? "-"}
                </div>
              )}
            {row.original.transaction_type.name == "PAYIN" &&
              row.original.pos !== null && (
                <div>
                  Paiement {row.original.description} | ID Terminal{" "}
                  {row.original.tId} | Compte {row.original.number} | Ref{" "}
                  {row.original.reference ?? "-"}
                </div>
              )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "account",
      header: ({ column }) => (
        <DataTableColumnHeader
          className={`text-xs font-normal`}
          column={column}
          title="Compte impacté"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="max-w-[12rem]">
            <div className={`inline-flex flex-col space-y-0`}>
              <h3 className={`leading-4`}>
                {getBankAccount(row.original?.bankAccountId).name}
              </h3>
              {/* <h3 className={`leading-4`}>Compte Principal</h3> */}
              <div>
                <span className={`block -mt-0.5 text-[11px] text-[#6F7070]`}>
                  {getBankAccount(row.original.bankAccountId).coreBankId}
                  {/* 12342323223 */}
                </span>
              </div>
            </div>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader
          className={`text-xs font-normal`}
          column={column}
          title="Montant"
        />
      ),
      cell: ({ row }) => {
        return (
          <div
            className={`font-medium ${
              row.original.transaction_type.name == TransactionsType.DEBIT
                ? "text-[#ff0000]"
                : "text-[#19b2a6]"
            }`}
          >
            {row.original.transaction_type.name == TransactionsType.DEBIT
              ? "-"
              : ""}
            {formatCFA(row.original.amount)}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          className={`text-xs font-normal`}
          column={column}
          title="Date"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="">{formatDate(row.getValue("createdAt"), lang)}</div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          className={`text-xs font-normal`}
          column={column}
          title="Statut"
        />
      ),
      cell: ({ row }) => {
        return (
          <div
            className=""
            dangerouslySetInnerHTML={{
              __html: getStatusBadge(row.getValue("status")),
            }}
          ></div>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader
          className={`text-xs text-center font-normal`}
          column={column}
          title="Actions"
        />
      ),
      cell: function Cell({ row }) {
        // const [isUpdatePending, startUpdateTransition] = React.useTransition()

        return (
          <div
            className={`flex items-center justify-center`}
            onClick={() => {
              row.toggleSelected(!row.getIsSelected());
            }}
          >
            <TransactionDetailsDropdown
              lang={lang}
              transaction={row.original as ITransaction}
            >
              <Eye className={`h-5 w-5 text-[#D3D3D3] cursor-pointer`} />
            </TransactionDetailsDropdown>
          </div>
        );
      },
    },
  ];
}

export const searchableColumns: DataTableSearchableColumn[] = [
  // {
  //     id: "beneficiary",
  //     placeholder: "Rechercher...",
  // },
];

export const filterableColumns: DataTableFilterableColumn<ITransaction>[] = [
  {
    id: "status",
    title: "Statut de transaction",
    options: TStatus.map((status) => ({
      label: status[0]?.toUpperCase() + status.slice(1),
      value: status,
    })),
  },
];
