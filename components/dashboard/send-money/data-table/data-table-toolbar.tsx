"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { fr, enUS } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "@/components/dashboard/send-money/data-table/data-table-faceted-filter";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, RotateCcw, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import Routes from "@/components/Routes";
import { ScaleLoader } from "react-spinners";
interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  newRowLink?: string;
  deleteRowsAction?: React.MouseEventHandler<HTMLButtonElement>;
  pSearch: string;
  setPSearch: (value: ((prevState: string) => string) | string) => void;
  pStatus: string;
  setPStatus: (value: ((prevState: string) => string) | string) => void;
  date: DateRange | undefined;
  setDate: (
    value:
      | ((prevState: DateRange | undefined) => DateRange | undefined)
      | DateRange
      | undefined
  ) => void;
  lang: string;
  exportTransactionsData: (e: any) => void;
  isExportDataLoading: boolean;
  totalCount: string;
  setSelectedAccount: (value: ((prevState: string) => string) | string) => void;
}

export function DataTableToolbar<TData>({
  table,
  newRowLink,
  deleteRowsAction,
  pSearch,
  setPSearch,
  pStatus,
  setPStatus,
  date,
  setDate,
  lang,
  exportTransactionsData,
  isExportDataLoading,
  totalCount,
  setSelectedAccount,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [isDeletePending, startDeleteTransition] = React.useTransition();

  const formSchema = z.object({
    search: z.string(),
  });

  const filterableForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
    },
  });

  return (
    <>
      <div
        className={`flex space-y-2.5 2xl:space-y-0 items-start 2xl:items-center flex-col 2xl:flex-row 2xl:justify-between px-6 pt-4`}
      >
        <h2
          className={`font-medium text-base`}
        >{`Historique d'envois (${totalCount})`}</h2>
      </div>
      <div className={`px-6 pb-1`}>
        <Form {...filterableForm}>
          <form action="" className={`w-full`}>
            <div className={`grid grid-cols-12 gap-4`}>
              <div className={`col-span-7 2xl:col-span-4`}>
                <div className={`relative`}>
                  <Input
                    value={pSearch}
                    type={`text`}
                    className={`font-normal pl-9 bg-white text-xs rounded-full h-[2.5rem] w-full`}
                    placeholder="Recherchez"
                    onChange={(e) => {
                      setSelectedAccount("all");
                      setPSearch(e.target.value);
                    }}
                  />
                  <Search className={`absolute h-4 w-4 top-3 left-3`} />
                </div>
              </div>
              <div className={`col-span-4 2xl:col-span-2`}>
                <Select
                  onValueChange={(value) => setPStatus(value)}
                  defaultValue={pStatus}
                >
                  <SelectTrigger
                    className={`w-full 2xl:w-full text-xs h-[2.8rem] rounded-full bg-white border border-[#e4e4e4] font-normal`}
                  >
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent className={`bg-[#f0f0f0]`}>
                    <SelectItem
                      className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`}
                      value={"all"}
                    >
                      Tous
                    </SelectItem>
                    <SelectItem
                      className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`}
                      value={"Pending"}
                    >
                      En attente
                    </SelectItem>
                    <SelectItem
                      className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`}
                      value={"Approved"}
                    >
                      Effectué
                    </SelectItem>
                    <SelectItem
                      className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`}
                      value={"Declined"}
                    >
                      Echoué
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className={`col-span-4 2xl:col-span-3`}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full 2xl:w-full text-xs justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "dd LLL y", {
                              locale: lang == "fr" ? fr : enUS,
                            })}{" "}
                            -{" "}
                            {format(date.to, "dd LLL y", {
                              locale: lang == "fr" ? fr : enUS,
                            })}
                          </>
                        ) : (
                          format(date.from, "dd LLL y", {
                            locale: lang == "fr" ? fr : enUS,
                          })
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      // @ts-ignore
                      locale={lang == "fr" ? fr : enUS}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className={`col-span-4 2xl:col-span-2 flex justify-center`}>
                <Button
                  onClick={(e) => {
                    exportTransactionsData(e);
                    console.log("alert");
                  }}
                  className={`text-xs inline-flex w-full 2xl:w-32 items-center space-x-2`}
                  disabled={isExportDataLoading}
                >
                  {isExportDataLoading ? (
                    <ScaleLoader color="#fff" height={15} width={3} />
                  ) : (
                    <>
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
                      <span>Exporter</span>
                    </>
                  )}
                </Button>
              </div>
              <div
                className={`col-span-4 2xl:col-span-1 flex items-center justify-end`}
              >
                <a
                  className={``}
                  href={`${Routes.dashboard.sendMoney.replace("{lang}", lang)}`}
                >
                  <RotateCcw
                    strokeWidth={2.5}
                    className="text-[#D3D3D3] w-6 h-6"
                  />
                </a>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
