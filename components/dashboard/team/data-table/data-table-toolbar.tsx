"use client"

import * as React from "react"
import type { Table } from "@tanstack/react-table"
import { fr, enUS } from 'date-fns/locale';

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Form} from "@/components/ui/form";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import { CalendarIcon, RotateCcw, Search} from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {DateRange} from "react-day-picker";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar";
import Routes from "@/components/Routes";

interface DataTableToolbarProps<TData> {
  table: Table<TData>,
  newRowLink?: string,
  deleteRowsAction?: React.MouseEventHandler<HTMLButtonElement>,
  pSearch: string,
  setPSearch: (value: (((prevState: string) => string) | string)) => void,
  pStatus: string,
  setPStatus: (value: (((prevState: string) => string) | string)) => void,
  date: DateRange | undefined,
  setDate: (value: (((prevState: (DateRange | undefined)) => (DateRange | undefined)) | DateRange | undefined)) => void,
  lang: string
}

export function DataTableToolbar<TData>({ table, newRowLink, deleteRowsAction, pSearch, setPSearch, pStatus, setPStatus, date, setDate, lang }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [isDeletePending, startDeleteTransition] = React.useTransition()

  const formSchema = z.object({
    search: z.string()
  })

  const filterableForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
    }
  });

  return (
      <>
        <div className={`flex space-y-2.5 lg:space-y-0 items-start lg:items-center flex-col lg:flex-row lg:justify-between px-6 pb-1 pt-4`}>
          <h2 className={`font-medium text-base whitespace-nowrap`}>{`Utilisateurs (${table.getRowCount()})`}</h2>
          <Form {...filterableForm}>
            <form action="" className={`w-full lg:w-auto`}>
              <div className={`flex 2xl:inline-flex space-x-3 2xl:space-x-3`}>

                <div className={`relative w-[38%] lg:w-auto`}>
                  <Input value={pSearch} type={`text`} className={`font-normal pl-9 bg-white text-xs rounded-full h-[2.5rem] w-full lg:w-[17rem]`}
                         placeholder="Recherche" onChange={(e) => setPSearch(e.target.value)}/>
                    <Search className={`absolute h-4 w-4 top-3 left-3`} />
                </div>

                <div className={`w-[25%] lg:w-auto`}>
                  <Select onValueChange={(value) => setPStatus(value)} defaultValue={pStatus}>
                    <SelectTrigger className={`w-full lg:w-[13rem] text-xs h-[2.5rem] rounded-full bg-white border border-[#e4e4e4] font-normal`}>
                      <SelectValue placeholder="Type d'utilisateurs"/>
                    </SelectTrigger>
                    <SelectContent className={`bg-[#f0f0f0]`}>
                      <SelectItem className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`} value={'all'}>
                        {`Type d'utilisateurs`}
                      </SelectItem>
                      <SelectItem className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`} value={'Pending'}>
                        En attente
                      </SelectItem>
                      <SelectItem className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`} value={'Approved'}>
                        Effectué
                      </SelectItem>
                      <SelectItem className={`text-xs px-7 flex items-center focus:bg-gray-100 font-normal`} value={'Declined'}>
                        Echoué
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className={`flex items-center justify-end`}>
                  <a className={``} href={`${Routes.dashboard.team.replace('{lang}', lang)}`}>
                    <RotateCcw strokeWidth={2.5} className="text-[#D3D3D3] w-6 h-6" />
                  </a>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </>
  )
}
