import { ethers } from "ethers";
import { IERC20__factory, TrustMe } from "typechain";
import { goerli } from "wagmi";
import abi from "../../abi.json";

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_GOERLI_API_KEY || "";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY || "";

const alchemyProvider = new ethers.providers.AlchemyProvider(
    goerli.network,
    ALCHEMY_API_KEY
); // Signer
const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);

export const trustMeContract: TrustMe = new ethers.Contract(
    "0xF112F9D64Db9BE8F33Ee2e49c625EB564e58a25E",
    abi,
    signer
) as TrustMe;
