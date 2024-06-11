interface IPointOfSaleType {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
}

export interface IPointOfSale {
    id: string;
    name: string;
    reference: string;
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    disabled: boolean;
    disabledDate: string;
    posTypeId: string;
    apiKey: string;
    logo_url: string;
    bankAccountId: string;
    merchantId: string;
    posType: IPointOfSaleType;
}

export interface ITerminal {
    id?: string;
    name: string;
    type: string;
    country: string;
    legalForm: string;
    ownerEmail: string;
    ownerFirstname: string;
    ownerLastname: string;
    password: string;
    kyc: any;
}