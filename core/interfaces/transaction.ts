export interface ITransaction {
    tId?: string;
    transactionId?: string;
    transaction_type?: any;
    createdAt?: string;
    date: string;
    description?: string;
    type?: string;
    amount: number;
    country?: string;
    operator: string;
    reference: string;
    number: string;
    customer_firstname?: string;
    customer_lastname?: string;
    status: string;
}

export interface ITransactionType {
    id: string;
    name: string;
}