import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {TransactionsStatus} from "@/components/dashboard/serenity-space/LastTransactions";
import {PointsOfSaleStatus} from "@/components/dashboard/points-of-sale/PointOfSaleListAndOperations";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCFA(amount: number) {
    if (amount == undefined) {
        return "-";
        // return "0 F CFA";
    }

    const formattedAmount = amount.toLocaleString('fr-FR', {style: 'currency', currency: 'XOF'});

    return formattedAmount;
}

export const formatNumber = (number: number) => {
    return new Intl.NumberFormat('fr-FR').format(number);
};

export function balanceOffset(balance: number, skaleetBalance: number) {

    const nonCompensatedBalance = balance - skaleetBalance;

    const proportion = ((nonCompensatedBalance / balance) * 100) / (balance + skaleetBalance);
    const proportionString = parseFloat(proportion.toFixed(2)).toString();

    return {
        nonCompensatedBalance,
        proportion: proportionString
    };
}

export function hiddeBalance(amount: string) {
    const amountToString = `${amount}`;
    return amountToString.replace(/./g, '*');
}

export function getStatusBadge(transactionStatus: string): string {
    if (transactionStatus == TransactionsStatus.EXPIRED) {
        return `<span class="status-expired font-medium text-[10.5px]">Expiré</span>`;
    } else if (transactionStatus == TransactionsStatus.DONE) {
        return `<span class="status-success font-medium text-[10.5px]">Approuvé</span>`;
    } else if (transactionStatus == TransactionsStatus.DECLINED) {
        return `<span class="status-rejected font-medium text-[10.5px]">Échoué</span>`;
    } else {
        return `<span class="status-pending font-medium text-[10.5px]">En cours</span>`;
    }
}

export function getStatusName(transactionStatus: string): string {
    if (transactionStatus == TransactionsStatus.EXPIRED) {
        return `Expiré`;
    } else if (transactionStatus == TransactionsStatus.DONE) {
        return `Approuvé`;
    } else if (transactionStatus == TransactionsStatus.DECLINED) {
        return `Échoué`;
    } else {
        return `En cours`;
    }
}

export function getPointsOfSaleStatusBadge(pointsStatus: string): string {
    if (pointsStatus == PointsOfSaleStatus.ACTIVE) {
        return `<span class="status-point-success font-medium text-[10.5px]">Actif</span>`;
    } else {
        return `<span class="status-point-rejected font-medium text-[10.5px]">Inactif</span>`;
    }
}

