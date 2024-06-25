"use client";

import * as React from "react";
import { useRef, useEffect, RefObject } from "react";
import type { Table } from "@tanstack/react-table";
import { fr, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, RotateCcw, Search, Info } from "lucide-react";
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
import {
  format,
  add,
  sub,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Routes from "@/components/Routes";
import { ITransactionType } from "@/core/interfaces/transaction";
import { ITerminal } from "@/core/interfaces/pointOfSale";
// import { Tooltip } from "@/components/custom/tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IOperator } from "@/core/interfaces/operator";
import {left} from "@popperjs/core";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  newRowLink?: string;
  deleteRowsAction?: React.MouseEventHandler<HTMLButtonElement>;
  pSearch: string;
  setPSearch: (value: ((prevState: string) => string) | string) => void;
  pStatus: string;
  setPStatus: (value: ((prevState: string) => string) | string) => void;
  pType: string;
  setPType: (value: ((prevState: string) => string) | string) => void;
  pTerminalId: string;
  setPTerminalId: (value: ((prevState: string) => string) | string) => void;
  pPeriod: string;
  setPPeriod: (value: ((prevState: string) => string) | string) => void;
  pOperator: string;
  setPOperator: (value: ((prevState: string) => string) | string) => void;
  date: DateRange | undefined;
  setDate: (
    value:
      | ((prevState: DateRange | undefined) => DateRange | undefined)
      | DateRange
      | undefined
  ) => void;
  lang: string;
  transactionsTypes: ITransactionType[];
  terminals: ITerminal[];
  operators: IOperator[];
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
  transactionsTypes,
  terminals,
  pType,
  setPType,
  pTerminalId,
  setPTerminalId,
  pPeriod,
  setPPeriod,
  pOperator,
  setPOperator,
  operators,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [isDeletePending, startDeleteTransition] = React.useTransition();
  const popoverTriggerRef: RefObject<HTMLButtonElement> = useRef(null);

  const formSchema = z.object({
    search: z.string(),
  });

  const filterableForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
    },
  });

  const rewriteTransactionTypeName = (transactionTypeName: string) => {
    switch (transactionTypeName) {
      case "PAYIN":
        return "Acception";
      case "PAYOUT":
        return "Envoi";
      case "PAYIN_TOP_UP":
        return "Rechargement";
      default:
        return transactionTypeName;
    }
  };
  // const transactionsTypes = [
  //   {key: 'all', value: 'Tous types'},
  //   {key: 'PAYIN', value: 'Acception'},
  //   {key: 'PAYOUT', value: 'Envoi'},
  //   {key: 'PAYIN_TOP_UP', value: 'Rechargement'},
  // ];

  const transactionsStatus = [
    { key: "all", value: "Tous status" },
    { key: "Approved", value: "Approuvé" },
    { key: "Pending", value: "En cours" },
    { key: "Declined", value: "Échoué" },
    // {key: 'Expired', value: 'Expiré'},
  ];

  const transactionsOperators = [
    { key: "all", value: "Tous Opérateurs" },
  ];

  const periodeOptions = [
    { key: "today", value: "Aujourd'hui" },
    { key: "yesterday", value: "Hier" },
    { key: "lastSevenDays", value: "les 7 derniers jours" },
    { key: "lastMonth", value: "le mois dernier" },
    { key: "currentMonth", value: "le mois en cours" },
    { key: "custom", value: "Personnaliser" },
  ];

  // const Tpe = [
  //   {key: 'all', value: 'Tous TPE'},
  //   {key: 'T909E88RR', value: 'T909E88RR'},
  // ];

  const Services = [
    { key: "all", value: "Tous Points en ligne" },
    { key: "id", value: "Service 1" },
  ];

  console.log("terminals", terminals);

  const handlePeriodeOptionChange = (value: string) => {
    if (value == "today") {
      const dateRange: DateRange = {
        from: new Date(),
        to: add(new Date(), { days: 1 }),
      };
      setDate(dateRange);
    }
    if (value == "yesterday") {
      const dateRange: DateRange = {
        from: sub(new Date(), { days: 1 }),
        to: new Date(),
      };
      setDate(dateRange);
    }
    if (value == "lastSevenDays") {
      const dateRange: DateRange = {
        from: sub(new Date(), { days: 6 }),
        to: add(new Date(), { days: 1 }),
      };
      setDate(dateRange);
    }
    if (value == "lastMonth") {
      const dateRange: DateRange = {
        from: startOfMonth(subMonths(new Date(), 1)),
        to: startOfMonth(new Date()),
      };
      setDate(dateRange);
    }
    if (value == "currentMonth") {
      const dateRange: DateRange = {
        from: startOfMonth(new Date()),
        to: add(endOfMonth(new Date()), { days: 1 }),
      };
      setDate(dateRange);
    }
    if (value === "custom") {
      console.log(popoverTriggerRef.current, value);
      setTimeout(() => {
        console.log("Deuxième instruction");
        const calendarPickerRef = document?.querySelector(
          "#date"
        ) as HTMLButtonElement;
        calendarPickerRef.click();
      }, 1000);
    }
  };

  useEffect(() => {}, []);

  return (
    <>
      {/*<div className={`bg-white rounded-3xl flex space-y-2.5 2xl:space-y-0 items-start 2xl:items-center flex-col 2xl:flex-row 2xl:justify-between px-6 pb-5 pt-4 mb-6`}>*/}
      {/*  <Form {...filterableForm}>*/}
      {/*    <form action="" className={`w-full 2xl:w-auto`}>*/}
      {/*      <div className={`flex 2xl:inline-flex space-x-3 2xl:space-x-3`}>*/}

      {/*        <div className={`relative w-[38%] 2xl:w-auto`}>*/}
      {/*          <Input value={pSearch} type={`text`} className={`font-normal pl-9 bg-white text-xs rounded-full h-[2.5rem] w-full 2xl:w-[13rem]`}*/}
      {/*                 placeholder="Recherche" onChange={(e) => setPSearch(e.target.value)}/>*/}
      {/*            <Search className={`absolute h-4 w-4 top-3 left-3`} />*/}
      {/*        </div>*/}

      {/*        <div className={`w-[15%] 2xl:w-auto`}>*/}
      {/*          <Select onValueChange={(value) => setPStatus(value)} defaultValue={pStatus}>*/}
      {/*            <SelectTrigger className={`w-full 2xl:w-[7rem] text-xs h-[2.5rem] rounded-full bg-white border border-[#e4e4e4] font-normal`}>*/}
      {/*              <SelectValue placeholder="Statut"/>*/}
      {/*            </SelectTrigger>*/}
      {/*            <SelectContent className={`bg-[#f0f0f0]`}>*/}
      {/*              <SelectItem className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`} value={'all'}>*/}
      {/*                Tous*/}
      {/*              </SelectItem>*/}
      {/*              <SelectItem className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`} value={'pending'}>*/}
      {/*                En attente*/}
      {/*              </SelectItem>*/}
      {/*              <SelectItem className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`} value={'approved'}>*/}
      {/*                Effectué*/}
      {/*              </SelectItem>*/}
      {/*              <SelectItem className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`} value={'declined'}>*/}
      {/*                Echoué*/}
      {/*              </SelectItem>*/}
      {/*            </SelectContent>*/}
      {/*          </Select>*/}
      {/*        </div>*/}

      {/*        <div className={`w-[27%] 2xl:w-auto`}>*/}
      {/*          <Popover>*/}
      {/*            <PopoverTrigger asChild>*/}
      {/*              <Button*/}
      {/*                  id="date"*/}
      {/*                  variant={"outline"}*/}
      {/*                  className={cn(*/}
      {/*                      "w-full 2xl:w-[14rem] text-xs justify-start text-left font-normal",*/}
      {/*                      !date && "text-muted-foreground"*/}
      {/*                  )}*/}
      {/*              >*/}
      {/*                <CalendarIcon className="mr-2 h-4 w-4" />*/}
      {/*                {date?.from ? (*/}
      {/*                    date.to ? (*/}
      {/*                        <>*/}
      {/*                          {format(date.from, "dd LLL y", {locale: lang == 'fr' ? fr : enUS})} -{" "}*/}
      {/*                          {format(date.to, "dd LLL y", {locale: lang == 'fr' ? fr : enUS})}*/}
      {/*                        </>*/}
      {/*                    ) : (*/}
      {/*                        format(date.from, "dd LLL y", {locale: lang == 'fr' ? fr : enUS})*/}
      {/*                    )*/}
      {/*                ) : (*/}
      {/*                    <span>Pick a date</span>*/}
      {/*                )}*/}
      {/*              </Button>*/}
      {/*            </PopoverTrigger>*/}
      {/*            <PopoverContent className="w-auto p-0" align="end">*/}
      {/*              <Calendar*/}
      {/*                  initialFocus*/}
      {/*                  mode="range"*/}
      {/*                  defaultMonth={date?.from}*/}
      {/*                  selected={date}*/}
      {/*                  onSelect={setDate}*/}
      {/*                  numberOfMonths={2}*/}
      {/*                  // @ts-ignore*/}
      {/*                  locale={lang == 'fr' ? fr : enUS }*/}
      {/*              />*/}
      {/*            </PopoverContent>*/}
      {/*          </Popover>*/}
      {/*        </div>*/}

      {/*        <div className={`w-[20%] 2xl:w-auto`}>*/}
      {/*          <Button className={`text-xs inline-flex w-full 2xl:w-32 items-center space-x-2`}>*/}
      {/*            <svg className={`h-4 w-4`} viewBox="0 0 24 24" fill="none"*/}
      {/*                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">*/}
      {/*              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>*/}
      {/*              <polyline points="7 10 12 15 17 10"/>*/}
      {/*              <line x1="12" x2="12" y1="15" y2="3"/>*/}
      {/*            </svg>*/}
      {/*            <span>Exporter</span>*/}
      {/*          </Button>*/}
      {/*        </div>*/}

      {/*      </div>*/}
      {/*    </form>*/}
      {/*  </Form>*/}
      {/*</div>*/}
      <div className={`bg-white rounded-2xl px-6 pb-6 pt-6 mb-6`}>
        <Form {...filterableForm}>
          <form action="" className={`w-full`}>
            <div className={`grid grid-cols-12 gap-4`}>
              <div className={`col-span-7 2xl:col-span-3`}>
                <div className="flex">
                  <Label className={`font-normal text-sm block mb-1 mr-1`}>
                    Filtrer par :{" "}
                  </Label>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="mb-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            width="20"
                            height="20"
                            viewBox="0 0 50 50"
                          >
                            <path d="M25,2C12.297,2,2,12.297,2,25s10.297,23,23,23s23-10.297,23-23S37.703,2,25,2z M25,11c1.657,0,3,1.343,3,3s-1.343,3-3,3 s-3-1.343-3-3S23.343,11,25,11z M29,38h-2h-4h-2v-2h2V23h-2v-2h2h4v2v13h2V38z"></path>
                          </svg>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent align={"start"}>
                        <div className="break-all">
                          Recherchez par ID transaction, numéro de compte/téléphone,
                          référence opérateur
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className={`relative`}>
                  <Input
                    value={pSearch}
                    type={`text`}
                    className={`font-normal pl-9 bg-white text-xs rounded-full h-[2.5rem] w-full`}
                    placeholder="Recherchez"
                    onChange={(e) => setPSearch(e.target.value)}
                  />
                  <Search className={`absolute h-4 w-4 top-3 left-3`} />
                </div>
              </div>
              <div className={`col-span-5 2xl:col-span-4`}>
                <Label className={`font-normal text-sm block mb-1`}>
                  Transactions :
                </Label>
                <div className={`grid grid-cols-3 gap-1`}>
                  <div>
                    <Select
                      onValueChange={(value) => setPType(value)}
                      defaultValue={pType}
                    >
                      <SelectTrigger
                        className={`text-xs w-full h-[2.5rem] rounded-full bg-white border border-[#e4e4e4] font-normal [&>span]:text-left`}
                      >
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent className={`bg-[#f0f0f0]`}>
                        {transactionsTypes.map(
                          (item: ITransactionType, index: number) => (
                            <SelectItem
                              key={index}
                              className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`}
                              value={item.id}
                            >
                              {rewriteTransactionTypeName(item.name)}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      onValueChange={(value) => {
                        console.log(value);
                        setPStatus(value);
                      }}
                      defaultValue={pStatus}
                    >
                      <SelectTrigger
                        className={`w-full text-xs h-[2.5rem] rounded-full bg-white border border-[#e4e4e4] font-normal [&>span]:text-left`}
                      >
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent className={`bg-[#f0f0f0]`}>
                        {transactionsStatus.map((item, index) => (
                          <SelectItem
                            key={index}
                            className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`}
                            value={item.key}
                          >
                            {item.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      onValueChange={(value) => {
                        console.log(value);
                        setPOperator(value);
                      }}
                      defaultValue={pOperator}
                    >
                      <SelectTrigger
                        className={`w-full text-xs h-[2.5rem] rounded-full bg-white border border-[#e4e4e4] font-normal [&>span]:text-left`}
                      >
                        <SelectValue placeholder="Opérateur" />
                      </SelectTrigger>
                      <SelectContent className={`bg-[#f0f0f0]`}>
                        <SelectItem
                            className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`}
                            value={`all`}
                        >
                          Tous les opérateurs
                        </SelectItem>
                        {operators.map((item, index) => (
                          <SelectItem
                            key={index}
                            className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`}
                            value={item.name}
                          >
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className={`col-span-3 xl:col-span-3 2xl:col-span-2`}>
                <Label className={`font-normal text-sm block mb-1`}>
                  Période :
                </Label>
                <div className={`grid grid-cols-1 gap-1`}>
                  <div>
                    <Select
                      onValueChange={(value) =>
                        handlePeriodeOptionChange(value)
                      }
                      defaultValue={pPeriod}
                    >
                      <SelectTrigger
                        className={`w-full text-xs h-[2.5rem] rounded-full bg-white border border-[#e4e4e4] font-normal [&>span]:text-left`}
                      >
                        <SelectValue placeholder="Période" />
                      </SelectTrigger>
                      <SelectContent className={`bg-[#f0f0f0]`}>
                        {periodeOptions.map((item, index) => (
                          <SelectItem
                            key={index}
                            className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`}
                            value={item.key}
                          >
                            {item.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Popover>
                      <PopoverTrigger ref={popoverTriggerRef} asChild>
                        <button
                          id="date"
                          className={cn(
                            "w-full 2xl:w-[14rem] text-xs justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        ></button>
                        {/* <Button
                              id="date"
                              variant={"outline"}
                              className={cn(
                                  "w-full 2xl:w-[14rem] text-xs justify-start text-left font-normal",
                                  !date && "text-muted-foreground"
                              )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4"/>
                            {
                              date?.from == undefined || date?.to == undefined ? (
                                <span>Choisir une période</span>
                              ) : (
                                date?.from ? (
                                  date.to ? (
                                        <>
                                          {format(date.from, "dd LLL y", {locale: lang == 'fr' ? fr : enUS})} -{" "}
                                          {format(date.to, "dd LLL y", {locale: lang == 'fr' ? fr : enUS})}
                                        </>
                                    ) : (
                                        format(date.from, "dd LLL y", {locale: lang == 'fr' ? fr : enUS})
                                    )
                                ) : (
                                    <span>Pick a date</span>
                                )
                              )
                            }
                          </Button> */}
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 -translate-y-3 translate-x-3"
                        align="end"
                      >
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
                </div>
              </div>
              <div className={`col-span-5 xl:col-span-4 2xl:col-span-3`}>
                <Label className={`font-normal text-sm block mb-1`}>
                  Points de vente :
                </Label>
                <div className={`grid grid-cols-6 gap-1`}>
                  <div className={`col-span-2`}>
                    <Select
                      onValueChange={(value) => {
                        console.log(value);
                        setPTerminalId(value);
                      }}
                      defaultValue={pTerminalId}
                    >
                      <SelectTrigger
                        className={`text-xs w-full h-[2.5rem] rounded-full bg-white border border-[#e4e4e4] font-normal [&>span]:text-left`}
                      >
                        <SelectValue placeholder="TPE" />
                      </SelectTrigger>
                      <SelectContent className={`bg-[#f0f0f0]`}>
                        {terminals.map((item, index) => (
                          <SelectItem
                            key={index}
                            className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`}
                            value={item.name}
                          >
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className={`col-span-3`}>
                    <Select
                      onValueChange={(value) => setPStatus(value)}
                      defaultValue={pStatus}
                    >
                      <SelectTrigger
                        className={`w-full text-xs h-[2.5rem] rounded-full bg-white border border-[#e4e4e4] font-normal [&>span]:text-left`}
                      >
                        <SelectValue placeholder="Point en ligne" />
                      </SelectTrigger>
                      <SelectContent className={`bg-[#f0f0f0]`}>
                        {Services.map((item, index) => (
                          <SelectItem
                            key={index}
                            className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`}
                            value={item.key}
                          >
                            {item.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className={`flex items-center justify-end`}>
                    <a
                      className={``}
                      href={`${Routes.dashboard.transactions.replace(
                        "{lang}",
                        lang
                      )}`}
                    >
                      <RotateCcw
                        strokeWidth={2.5}
                        className="text-[#D3D3D3] w-6 h-6"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
