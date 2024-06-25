"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Banknote,
  Goal,
  Search,
  Send,
  SquarePen,
  TimerReset,
  X,
} from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { formatCFA, getPeriod } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NumericFormat } from "react-number-format";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BeneficiaryActions from "@/components/dashboard/send-money/modals/BeneficiaryActions";
import PaymentLinkActions from "@/components/dashboard/payment-link/modals/PaymentLinkActions";
import { IUser } from "@/core/interfaces/user";
import { IAccount } from "@/core/interfaces/account";
import { IBeneficiary } from "@/core/interfaces/beneficiary";

interface MainActionsProps {
  lang: string;
  merchant: IUser;
  accounts: IAccount[];
  beneficiaries: IBeneficiary[];
}

export default function MainActions({
  lang,
  merchant,
  accounts,
  beneficiaries,
}: MainActionsProps) {
  const [step, setStep] = useState(1);
  const [account, setAccount] = useState<{ id: string; name: string }>({
    id: "",
    name: "",
  });
  const [beneficiary, setBeneficiary] = useState<{ id: string; name: string }>({
    id: "",
    name: "",
  });
  const [existBenef, setExistBenef] = useState(true);
  const [payFees, setPayFees] = useState(false);
  const [sendLinkCanal, setSendLinkCanal] = useState("");
  const [linkValidity, setLinkValidity] = useState("");
  const [amount, setAmount] = useState("0");
  const [totalAmount, setTotalAmount] = useState("");
  const [reason, setReason] = useState("");
  const [sentCanal, setSentCanal] = useState("sms");
  const [linkDuration, setLinkDuration] = useState("3d");
  const [percentage, setPercentage] = useState("w-1/4");

  const [confirmStep, setConfirmStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [accessKey, setAccessKey] = useState("");

  const formSchema = z.object({
    beneficiary: z.string(),
  });

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const sendMoneyForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beneficiary: "",
    },
  });

  function updateFormValue(value: any) {
    if (step == 1) {
      setAccount(value);
      setStep(2);
      setPercentage("w-2/4");
    } else if (step == 2) {
      setBeneficiary(value);
      setStep(3);
      setPercentage("w-3/4");
    }
  }

  // console.log(account);

  function nextStep() {
    if (step < 4) {
      setStep(step + 1);

      if (step + 1 == 4) {
        setPercentage("w-full");
      } else if (step + 1 == 3) {
        setPercentage("w-3/4");
      } else {
        setPercentage("w-2/4");
      }
    }
  }

  function prevStep() {
    if (step > 1) {
      setStep(step - 1);

      if (step - 1 == 1) {
        setPercentage("w-1/4");
      } else if (step - 1 == 2) {
        setPercentage("w-2/4");
      } else {
        setPercentage("w-3/4");
      }
    }
  }

  async function sendMoneyAction() {
    setConfirmStep(2);
  }

  function downloadTicket() {
    console.log("downloadTicket");
  }

  function resetSendMoneyValues() {
    setStep(1);
    setAccount({ id: "", name: "" });
    setBeneficiary({ id: "", name: "" });
    setExistBenef(true);
    setPayFees(false);
    setAmount("0");
    setTotalAmount("");
    setReason("");
    setPercentage("w-1/4");

    setConfirmStep(0);
    setShowPassword(false);
    setAccessKey("");
  }

  useEffect(() => {
    if (payFees) {
      const amountWithoutString = amount.match(/\d+/g)?.join("");
      const amountNumber = parseInt(amountWithoutString ?? "0");
      const finalAmountNumber = amountNumber * (1 / 100) + amountNumber;
      const finalAmount = formatCFA(finalAmountNumber);
      setTotalAmount(finalAmount);
    } else {
      setTotalAmount(amount);
    }
  }, [amount, payFees]);

  const defaultBeneficiary = {
    id: "",
    lastName: "",
    firstName: "",
    email: "",
    infos: [],
  };

  return (
    <>
      <PaymentLinkActions
        lang={lang}
        merchant={merchant}
        accounts={accounts}
        beneficiaries={beneficiaries}
        selectedBeneficiary={defaultBeneficiary}
      >
        <Button className={`w-full`}>{`Nouveau lien de paiement`}</Button>
      </PaymentLinkActions>
      <BeneficiaryActions lang={lang} merchant={merchant}>
        <Button
          className={`w-full text-black border border-black bg-transparent py-6 hover:text-white `}
        >
          {`Ajouter un destinataire`}
        </Button>
      </BeneficiaryActions>
    </>
  );
}
