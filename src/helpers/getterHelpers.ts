import { alchemy } from "@/connector/connect";
import { BigNumber } from "ethers";
import { trustMeContract } from "../constants/interact";
// import { Alchemy, Network } from "alchemy-sdk"

// const ALCHEMY_API_KEY = process.env.ALCHEMY_GOERLI_API_KEY
// const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || ""

// const settings = {
//   apiKey: ALCHEMY_API_KEY,
//   network: Network.ETH_GOERLI,
// }

// const alchemy = new Alchemy(settings)

// // Returns the current block number
// export const getBlockNumber = async () => {
//   const blockNumber = await alchemy.core.getBlockNumber()
//   return blockNumber
// }

// alchemy.core.getTokenBalances(CONTRACT_ADDRESS).then((balances) => {
//   console.log("Balances:", balances)
// })

// // Returns the token balances for a specific owner address given a list of contracts
// export const getTokenBalances = async (ownerAddress: string, contractAddresses: string[]) => {
//   const balances = await alchemy.core.getTokenBalances(ownerAddress, contractAddresses)

//   return balances
// }

export async function getPendingTrades() {
    const pendingTradesIDs = await trustMeContract.getPendingTradesIDs();
    return pendingTradesIDs;
}

export async function getTrade(tradeId: number) {
    const trade = await trustMeContract.getTrade(tradeId);
    return trade;
}

// export async function getTradeIdToTrade(tradeId: number) {
//     return await trustMeContract.getTrade(tradeId);
// }

export const getTradeStatus = async (tradeID: number) => {
    const tradeStatus = await trustMeContract.getTradeStatus(tradeID);
    return tradeStatus;
};

export const getTradesIDsByUser = async (address: string) => {
    const tradeIds = await trustMeContract.getTradesIDsByUser(address);

    return tradeIds;
};

export const getUserToTradesIDs = async (userAddress: string, id: number) => {
    const tradeStatus = await trustMeContract.userToTradesIDs(userAddress, id);
    return tradeStatus;
};
// Using the Alchemy SDK
interface TokenMetadataResponse {
    name: string;
    symbol: string;
    decimals: number;
    logo: string;
    address: string;
}

export const getConnectedUserTokens = async (address: string) => {
    const tokenMetadata: any = [];
    const balances = await alchemy.core.getTokenBalances(address);

    // Remove tokens with zero balance
    const nonZeroBalances = balances.tokenBalances.filter((token) => {
        return token.tokenBalance !== "0";
    });
    for (let token of nonZeroBalances) {
        // Get balance of token
        let balance: number = token.tokenBalance as unknown as number;

        // Get metadata of token
        const metadata = await alchemy.core.getTokenMetadata(
            token.contractAddress
        );

        // Compute token balance in human-readable format
        balance = balance / Math.pow(10, metadata.decimals as number);
        balance = balance.toFixed(2) as unknown as number;
        tokenMetadata.push({
            name: metadata.name,
            symbol: metadata.symbol,
            balance: balance,
            decimals: metadata.decimals,
            logo: metadata.logo,
            address: token.contractAddress,
        });
    }
    return tokenMetadata;
};
