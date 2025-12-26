"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table/table";
import { Button } from "../ui/cn/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/cn/select";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalPageCount?: number;
  handlePagination: (index: number, pageSize: number) => void;
  tablePageSize: number;
  currentIndex: number;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalPageCount = 1,
  handlePagination,
  tablePageSize,
  currentIndex,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPageCount,
    state: {
      pagination: {
        pageIndex: currentIndex,
        pageSize: tablePageSize,
      },
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function"
          ? updater({ pageIndex: currentIndex, pageSize: tablePageSize })
          : updater;

      if (newPagination.pageIndex !== undefined) {
        handlePagination(
          newPagination.pageIndex,
          newPagination.pageSize || tablePageSize
        );
      } else if (newPagination.pageSize !== undefined) {
        handlePagination(0, newPagination.pageSize); // 重置到第一页
      }
    },
  });

  const canPreviousPage = currentIndex > 0;
  const canNextPage = currentIndex < totalPageCount - 1;

  const handlePreviousPage = () => {
    if (canPreviousPage) {
      handlePagination(currentIndex - 1, tablePageSize);
    }
  };

  const handleNextPage = () => {
    if (canNextPage) {
      handlePagination(currentIndex + 1, tablePageSize);
    }
  };

  const handleFirstPage = () => {
    handlePagination(0, tablePageSize);
  };

  const handleLastPage = () => {
    handlePagination(totalPageCount - 1, tablePageSize);
  };

  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value);
    handlePagination(0, newPageSize); // 重置到第一页
  };

  // useEffect(() => {
  //   const { pageIndex, pageSize } = table.getState().pagination;
  //   console.log("index", pageIndex, "size", pageSize);
  //   handlePagination(pageIndex, pageSize);
  // }, [
  //   table.getState().pagination.pageIndex,
  //   table.getState().pagination.pageSize,
  // ]);

  return (
    <div className="overflow-auto w-full">
      <Table className="border-separate border-spacing-y-2.5 min-w-full">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="bg-[#073954] rounded-md hover:bg-[#2C566A] overflow-clip"
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="text-white font-bold first:rounded-l-md last:rounded-r-md py-5"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="divide-none max-h-[500px] overflow-y-scroll">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, i) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className={`
                                           bg-white shadow-sm transition-shadow duration-200
                                            even:bg-[#F7F9FF]
                                            ${
                                              i === 0
                                                ? "first:rounded-t-lg"
                                                : "rounded-lg"
                                            }
                                            ${
                                              i ===
                                              table.getRowModel().rows.length -
                                                1
                                                ? "last:rounded-b-lg"
                                                : "rounded-xl"
                                            }
                                           `}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex flex-wrap pb-1 justify-end items-center gap-2">
        <div>
          <Select
            value={`${tablePageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent className="bg-white" side="top">
              {[10, 20, 30, 40, 50, 100, 1000, 2000].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentIndex + 1} of {totalPageCount || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleFirstPage}
            disabled={!canPreviousPage || isLoading}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handlePreviousPage}
            disabled={!canPreviousPage || isLoading}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handleNextPage}
            disabled={!canNextPage || isLoading}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleLastPage}
            disabled={!canNextPage || isLoading}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
