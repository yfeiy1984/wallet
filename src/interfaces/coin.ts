export interface CoinInterface
{
    code: string;
    name: string;
    category: string;
    type: number;
    hdPublicKey: string;
    address: string;
    address_index: number;
    address_list: string[];
    balance: string[];
    rmb: string[];
    isSelected: boolean;
}
