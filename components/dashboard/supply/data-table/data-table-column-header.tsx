import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon, ResetIcon,
} from "@radix-ui/react-icons"
import { type Column } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React from "react";
import {X} from "lucide-react";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={
              column.getIsSorted() === "desc"
                ? `Sorted descending. Click to sort ascending.`
                : column.getIsSorted() === "asc"
                  ? `Sorted ascending. Click to sort descending.`
                  : `Not sorted. Click to sort ascending.`
            }
            variant="ghost"
            size="sm"
            className="-ml-3 h-7 text-xs font-normal data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ml-2 size-4" aria-hidden="true" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ml-2 size-4" aria-hidden="true" />
            ) : (
              <CaretSortIcon className="ml-2 size-4" aria-hidden="true" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem className={`text-xs`}
            aria-label="Sort ascending"
            onClick={() => column.toggleSorting(false)}
          >
            <ArrowUpIcon
              className="mr-2 size-3.5 text-muted-foreground/70"
              aria-hidden="true"
            />
            Croissant
          </DropdownMenuItem>
          <DropdownMenuItem className={`text-xs`}
            aria-label="Sort descending"
            onClick={() => column.toggleSorting(true)}
          >
            <ArrowDownIcon
              className="mr-2 size-3.5 text-muted-foreground/70"
              aria-hidden="true"
            />
            Décroissant
          </DropdownMenuItem>
          <DropdownMenuItem className={`text-xs`}
              aria-label="reset sorting"
              onClick={() =>  column.clearSorting()}
          >
            <X
                className="mr-2 size-3.5 text-muted-foreground/70"
                aria-hidden="true"
            />
            Réinitialiser
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
