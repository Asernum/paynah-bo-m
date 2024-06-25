import { Checkbox } from "@/components/ui/checkbox";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/dashboard/send-money/data-table/data-table-column-header";
import { formatCFA, formatDate, getStatusBadge, TStatus } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertTriangle, ClipboardList, RotateCw } from "lucide-react";
import React from "react";
// import {BeneficiariesDataType} from "@/components/dashboard/send-money/BeneficiariesTable";
import {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
} from "@/core/interfaces";
import { IBeneficiary } from "@/core/interfaces/beneficiary";

export function getColumns(lang: string): ColumnDef<IBeneficiary>[] {
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
      accessorKey: "reference",
      header: ({ column }) => (
        <DataTableColumnHeader
          className={`text-xs font-normal`}
          column={column}
          title="ID Destinataire"
        />
      ),
      cell: ({ row }) => (
        <div className="min-w-[6rem]">{row.getValue("reference")}</div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nom" />
      ),
      cell: ({ row }) => {
        return (
          <div className="">
            {`${row.original.lastName} ${row.original.firstName}`}
          </div>
        );
      },
    },
    {
      accessorKey: "paynahAccountNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Compte Paynah" />
      ),
      cell: ({ row }) => {
        return (
          <div className="">
            {row.original.infos && row.original.infos[0].paynahAccountNumber == null
              ? "-"
              : (row.original.infos ? row.original.infos[0].paynahAccountNumber : "-")}
          </div>
        );
      },
    },
    {
      accessorKey: "mobileMoneyId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Compte mobile money" />
      ),
      cell: ({ row }) => {
        return (
          <div className="">
            {row.original.infos && row.original.infos[0].number == null
                ? "-"
                : (row.original.infos ? row.original.infos[0].number : "-")}
          </div>
        );
      },
    },
    {
      accessorKey: "bankAccountId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Compte bancaire" />
      ),
      cell: ({ row }) => {
        return (
          <div className="">
            {row.original.infos && row.original.infos[0].paynahAccountNumber == null
                ? "-"
                : (row.original.infos ? row.original.infos[0].paynahAccountNumber : "-")}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date d'ajout" />
      ),
      cell: ({ row }) => {
        return (
          <div className="">{formatDate(row.getValue("createdAt"), lang)}</div>
        );
      },
    },
    // {
    //     accessorKey: "amount",
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Montant" />
    //     ),
    //     cell: ({ row }) => {
    //         return (
    //             <div className="">
    //                 {formatCFA(row.getValue("amount"))}
    //             </div>
    //         )
    //     },
    // },
    // {
    //     accessorKey: "account",
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Compte" />
    //     ),
    //     cell: ({ row }) => {
    //         return (
    //             <div className="">
    //                 {row.getValue("account")}
    //             </div>
    //         )
    //     },
    // },
    // {
    //     accessorKey: "status",
    //     header: ({ column }) => (
    //         <DataTableColumnHeader className={`text-xs font-normal`} column={column} title="Statut" />
    //     ),
    //     cell: ({ row }) => {
    //         const status = TStatus.find(
    //             (status) => status === row.original.status
    //         )

    //         if (!status) return null

    //         return (
    //             <div className="" dangerouslySetInnerHTML={{__html: getStatusBadge(status)}}></div>
    //         )
    //     },
    //     filterFn: (row, id, value) => {
    //         return Array.isArray(value) && value.includes(row.getValue(id))
    //     },
    //     enableSorting: false,
    //     enableHiding: false,
    // },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader
          className={`text-xs font-normal`}
          column={column}
          title="Actions"
        />
      ),
      cell: function Cell({ row }) {
        // const [isUpdatePending, startUpdateTransition] = React.useTransition()

        return (
          <div className={`text-center`}>
            <DropdownMenu>
              <DropdownMenuTrigger className={`focus:outline-none`} asChild>
                <button
                  className={`rounded-full bg-[#f0f0f0] hover:bg-gray-200 duration-200 p-1`}
                >
                  <svg
                    className={`h-3 w-auto`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              {/* <DropdownMenuContent
                className="w-48 rounded-xl z-[100] shadow-md"
                align={"end"}
              >
                <DropdownMenuItem className={`text-xs cursor-pointer`}>
                  <ClipboardList className="mr-2 h-3.5 w-3.5" />
                  <span
                    className={`mt-[1.5px]`}
                  >{`Détails de l'opération`}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className={`text-xs cursor-pointer`}>
                  <AlertTriangle className="mr-2 h-3.5 w-3.5" />
                  <span className={`mt-[1.5px]`}>Faire une réclamation</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className={`text-xs cursor-pointer`}>
                  <RotateCw className="mr-2 h-3.5 w-3.5" />
                  <span className={`mt-[1.5px]`}>{`Refaire l'opération`}</span>
                </DropdownMenuItem>
              </DropdownMenuContent> */}
            </DropdownMenu>
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

export const filterableColumns: DataTableFilterableColumn<IBeneficiary>[] = [
  {
    id: "id",
    title: "",
    options: [],
  },
];
