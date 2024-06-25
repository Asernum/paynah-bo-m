"use client";

import { Locale } from "@/i18n.config";
import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Pencil,
  PlusCircle,
  Files,
  Send,
  Trash2,
} from "lucide-react";
import { formatCFA } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SuppliesTable from "@/components/dashboard/supply/SuppliesTable";
import AccountsAction from "@/components/dashboard/serenity-space/modals/AccountsAction";
import { IUser } from "@/core/interfaces/user";
import { getMerchantBankAccounts } from "@/core/apis/bank-account";
import { IAccount } from "@/core/interfaces/account";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface SendModeListAndSuppliesProps {
  lang: Locale;
  searchItems: {
    per_page: number;
    page: number;
    search?: string;
    from?: string;
    sort?: string;
    to?: string;
    status?: string;
  };
  merchant: IUser;
}

export default function SendModeListAndSupplies({
  lang,
  searchItems,
  merchant,
}: SendModeListAndSuppliesProps) {
  const [selectedPos, setSelectedPos] = useState("none");
  const [balance, setBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [isAccountActionLoading, setAccountActionLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState<IAccount>();
  const [mode, setMode] = useState("add");

  useEffect(() => {}, []);

  return (
    <div className={`flex flex-col h-full space-y-3`}>
      <div className={`h-full`}>
        <div
          className={`bg-white p-3 flex flex-row rounded-3xl h-full space-x-2`}
        >
          <div className="w-[30%] ">
            <h1 className={`font-medium text-xl 2xl:text-lg mr-4 mt-2`}>
              Mes Points de service en ligne
            </h1>
            <div className="mt-[60px] space-y-3 mb-3 min-h-[34rem] overflow-y-auto">
              <button
                className={`${
                  selectedPos == "akwaba" && "bg-[#F7F7F7]"
                } h-[4rem] flex items-center p-2 rounded-lg w-full space-x-2`}
                onClick={() => setSelectedPos("akwaba")}
              >
                <div className="w-[12%] bg-[#F0F0F0] flex items-center justify-center h-full rounded-xl">
                  <svg
                    className={`h-[1.1rem] fill-[#000] w-auto`}
                    viewBox="0 0 19.227 19.231"
                  >
                    <g transform="translate(0.25 0.252)">
                      <g transform="translate(0 0)">
                        <path
                          d="M16.785,3.671A9.043,9.043,0,0,0,11.331.22,9.085,9.085,0,0,0,3.688,1.936,9.1,9.1,0,0,0,.212,7.414c-.086.4-.12.805-.178,1.208-.009.066-.022.13-.034.195v1.1c.049.354.08.712.146,1.062A9.241,9.241,0,0,0,4.589,17.41,8.907,8.907,0,0,0,8.674,18.7a1.032,1.032,0,0,1,.141.03h.976V17.533l-.007.005V14.351h.007V13.5h0V9.836h8.926a9.069,9.069,0,0,0-1.929-6.165M7.846.965l.054.059a.847.847,0,0,0-.15.088,11.5,11.5,0,0,0-2.517,3.2.268.268,0,0,1-.279.168c-.785-.008-1.572,0-2.358,0H2.37A8.626,8.626,0,0,1,7.846.965m1.1.238V4.466H6.093A10.588,10.588,0,0,1,8.943,1.2M1.035,7.516A7.676,7.676,0,0,1,1.8,5.433a.246.246,0,0,1,.168-.121C2.884,5.3,3.8,5.305,4.756,5.305a11.026,11.026,0,0,0-.808,3.681H.81c.075-.5.126-.991.225-1.471M1.858,13.4A8.341,8.341,0,0,1,.847,9.89a.213.213,0,0,1,.009-.05H3.95a10.671,10.671,0,0,0,.808,3.668H4.125c-.688,0-1.378,0-2.066,0a.268.268,0,0,1-.2-.1m.571.935h.585c.664,0,1.329,0,1.993,0a.245.245,0,0,1,.188.091,12.482,12.482,0,0,0,2.634,3.3,8.49,8.49,0,0,1-5.4-3.4m2.364-4.5H8.94V13.5c-.066,0-.125.008-.184.008-.97,0-1.938,0-2.908,0a.237.237,0,0,1-.255-.168,9.8,9.8,0,0,1-.8-3.3c0-.064,0-.13,0-.207m4.151,7.7a10.625,10.625,0,0,1-2.833-3.177H8.944Zm0-8.549h-4.2c.08-.559.117-1.109.247-1.637.159-.646.395-1.275.608-1.908a.217.217,0,0,1,.155-.129c1.043-.008,2.085-.005,3.127,0a.248.248,0,0,1,.059.017ZM16.36,4.474H15.139c-.468,0-.938,0-1.406,0a.247.247,0,0,1-.188-.091A11.969,11.969,0,0,0,10.9,1.032a.5.5,0,0,1-.05-.074A8.64,8.64,0,0,1,16.36,4.474M9.792,1.208a10.578,10.578,0,0,1,2.843,3.254H9.792Zm4.141,7.776H9.785V5.305h2.377c.262,0,.525-.005.785.005a.218.218,0,0,1,.164.092,9.575,9.575,0,0,1,.829,3.516c0,.017-.005.036-.009.066m3.944.005H14.82c-.095-.632-.158-1.262-.292-1.876s-.337-1.2-.512-1.808h1.589c.378,0,.755,0,1.132,0a.229.229,0,0,1,.174.086,8.333,8.333,0,0,1,.975,3.541.446.446,0,0,1-.009.054"
                          transform="translate(0 0.001)"
                          strokeWidth="8"
                        />
                        <path
                          d="M103.625,80.924h-.009a2.616,2.616,0,0,0-1.844.767l-.37.371a.549.549,0,0,0,0,.778.56.56,0,0,0,.775,0l.372-.371a1.519,1.519,0,1,1,2.189,2.107l-.043.043-.372.371a.55.55,0,0,0,.778.776l.37-.371a2.617,2.617,0,0,0,0-3.7,2.634,2.634,0,0,0-1.853-.769"
                          transform="translate(-87.921 -70.277)"
                          strokeWidth="8"
                        />
                        <path
                          d="M84.894,104.418l-.372.372a1.519,1.519,0,0,1-2.189-2.108l.041-.041.37-.37a.549.549,0,1,0-.777-.777l-.37.37a2.617,2.617,0,0,0,1.849,4.468h.011a2.618,2.618,0,0,0,1.843-.766l.37-.371a.551.551,0,0,0,0-.778.561.561,0,0,0-.776,0"
                          transform="translate(-70.195 -88)"
                          strokeWidth="8"
                        />
                        <path
                          d="M99.73,96.547a.56.56,0,0,0-.775,0l-2.531,2.528a.55.55,0,0,0,0,.777h0a.549.549,0,0,0,.777,0l2.531-2.528a.549.549,0,0,0,0-.778"
                          transform="translate(-83.598 -83.709)"
                          strokeWidth="8"
                        />
                      </g>
                    </g>
                  </svg>
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium text-base">Akwaba</span>
                  <span className="text-[13px] text-[#707070]">
                    application mobile
                  </span>
                </div>
              </button>
              <button
                className={`${
                  selectedPos == "total" && "bg-[#F7F7F7]"
                } h-[4rem] flex items-center p-2 rounded-lg w-full space-x-2`}
                onClick={() => setSelectedPos("total")}
              >
                <div className="w-[12%] bg-[#F0F0F0] flex items-center justify-center h-full rounded-xl">
                  <svg
                    className={`h-[1.1rem] fill-[#000] w-auto`}
                    viewBox="0 0 19.227 19.231"
                  >
                    <g transform="translate(0.25 0.252)">
                      <g transform="translate(0 0)">
                        <path
                          d="M16.785,3.671A9.043,9.043,0,0,0,11.331.22,9.085,9.085,0,0,0,3.688,1.936,9.1,9.1,0,0,0,.212,7.414c-.086.4-.12.805-.178,1.208-.009.066-.022.13-.034.195v1.1c.049.354.08.712.146,1.062A9.241,9.241,0,0,0,4.589,17.41,8.907,8.907,0,0,0,8.674,18.7a1.032,1.032,0,0,1,.141.03h.976V17.533l-.007.005V14.351h.007V13.5h0V9.836h8.926a9.069,9.069,0,0,0-1.929-6.165M7.846.965l.054.059a.847.847,0,0,0-.15.088,11.5,11.5,0,0,0-2.517,3.2.268.268,0,0,1-.279.168c-.785-.008-1.572,0-2.358,0H2.37A8.626,8.626,0,0,1,7.846.965m1.1.238V4.466H6.093A10.588,10.588,0,0,1,8.943,1.2M1.035,7.516A7.676,7.676,0,0,1,1.8,5.433a.246.246,0,0,1,.168-.121C2.884,5.3,3.8,5.305,4.756,5.305a11.026,11.026,0,0,0-.808,3.681H.81c.075-.5.126-.991.225-1.471M1.858,13.4A8.341,8.341,0,0,1,.847,9.89a.213.213,0,0,1,.009-.05H3.95a10.671,10.671,0,0,0,.808,3.668H4.125c-.688,0-1.378,0-2.066,0a.268.268,0,0,1-.2-.1m.571.935h.585c.664,0,1.329,0,1.993,0a.245.245,0,0,1,.188.091,12.482,12.482,0,0,0,2.634,3.3,8.49,8.49,0,0,1-5.4-3.4m2.364-4.5H8.94V13.5c-.066,0-.125.008-.184.008-.97,0-1.938,0-2.908,0a.237.237,0,0,1-.255-.168,9.8,9.8,0,0,1-.8-3.3c0-.064,0-.13,0-.207m4.151,7.7a10.625,10.625,0,0,1-2.833-3.177H8.944Zm0-8.549h-4.2c.08-.559.117-1.109.247-1.637.159-.646.395-1.275.608-1.908a.217.217,0,0,1,.155-.129c1.043-.008,2.085-.005,3.127,0a.248.248,0,0,1,.059.017ZM16.36,4.474H15.139c-.468,0-.938,0-1.406,0a.247.247,0,0,1-.188-.091A11.969,11.969,0,0,0,10.9,1.032a.5.5,0,0,1-.05-.074A8.64,8.64,0,0,1,16.36,4.474M9.792,1.208a10.578,10.578,0,0,1,2.843,3.254H9.792Zm4.141,7.776H9.785V5.305h2.377c.262,0,.525-.005.785.005a.218.218,0,0,1,.164.092,9.575,9.575,0,0,1,.829,3.516c0,.017-.005.036-.009.066m3.944.005H14.82c-.095-.632-.158-1.262-.292-1.876s-.337-1.2-.512-1.808h1.589c.378,0,.755,0,1.132,0a.229.229,0,0,1,.174.086,8.333,8.333,0,0,1,.975,3.541.446.446,0,0,1-.009.054"
                          transform="translate(0 0.001)"
                          strokeWidth="8"
                        />
                        <path
                          d="M103.625,80.924h-.009a2.616,2.616,0,0,0-1.844.767l-.37.371a.549.549,0,0,0,0,.778.56.56,0,0,0,.775,0l.372-.371a1.519,1.519,0,1,1,2.189,2.107l-.043.043-.372.371a.55.55,0,0,0,.778.776l.37-.371a2.617,2.617,0,0,0,0-3.7,2.634,2.634,0,0,0-1.853-.769"
                          transform="translate(-87.921 -70.277)"
                          strokeWidth="8"
                        />
                        <path
                          d="M84.894,104.418l-.372.372a1.519,1.519,0,0,1-2.189-2.108l.041-.041.37-.37a.549.549,0,1,0-.777-.777l-.37.37a2.617,2.617,0,0,0,1.849,4.468h.011a2.618,2.618,0,0,0,1.843-.766l.37-.371a.551.551,0,0,0,0-.778.561.561,0,0,0-.776,0"
                          transform="translate(-70.195 -88)"
                          strokeWidth="8"
                        />
                        <path
                          d="M99.73,96.547a.56.56,0,0,0-.775,0l-2.531,2.528a.55.55,0,0,0,0,.777h0a.549.549,0,0,0,.777,0l2.531-2.528a.549.549,0,0,0,0-.778"
                          transform="translate(-83.598 -83.709)"
                          strokeWidth="8"
                        />
                      </g>
                    </g>
                  </svg>
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium text-base">Total Energies</span>
                  <span className="text-[13px] text-[#707070]">
                    application mobile
                  </span>
                </div>
              </button>
              <button
                className={`${
                  selectedPos == "asernum" && "bg-[#F7F7F7]"
                } h-[4rem] flex items-center p-2 rounded-lg w-full space-x-2`}
                onClick={() => setSelectedPos("asernum")}
              >
                <div className="w-[12%] bg-[#F0F0F0] flex items-center justify-center h-full rounded-xl">
                  <svg
                    className={`h-[1.1rem] fill-[#000] w-auto`}
                    viewBox="0 0 19.227 19.231"
                  >
                    <g transform="translate(0.25 0.252)">
                      <g transform="translate(0 0)">
                        <path
                          d="M16.785,3.671A9.043,9.043,0,0,0,11.331.22,9.085,9.085,0,0,0,3.688,1.936,9.1,9.1,0,0,0,.212,7.414c-.086.4-.12.805-.178,1.208-.009.066-.022.13-.034.195v1.1c.049.354.08.712.146,1.062A9.241,9.241,0,0,0,4.589,17.41,8.907,8.907,0,0,0,8.674,18.7a1.032,1.032,0,0,1,.141.03h.976V17.533l-.007.005V14.351h.007V13.5h0V9.836h8.926a9.069,9.069,0,0,0-1.929-6.165M7.846.965l.054.059a.847.847,0,0,0-.15.088,11.5,11.5,0,0,0-2.517,3.2.268.268,0,0,1-.279.168c-.785-.008-1.572,0-2.358,0H2.37A8.626,8.626,0,0,1,7.846.965m1.1.238V4.466H6.093A10.588,10.588,0,0,1,8.943,1.2M1.035,7.516A7.676,7.676,0,0,1,1.8,5.433a.246.246,0,0,1,.168-.121C2.884,5.3,3.8,5.305,4.756,5.305a11.026,11.026,0,0,0-.808,3.681H.81c.075-.5.126-.991.225-1.471M1.858,13.4A8.341,8.341,0,0,1,.847,9.89a.213.213,0,0,1,.009-.05H3.95a10.671,10.671,0,0,0,.808,3.668H4.125c-.688,0-1.378,0-2.066,0a.268.268,0,0,1-.2-.1m.571.935h.585c.664,0,1.329,0,1.993,0a.245.245,0,0,1,.188.091,12.482,12.482,0,0,0,2.634,3.3,8.49,8.49,0,0,1-5.4-3.4m2.364-4.5H8.94V13.5c-.066,0-.125.008-.184.008-.97,0-1.938,0-2.908,0a.237.237,0,0,1-.255-.168,9.8,9.8,0,0,1-.8-3.3c0-.064,0-.13,0-.207m4.151,7.7a10.625,10.625,0,0,1-2.833-3.177H8.944Zm0-8.549h-4.2c.08-.559.117-1.109.247-1.637.159-.646.395-1.275.608-1.908a.217.217,0,0,1,.155-.129c1.043-.008,2.085-.005,3.127,0a.248.248,0,0,1,.059.017ZM16.36,4.474H15.139c-.468,0-.938,0-1.406,0a.247.247,0,0,1-.188-.091A11.969,11.969,0,0,0,10.9,1.032a.5.5,0,0,1-.05-.074A8.64,8.64,0,0,1,16.36,4.474M9.792,1.208a10.578,10.578,0,0,1,2.843,3.254H9.792Zm4.141,7.776H9.785V5.305h2.377c.262,0,.525-.005.785.005a.218.218,0,0,1,.164.092,9.575,9.575,0,0,1,.829,3.516c0,.017-.005.036-.009.066m3.944.005H14.82c-.095-.632-.158-1.262-.292-1.876s-.337-1.2-.512-1.808h1.589c.378,0,.755,0,1.132,0a.229.229,0,0,1,.174.086,8.333,8.333,0,0,1,.975,3.541.446.446,0,0,1-.009.054"
                          transform="translate(0 0.001)"
                          strokeWidth="8"
                        />
                        <path
                          d="M103.625,80.924h-.009a2.616,2.616,0,0,0-1.844.767l-.37.371a.549.549,0,0,0,0,.778.56.56,0,0,0,.775,0l.372-.371a1.519,1.519,0,1,1,2.189,2.107l-.043.043-.372.371a.55.55,0,0,0,.778.776l.37-.371a2.617,2.617,0,0,0,0-3.7,2.634,2.634,0,0,0-1.853-.769"
                          transform="translate(-87.921 -70.277)"
                          strokeWidth="8"
                        />
                        <path
                          d="M84.894,104.418l-.372.372a1.519,1.519,0,0,1-2.189-2.108l.041-.041.37-.37a.549.549,0,1,0-.777-.777l-.37.37a2.617,2.617,0,0,0,1.849,4.468h.011a2.618,2.618,0,0,0,1.843-.766l.37-.371a.551.551,0,0,0,0-.778.561.561,0,0,0-.776,0"
                          transform="translate(-70.195 -88)"
                          strokeWidth="8"
                        />
                        <path
                          d="M99.73,96.547a.56.56,0,0,0-.775,0l-2.531,2.528a.55.55,0,0,0,0,.777h0a.549.549,0,0,0,.777,0l2.531-2.528a.549.549,0,0,0,0-.778"
                          transform="translate(-83.598 -83.709)"
                          strokeWidth="8"
                        />
                      </g>
                    </g>
                  </svg>
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium text-base">Asernum</span>
                  <span className="text-[13px] text-[#707070]">
                    application mobile
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="w-[70%]">
            <div className="row-span-1 pl-6 w-full flex flex-row justify-between mt-1">
              <div className="flex flex-row space-x-3 items-center">
                <span className="font-normal text-base 2xl:text-lg text-[#767676]">
                  Documentation API
                </span>
                <Button className={`px-6 items-center text-xs h-8`}>
                  <span>Ouvrir ici</span>
                </Button>
              </div>
              <div className="flex flex-row space-x-3 items-center">
                <span className="font-normal text-base 2xl:text-lg text-[#767676]">
                  API Key de test
                </span>
                <Button
                  className={`px-6 flex items-center justify-center text-xs h-8`}
                  onClick={() => {
                    setMode("add");
                  }}
                >
                  <span className="mt-2">***********</span>
                  <Files className={`h-4 w-4 ml-2`} />
                </Button>
              </div>
              <Button
                className={`px-6 items-center text-xs h-8`}
                onClick={() => {
                  setMode("add");
                }}
              >
                <PlusCircle className={`h-4 w-4 mr-2`} />
                <span>Point de vente en ligne</span>
              </Button>
            </div>
            <div className="row-span-1  mt-[44px] w-full min-h-[36rem] flex flex-col rounded-3xl bg-[#F4F4F7]">
              {selectedPos == "none" ? (
                <div className="flex items-center justify-center min-h-[36rem]">
                  <p>Aucune application sélectionnée</p>
                </div>
              ) : (
                <div>
                  <div className="h-[80px] bg-[#F0F0F0] rounded-t-3xl flex items-center p-6">
                    <span className="text-[26px] font-normal capitalize">
                      {selectedPos}
                    </span>
                  </div>

                  <div className="p-10 space-y-8">
                    <div className="flex flex-row justify-between items-center">
                      <div className="w-[15%]">
                        <span className="font-normal text-base">Keys</span>
                      </div>
                      <div className="w-[85%]">
                        <div className="h-[6rem] bg-white rounded-2xl">
                          <table className="w-full bg-[#F0F0F0] rounded-2xl">
                            <thead className="">
                              <tr>
                                <th className="px-4 py-2 text-[14px] font-normal text-left text-[#707070] w-[60%]">
                                  API Key
                                </th>
                                <th className="px-4 py-2 text-[14px] font-normal text-left text-[#707070] w-[20%]">
                                  Secret Key
                                </th>
                                <th className="px-4 py-2 text-[14px] font-normal text-left text-[#707070] w-[10%]">
                                  Statut
                                </th>
                                <th className="px-4 py-2 text-left text-gray-600 font-semibold w-[10%]"></th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              <tr>
                                <td className="px-4 py-2 text-[14px] font-normal text-left">
                                  {"73288ff8-e26f-4051-b196-8829752d6e92"}
                                </td>
                                <td className="px-4 py-2 text-[14px] font-normal text-left flex">
                                  <span className="mr-2">************</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="11.508"
                                    height="14.646"
                                    viewBox="0 0 11.508 14.646"
                                  >
                                    <g
                                      id="fe64abfe6374180b6029e811e1d42179"
                                      transform="translate(-3 -1)"
                                    >
                                      <path
                                        id="Tracé_826"
                                        data-name="Tracé 826"
                                        d="M9.183,4.662V1H6.568A1.569,1.569,0,0,0,5,2.569v9.415a1.569,1.569,0,0,0,1.569,1.569h6.279a1.569,1.569,0,0,0,1.569-1.569V6.231H10.752A1.569,1.569,0,0,1,9.183,4.662Z"
                                        transform="translate(0.092)"
                                        fill="#212121"
                                      />
                                      <path
                                        id="Tracé_827"
                                        data-name="Tracé 827"
                                        d="M10.322,4.65V1.25l3.923,3.923h-3.4A.523.523,0,0,1,10.322,4.65ZM3,4.127A1.046,1.046,0,0,1,4.046,3.081v8.892a2.615,2.615,0,0,0,2.615,2.615h5.754a1.046,1.046,0,0,1-1.046,1.046H6.72A3.72,3.72,0,0,1,3,11.915Z"
                                        transform="translate(0 0.012)"
                                        fill="#212121"
                                      />
                                    </g>
                                  </svg>
                                </td>
                                <td className="px-4 py-2 text-[14px] font-normal text-left">
                                  <span className="bg-[#DBFCEF] pt-1 pb-1 pl-4 pr-4 rounded-md text-[#19B2A6]">
                                    Actif
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-[14px] font-normal text-left flex items-center justify-end space-x-2">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="15.089"
                                    height="15.141"
                                    viewBox="0 0 15.089 15.141"
                                  >
                                    <path
                                      id="bd0907599d78973620281724a29bc1f6"
                                      d="M17.77,11.042a.644.644,0,0,0-.724.564,6.3,6.3,0,1,1-2.371-5.717h-1.26a.649.649,0,1,0,0,1.3h2.6a.649.649,0,0,0,.649-.649V3.9a.649.649,0,0,0-1.3,0v.876a7.562,7.562,0,1,0,2.972,6.991.647.647,0,0,0-.563-.723Z"
                                      transform="translate(-3.25 -3.25)"
                                    />
                                  </svg>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="13.284"
                                    height="17.323"
                                    viewBox="0 0 13.284 17.323"
                                  >
                                    <path
                                      id="da086273b974cb595139babd4da17772"
                                      d="M18.839,9.51l-.279,8.445a2.782,2.782,0,0,1-2.79,2.69h-5.3a2.782,2.782,0,0,1-2.79-2.688L7.4,9.51a.7.7,0,0,1,1.4-.046l.279,8.447a1.4,1.4,0,0,0,1.4,1.341h5.3a1.4,1.4,0,0,0,1.4-1.344l.279-8.444a.7.7,0,0,1,1.4.046Zm.923-2.81a.7.7,0,0,1-.7.7H7.176a.7.7,0,1,1,0-1.4H9.338a.89.89,0,0,0,.888-.8,2.086,2.086,0,0,1,2.081-1.879h1.625A2.086,2.086,0,0,1,16.014,5.2.89.89,0,0,0,16.9,6h2.162a.7.7,0,0,1,.7.7ZM11.437,6H14.8a2.3,2.3,0,0,1-.178-.658.7.7,0,0,0-.693-.628H12.308a.7.7,0,0,0-.693.628A2.3,2.3,0,0,1,11.436,6Zm.7,10.568V10.631a.7.7,0,1,0-1.4,0v5.942a.7.7,0,1,0,1.4,0Zm3.358,0V10.631a.7.7,0,1,0-1.4,0v5.942a.7.7,0,1,0,1.4,0Z"
                                      transform="translate(-6.478 -3.322)"
                                    />
                                  </svg>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row justify-between items-center">
                      <div className="w-[15%]">
                        <span className="font-normal text-base">Webhook</span>
                      </div>
                      <div className="w-[85%]">
                        <div className="h-[6rem] bg-white rounded-2xl">
                          <table className="w-full bg-[#F0F0F0] rounded-2xl">
                            <thead className="">
                              <tr>
                                <th className="col-2 px-4 py-2 text-[14px] font-normal text-left text-[#707070] w-[80%]">
                                  Adresse Webhook
                                </th>
                                <th className="px-4 py-2 text-[14px] font-normal text-left text-[#707070] w-[10%]">
                                  Statut
                                </th>
                                <th className="px-4 py-2 text-left text-gray-600 font-semibold w-[10%]"></th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              <tr>
                                <td className="px-4 py-2 text-[14px] font-normal text-left">
                                  {"73288ff8-e26f-4051-b196-8829752d6e92"}
                                </td>
                                <td className="px-4 py-2 text-[14px] font-normal text-left">
                                  <span className="bg-[#DBFCEF] pt-1 pb-1 pl-4 pr-4 rounded-md text-[#19B2A6]">
                                    Actif
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-[14px] font-normal text-left flex items-center justify-end space-x-2">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16.269"
                                    height="16.269"
                                    viewBox="0 0 16.269 16.269"
                                  >
                                    <g
                                      id="_94ed4df1c470af571565164b9572c9c1"
                                      data-name="94ed4df1c470af571565164b9572c9c1"
                                      transform="translate(-2 -2.071)"
                                    >
                                      <path
                                        id="Tracé_965"
                                        data-name="Tracé 965"
                                        d="M10.134,18.34a8.134,8.134,0,1,1,8.134-8.134A8.143,8.143,0,0,1,10.134,18.34Zm0-14.967a6.833,6.833,0,1,0,6.833,6.833,6.84,6.84,0,0,0-6.833-6.833Z"
                                      />
                                      <path
                                        id="Tracé_966"
                                        data-name="Tracé 966"
                                        d="M14.151,16.682a.651.651,0,0,1-.651-.651V8.222a.651.651,0,1,1,1.3,0v7.809A.651.651,0,0,1,14.151,16.682Z"
                                        transform="translate(-4.016 -1.921)"
                                      />
                                      <path
                                        id="Tracé_967"
                                        data-name="Tracé 967"
                                        d="M15.96,14.873H8.151a.651.651,0,1,1,0-1.3H15.96a.651.651,0,1,1,0,1.3Z"
                                        transform="translate(-1.921 -4.016)"
                                      />
                                    </g>
                                  </svg>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="15.798"
                                    height="15.779"
                                    viewBox="0 0 15.798 15.779"
                                  >
                                    <g
                                      id="_314eec5d0c2110d02c2df6c410efc994"
                                      data-name="314eec5d0c2110d02c2df6c410efc994"
                                      transform="translate(0 -0.078)"
                                    >
                                      <path
                                        id="Tracé_963"
                                        data-name="Tracé 963"
                                        d="M2.309,16.512H12.2a2.315,2.315,0,0,0,2.309-2.317V9.223a.66.66,0,1,0-1.319,0v4.972a1,1,0,0,1-.989,1H2.309a1,1,0,0,1-.989-1V4.317a1,1,0,0,1,.989-1H7.256A.66.66,0,0,0,7.256,2H2.309A2.315,2.315,0,0,0,0,4.317v9.877a2.315,2.315,0,0,0,2.309,2.317Z"
                                        transform="translate(0 -0.654)"
                                      />
                                      <path
                                        id="Tracé_964"
                                        data-name="Tracé 964"
                                        d="M9.179,6.982l-.52,2.384a.66.66,0,0,0,.179.608.685.685,0,0,0,.607.177l2.379-.522a.66.66,0,0,0,.326-.179L18.16,3.438a1.979,1.979,0,0,0,0-2.8,2.025,2.025,0,0,0-2.8,0l-6,6.018A.66.66,0,0,0,9.179,6.982Zm7.116-5.409a.674.674,0,0,1,.933,0,.666.666,0,0,1,0,.932l-.466.466-.933-.933Zm-5.871,5.88,4.468-4.479.923.928-4.47,4.481-1.184.26Z"
                                        transform="translate(-2.942)"
                                      />
                                    </g>
                                  </svg>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="13.284"
                                    height="17.323"
                                    viewBox="0 0 13.284 17.323"
                                  >
                                    <path
                                      id="da086273b974cb595139babd4da17772"
                                      d="M18.839,9.51l-.279,8.445a2.782,2.782,0,0,1-2.79,2.69h-5.3a2.782,2.782,0,0,1-2.79-2.688L7.4,9.51a.7.7,0,0,1,1.4-.046l.279,8.447a1.4,1.4,0,0,0,1.4,1.341h5.3a1.4,1.4,0,0,0,1.4-1.344l.279-8.444a.7.7,0,0,1,1.4.046Zm.923-2.81a.7.7,0,0,1-.7.7H7.176a.7.7,0,1,1,0-1.4H9.338a.89.89,0,0,0,.888-.8,2.086,2.086,0,0,1,2.081-1.879h1.625A2.086,2.086,0,0,1,16.014,5.2.89.89,0,0,0,16.9,6h2.162a.7.7,0,0,1,.7.7ZM11.437,6H14.8a2.3,2.3,0,0,1-.178-.658.7.7,0,0,0-.693-.628H12.308a.7.7,0,0,0-.693.628A2.3,2.3,0,0,1,11.436,6Zm.7,10.568V10.631a.7.7,0,1,0-1.4,0v5.942a.7.7,0,1,0,1.4,0Zm3.358,0V10.631a.7.7,0,1,0-1.4,0v5.942a.7.7,0,1,0,1.4,0Z"
                                      transform="translate(-6.478 -3.322)"
                                    />
                                  </svg>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row justify-between items-center">
                      <div className="w-[15%]">
                        <span className="font-normal text-base">
                          Return URL
                        </span>
                      </div>
                      <div className="w-[85%]">
                        <div className="h-[6rem] bg-white rounded-2xl">
                          {/* <table className="w-full bg-[#F0F0F0] rounded-2xl">
                            <thead className="">
                              <tr>
                                <th className="px-4 py-2 text-[14px] font-normal text-left text-[#707070]">
                                  API Key
                                </th>
                                <th className="px-4 py-2 text-[14px] font-normal text-left text-[#707070]">
                                  Secret Key
                                </th>
                                <th className="px-4 py-2 text-[14px] font-normal text-left text-[#707070]">
                                  Statut
                                </th>
                                <th className="px-4 py-2 text-left text-gray-600 font-semibold"></th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              <tr>
                                <td className="px-4 py-2 text-[14px] font-normal text-left">
                                  {"73288ff8-e26f-4051-b196-8829752d6e92"}
                                </td>
                                <td className="px-4 py-2 text-[14px] font-normal text-left flex">
                                  <span>************</span>
                                  <Files className={`h-4 w-4 ml-2`} />
                                </td>
                                <td className="px-4 py-2 text-[14px] font-normal text-left">
                                  <span className="bg-[#DBFCEF] pt-1 pb-1 pl-4 pr-4 rounded-md text-[#19B2A6]">
                                    Actif
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-[14px] font-normal text-left flex items-center justify-end space-x-2">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16.269"
                                    height="16.269"
                                    viewBox="0 0 16.269 16.269"
                                  >
                                    <g
                                      id="_94ed4df1c470af571565164b9572c9c1"
                                      data-name="94ed4df1c470af571565164b9572c9c1"
                                      transform="translate(-2 -2.071)"
                                    >
                                      <path
                                        id="Tracé_965"
                                        data-name="Tracé 965"
                                        d="M10.134,18.34a8.134,8.134,0,1,1,8.134-8.134A8.143,8.143,0,0,1,10.134,18.34Zm0-14.967a6.833,6.833,0,1,0,6.833,6.833,6.84,6.84,0,0,0-6.833-6.833Z"
                                      />
                                      <path
                                        id="Tracé_966"
                                        data-name="Tracé 966"
                                        d="M14.151,16.682a.651.651,0,0,1-.651-.651V8.222a.651.651,0,1,1,1.3,0v7.809A.651.651,0,0,1,14.151,16.682Z"
                                        transform="translate(-4.016 -1.921)"
                                      />
                                      <path
                                        id="Tracé_967"
                                        data-name="Tracé 967"
                                        d="M15.96,14.873H8.151a.651.651,0,1,1,0-1.3H15.96a.651.651,0,1,1,0,1.3Z"
                                        transform="translate(-1.921 -4.016)"
                                      />
                                    </g>
                                  </svg>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="15.798"
                                    height="15.779"
                                    viewBox="0 0 15.798 15.779"
                                  >
                                    <g
                                      id="_314eec5d0c2110d02c2df6c410efc994"
                                      data-name="314eec5d0c2110d02c2df6c410efc994"
                                      transform="translate(0 -0.078)"
                                    >
                                      <path
                                        id="Tracé_963"
                                        data-name="Tracé 963"
                                        d="M2.309,16.512H12.2a2.315,2.315,0,0,0,2.309-2.317V9.223a.66.66,0,1,0-1.319,0v4.972a1,1,0,0,1-.989,1H2.309a1,1,0,0,1-.989-1V4.317a1,1,0,0,1,.989-1H7.256A.66.66,0,0,0,7.256,2H2.309A2.315,2.315,0,0,0,0,4.317v9.877a2.315,2.315,0,0,0,2.309,2.317Z"
                                        transform="translate(0 -0.654)"
                                      />
                                      <path
                                        id="Tracé_964"
                                        data-name="Tracé 964"
                                        d="M9.179,6.982l-.52,2.384a.66.66,0,0,0,.179.608.685.685,0,0,0,.607.177l2.379-.522a.66.66,0,0,0,.326-.179L18.16,3.438a1.979,1.979,0,0,0,0-2.8,2.025,2.025,0,0,0-2.8,0l-6,6.018A.66.66,0,0,0,9.179,6.982Zm7.116-5.409a.674.674,0,0,1,.933,0,.666.666,0,0,1,0,.932l-.466.466-.933-.933Zm-5.871,5.88,4.468-4.479.923.928-4.47,4.481-1.184.26Z"
                                        transform="translate(-2.942)"
                                      />
                                    </g>
                                  </svg>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="13.284"
                                    height="17.323"
                                    viewBox="0 0 13.284 17.323"
                                  >
                                    <path
                                      id="da086273b974cb595139babd4da17772"
                                      d="M18.839,9.51l-.279,8.445a2.782,2.782,0,0,1-2.79,2.69h-5.3a2.782,2.782,0,0,1-2.79-2.688L7.4,9.51a.7.7,0,0,1,1.4-.046l.279,8.447a1.4,1.4,0,0,0,1.4,1.341h5.3a1.4,1.4,0,0,0,1.4-1.344l.279-8.444a.7.7,0,0,1,1.4.046Zm.923-2.81a.7.7,0,0,1-.7.7H7.176a.7.7,0,1,1,0-1.4H9.338a.89.89,0,0,0,.888-.8,2.086,2.086,0,0,1,2.081-1.879h1.625A2.086,2.086,0,0,1,16.014,5.2.89.89,0,0,0,16.9,6h2.162a.7.7,0,0,1,.7.7ZM11.437,6H14.8a2.3,2.3,0,0,1-.178-.658.7.7,0,0,0-.693-.628H12.308a.7.7,0,0,0-.693.628A2.3,2.3,0,0,1,11.436,6Zm.7,10.568V10.631a.7.7,0,1,0-1.4,0v5.942a.7.7,0,1,0,1.4,0Zm3.358,0V10.631a.7.7,0,1,0-1.4,0v5.942a.7.7,0,1,0,1.4,0Z"
                                      transform="translate(-6.478 -3.322)"
                                    />
                                  </svg>
                                </td>
                              </tr>
                            </tbody>
                          </table> */}
                          <div className="flex justify-between items-center h-[6rem] p-3">
                            <span className="text-[14px] font-normal text-center">
                              Aucun webhook configuré pour ce point de vente
                            </span>
                            <div className="flex items-center justify-end space-x-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16.269"
                                height="16.269"
                                viewBox="0 0 16.269 16.269"
                              >
                                <g
                                  id="_94ed4df1c470af571565164b9572c9c1"
                                  data-name="94ed4df1c470af571565164b9572c9c1"
                                  transform="translate(-2 -2.071)"
                                >
                                  <path
                                    id="Tracé_965"
                                    data-name="Tracé 965"
                                    d="M10.134,18.34a8.134,8.134,0,1,1,8.134-8.134A8.143,8.143,0,0,1,10.134,18.34Zm0-14.967a6.833,6.833,0,1,0,6.833,6.833,6.84,6.84,0,0,0-6.833-6.833Z"
                                  />
                                  <path
                                    id="Tracé_966"
                                    data-name="Tracé 966"
                                    d="M14.151,16.682a.651.651,0,0,1-.651-.651V8.222a.651.651,0,1,1,1.3,0v7.809A.651.651,0,0,1,14.151,16.682Z"
                                    transform="translate(-4.016 -1.921)"
                                  />
                                  <path
                                    id="Tracé_967"
                                    data-name="Tracé 967"
                                    d="M15.96,14.873H8.151a.651.651,0,1,1,0-1.3H15.96a.651.651,0,1,1,0,1.3Z"
                                    transform="translate(-1.921 -4.016)"
                                  />
                                </g>
                              </svg>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="15.798"
                                height="15.779"
                                viewBox="0 0 15.798 15.779"
                              >
                                <g
                                  id="_314eec5d0c2110d02c2df6c410efc994"
                                  data-name="314eec5d0c2110d02c2df6c410efc994"
                                  transform="translate(0 -0.078)"
                                >
                                  <path
                                    id="Tracé_963"
                                    data-name="Tracé 963"
                                    d="M2.309,16.512H12.2a2.315,2.315,0,0,0,2.309-2.317V9.223a.66.66,0,1,0-1.319,0v4.972a1,1,0,0,1-.989,1H2.309a1,1,0,0,1-.989-1V4.317a1,1,0,0,1,.989-1H7.256A.66.66,0,0,0,7.256,2H2.309A2.315,2.315,0,0,0,0,4.317v9.877a2.315,2.315,0,0,0,2.309,2.317Z"
                                    transform="translate(0 -0.654)"
                                  />
                                  <path
                                    id="Tracé_964"
                                    data-name="Tracé 964"
                                    d="M9.179,6.982l-.52,2.384a.66.66,0,0,0,.179.608.685.685,0,0,0,.607.177l2.379-.522a.66.66,0,0,0,.326-.179L18.16,3.438a1.979,1.979,0,0,0,0-2.8,2.025,2.025,0,0,0-2.8,0l-6,6.018A.66.66,0,0,0,9.179,6.982Zm7.116-5.409a.674.674,0,0,1,.933,0,.666.666,0,0,1,0,.932l-.466.466-.933-.933Zm-5.871,5.88,4.468-4.479.923.928-4.47,4.481-1.184.26Z"
                                    transform="translate(-2.942)"
                                  />
                                </g>
                              </svg>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="13.284"
                                height="17.323"
                                viewBox="0 0 13.284 17.323"
                              >
                                <path
                                  id="da086273b974cb595139babd4da17772"
                                  d="M18.839,9.51l-.279,8.445a2.782,2.782,0,0,1-2.79,2.69h-5.3a2.782,2.782,0,0,1-2.79-2.688L7.4,9.51a.7.7,0,0,1,1.4-.046l.279,8.447a1.4,1.4,0,0,0,1.4,1.341h5.3a1.4,1.4,0,0,0,1.4-1.344l.279-8.444a.7.7,0,0,1,1.4.046Zm.923-2.81a.7.7,0,0,1-.7.7H7.176a.7.7,0,1,1,0-1.4H9.338a.89.89,0,0,0,.888-.8,2.086,2.086,0,0,1,2.081-1.879h1.625A2.086,2.086,0,0,1,16.014,5.2.89.89,0,0,0,16.9,6h2.162a.7.7,0,0,1,.7.7ZM11.437,6H14.8a2.3,2.3,0,0,1-.178-.658.7.7,0,0,0-.693-.628H12.308a.7.7,0,0,0-.693.628A2.3,2.3,0,0,1,11.436,6Zm.7,10.568V10.631a.7.7,0,1,0-1.4,0v5.942a.7.7,0,1,0,1.4,0Zm3.358,0V10.631a.7.7,0,1,0-1.4,0v5.942a.7.7,0,1,0,1.4,0Z"
                                  transform="translate(-6.478 -3.322)"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