export function formatDate(dateString: string | undefined, lang: string): string {
    const date = new Date(dateString ?? "");

    if (isNaN(date.getTime())) {
        return '-';
    }

    const day = String(date.getDate());
    const month = date.toLocaleString(lang, { month: 'short' })
    const year = date.getFullYear();

    const currentYear = new Date().getFullYear();

    // if (year === currentYear) {
    //     return `${day} ${month} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    // } else {
        return `${day} ${month} ${year} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    // }
}

export function getBankName(bankCode: string) {
    const bankCodeDigit = bankCode.match(/\d+/g)?.join('');
    if (!bankCodeDigit) {
        return;
    }

    const codeNumber = parseInt(bankCodeDigit);

    console.log(codeNumber);

    const banks: any = {
        207: "BABF",
        134: "BANQUE ATLANTIQUE",
        56: "bcb_logo-removebg-preview.png",
        179: "bdu-bf.png",
        23: "BICIA-BURKINA",
        84: "BOA BURKINA",
        108: "BSIC BURKINA",
        161: "CBAO BURKINA",
        148: "CBI BURKINA",
        83: "the-pan-african-bank-ecobank-logo-3000x1475.png",
        139: "IB BANK BURKINA",
        171: "ORABANK BURKINA",
        74: "SOCIETE GENERALE BURKINA",
        22: "nigeria-united-bank-for-africa-logo-financial-services-bank-beba9cc103bd7b937cd0238f6bc5ba6a.png",
        202: "WENDKUNI BANK INTERNATIONAL",
        115: "ATBJBJBJ",
        63: "B.I.BE",
        185: "BAIC BENI",
        157: "BGFIBANK BENI",
        61: "BOA-BENI",
        107: "BSIC BENI",
        177: "CBAO BENI",
        212: "CBI-BENI",
        184: "CCEI BANK BENI",
        62: "the-pan-african-bank-ecobank-logo-3000x1475.png",
        99: "NSIA BANQUE-BENI",
        58: "ORABANK BENI",
        104: "SG BENI",
        199: "SOCIéTé NIGERIENNE DE BANQUE BENI",
        67: "nigeria-united-bank-for-africa-logo-financial-services-bank-beba9cc103bd7b937cd0238f6bc5ba6a.png",
        34: "BACI",
        155: "BANQUE POPULAIRE",
        201: "BDA",
        180: "BDU COTE D'IVOIRE",
        162: "BGFIBANK COTE D'IVOIRE",
        68: "BHCI",
        6: "BICICI",
        188: "BMS COTE D'IVOIRE",
        92: "BNI",
        32: "BOA COTE D'IVOIRE",
        131: "BRIDGE BANK GROUP COTE D'IVOIRE",
        194: "BRM COTE D'IVOIRE",
        154: "BSIC COTE D'IVOIRE",
        166: "CBI COTE D'IVOIRE",
        118: "CITIBANK COTE D'IVOIRE",
        158: "DIAMOND BANK COTE D'IVOIRE",
        59: "the-pan-african-bank-ecobank-logo-3000x1475.png",
        106: "AFRILAND FIRST BANK COTE D'IVOIRE",
        163: "GTBANK COTE D'IVOIRE",
        211: "MANSA BANK COTE D'IVOIRE",
        42: "NSIA BANQUE COTE D'IVOIRE",
        121: "ORABANK COTE D'IVOIRE",
        214: "ORANGE BANK COTE D'IVOIRE",
        8: "SGCI",
        7: "SIB",
        198: "STANBIC BANK COTE D'IVOIRE",
        97: "STANDARD CHARTERED COTE D'IVOIRE",
        150: "nigeria-united-bank-for-africa-logo-financial-services-bank-beba9cc103bd7b937cd0238f6bc5ba6a.png",
        112: "VERSUS BANK COTE D'IVOIRE",
        195: "BANQUE ATLANTIQUE GUINEE-BISSAU",
        96: "BAO",
        128: "BDU",
        143: "the-pan-african-bank-ecobank-logo-3000x1475.png",
        172: "ORABANK GUINEE-BISSAU",
        135: "BANQUE ATLANTIQUE MALI",
        147: "BCI MALI",
        44: "BCS MALI",
        16: "BDM MALI",
        89: "BICI-M",
        41: "BIM MALI",
        102: "BMS",
        43: "BNDA MALI",
        45: "BOA-MALI",
        109: "BSIC-MALI",
        90: "the-pan-african-bank-ecobank-logo-3000x1475.png",
        173: "ORABANK MALI",
        206: "nigeria-united-bank-for-africa-logo-financial-services-bank-beba9cc103bd7b937cd0238f6bc5ba6a.png",
        164: "BAGRI",
        136: "BANQUE ATLANTIQUE",
        57: "BC",
        208: "BH",
        40: "BIA-NIGER",
        81: "BI",
        38: "BOA-NIGER",
        193: "BRM NIGER",
        110: "BSIC-NIGER",
        168: "CBAO NIGER",
        210: "CORIS NIGER",
        95: "the-pan-african-bank-ecobank-logo-3000x1475.png",
        174: "ORABANK NIGER",
        64: "SONIBANK",
        137: "BANQUE ATLANTIQUE",
        191: "BANQUE DE DAKAR",
        221: "BDM SENEGAL",
        189: "BGFIBANK-SENEGAL",
        39: "BHS",
        10: "BICIS",
        117: "BIMAO SENEGAL",
        79: "BIS",
        169: "BNDE SENEGAL",
        100: "BOA SENEGAL",
        144: "BRM SENEGAL",
        111: "BSIC SENEGAL",
        178: "BSI-MALI",
        12: "CBAO SENEGAL",
        213: "CBI–SENEGAL",
        60: "CDS",
        141: "CITIBANK SENEGAL",
        156: "CREDIT INTERNATIONAL SENEGAL",
        94: "the-pan-african-bank-ecobank-logo-3000x1475.png",
        140: "FBNBANK SéNéGAL",
        48: "LBA",
        200: "LBO SENEGAL",
        159: "NSIA SENEGAL",
        175: "ORABANK SENEGAL",
        11: "SOCIETE GENERALE SENEGAL",
        153: "nigeria-united-bank-for-africa-logo-financial-services-bank-beba9cc103bd7b937cd0238f6bc5ba6a.png",
        138: "BANQUE ATLANTIQUE TOGO",
        2: "BDM TOGO", // Little problem
        5: "BIA-TOGO",
        167: "BOA TOGO",
        133: "BSIC-TOGO",
        24: "BTCI",
        182: "CBI-TOGO",
        55: "the-pan-african-bank-ecobank-logo-3000x1475.png",
        160: "NSIA BANQUE TOGO",
        116: "ORABANK TOGO",
        27: "SIAB",
        187: "SOCIETE GENERALE TOGO",
        151: "SUNU BANK TOGO",
        9: "UTB",
        181: "CBI-MALI"
    };

    return banks[codeNumber];
}

export const TStatus = [
    "pending",
    "approved",
    "declined",
]

export const getPeriod = (type: string) => {
    const periodNumber = type.match(/\d+/g)?.join('');
    const periodUnit = type.replace(`${periodNumber}`, '');

    if (periodUnit == 'd') {
        return periodNumber+' jour(s)'
    } else if (periodUnit == 'w') {
        return periodNumber+' Semaine(s)'
    } else if (periodUnit == 'm') {
        return periodNumber+' Mois'
    } else {
        return periodNumber+' jour(s)'
    }
}

export const getTransactionMode = (type: string) => {
    if (!type) {
        return "-";
    }

    const stringArray = type.split('_');
    return stringArray[stringArray.length - 1];
}

export const getTransactionModeType = (type: string) => {
    if (!type) {
        return "-";
    }

    const stringArray = type.split('_');
    const operator = stringArray[stringArray.length - 1];

    const mobileMoneyArray = ['WAVE', 'MTN', 'MOOV', 'ORANGE'];
    const paynahAccountArray = ['1'];
    const bankAccountArray = ['3'];


    if (mobileMoneyArray.indexOf(operator) !== -1) {
        return "Mobile Money"
    }

    if (paynahAccountArray.indexOf(operator) !== -1) {
        return "Mobile Money"
    }

    if (bankAccountArray.indexOf(operator) !== -1) {
        return "Mobile Money"
    }

    return "-";
}

export function getTransactionType(type: string) {
    // console.log(type);
    const transactionTypes: any = {
        "PAYIN": "Paiement",
        "PAYOUT": "Envoi d'argent",
    }

    return transactionTypes[type] ?? "-";
}

export function calculatePercentageOfAmount(amount: number, percent: number) {
    let percentage = amount * percent;
    let percentageStr = percentage.toString();
    let roundedPercentage;

    if (percentageStr.includes('.')) {
        let parts = percentageStr.split('.');
        let integerPart = parseInt(parts[0]);
        let decimalPart = parts[1];

        if (parseInt(decimalPart[0]) < 5) {
            roundedPercentage = integerPart;
        } else {
            roundedPercentage = integerPart + 1;
        }
    } else {
        roundedPercentage = percentage;
    }

    return roundedPercentage;
}

export function getInitPhoneNumberByCountryCode(countryCode: string) {
    const init: any = {
        'ci': '+225',
        'sn': '+221',
        'bn': '+229',
    };

    return init[countryCode.toLocaleLowerCase()];
}

export const activePayouts = () => {
    return [
        'WAVE',
        'MTN'
    ];
}

