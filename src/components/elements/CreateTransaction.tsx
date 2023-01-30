import React, { useEffect } from "react";
import Tokendrop from "@/components/elements/DropDown/Tokendrop";
import TokenData from "./DropDown/Data";
import { RequestData } from "next/dist/server/web/types";
import { useAccount, useSigner } from "wagmi";
import { getUserTokens } from "@/helpers/getterHelpers";
import { ethers } from "ethers";
import dayjs from "dayjs";

import abi from "../../../abi.json";

import erc20Abi from "../../../erc20Abi.json";
import { TrustMe } from "typechain";
import { getTrade } from "@/helpers/getterHelpers";
interface TokenMetadata {
    decimals: number;
    name: string;
    symbol: string;
    logo: string;
    address: string;
}
interface FormData {
    counterPartyAddress: string;
    tokenToTransfer: string;
    tokenToReceive: string;
    tokenAmountToTransfer: number;
    tokenAmountToReceive: number;
    expiryDate: string;
    expiryTime: string;
}

const CreateTransaction = () => {
    const { address, isConnecting, isDisconnected } = useAccount();
    const { data: signer, isLoading: isSignerLoading } = useSigner();
    const [tokenMetadata, setTokenMetadata] = React.useState<TokenMetadata[]>(
        []
    );
    const [formData, setFormData] = React.useState<FormData>({} as FormData);
    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmitTrade = async () => {
        const currentUnixTime = dayjs().unix();
        const unixAdress = dayjs(
            formData.expiryDate + " " + formData.expiryTime
        ).unix();
        console.log(unixAdress);

        const deadline = unixAdress - currentUnixTime;
        const trustMeContract: TrustMe = new ethers.Contract(
            "0xF112F9D64Db9BE8F33Ee2e49c625EB564e58a25E",
            abi,
            signer!
        ) as TrustMe;

        const erc20Contract = new ethers.Contract(
            formData.tokenToTransfer,
            erc20Abi,
            signer!
        );
        const _tx = await erc20Contract.approve(
            trustMeContract.address,
            ethers.utils.parseEther(formData.tokenAmountToTransfer.toString())
        );
        await _tx.wait();

        const tx = await trustMeContract.addTrade(
            formData.counterPartyAddress,
            formData.tokenToTransfer,
            formData.tokenToReceive,
            ethers.utils.parseEther(formData.tokenAmountToTransfer.toString()),
            ethers.utils.parseEther(formData.tokenAmountToReceive.toString()),
            deadline
        );
        const txReceipt = await tx.wait();
        console.log(txReceipt);
        const id = txReceipt.events?.[0].args?.id;
        const trade = await getTrade(id);
        console.log(trade);
    };

    async function checkUserTokens() {
        try {
            const userTokens = await getUserTokens(address!);
            // console.log(userTokens);
            setTokenMetadata(userTokens);
        } catch (error) {
            console.log(error);
            return;
        }
    }

    function checkAccount(address: string) {
        const patternAddress = /^0x[a-fA-F0-9]{40}$/;
        const patternENS = /^[a-zA-Z0-9()]{1,256}\.eth$\s*/;
        if (!patternAddress.test(address)) {
            return patternENS.test(address);
        }
        return patternAddress.test(address);
    }

    //for amount will be called on form submit
    function isZero(val: number) {
        if (val == null || val === 0) {
            alert("Enter valid amount");
        }
    }

    //for adding minimum date to date picker
    // function getToday() {
    //     const date = new Date();
    //     let month = date.getMonth() + 1;
    //     let year = date.getUTCFullYear().toString();
    //     let tdate =
    //         date.getDate() < 10
    //             ? "0" + date.getDate()
    //             : date.getDate().toString();
    //     let mon = month < 10 ? "0" + month : month.toString();
    //     return year + "-" + mon + "-" + tdate;
    // }

    // function validateForm(event:SubmitEvent){
    //   const form = event.target as HTMLFormElement;
    //   const formData = new FormData(form) as unknown as Iterable<[RequestData, FormDataEntryValue]>;

    //   const requestData : RequestData = Object.fromEntries(formData);
    // }
    useEffect(() => {
        if (address) {
            checkUserTokens();
        }
    }, []);
    return (
        <form className="flex items-center justify-center py-5 ">
            <div className="w-[310px] h-[470px] bg-text rounded-md flex flex-col border-[1px] px-[15px]">
                <h3 className="py-5">Submit New Trade</h3>

                <div className="input-fields flex flex-col h-[38px]">
                    <input
                        required
                        type="text"
                        id="address"
                        className="w-full h-full border-[2px] border-gray-100 rounded-md text-xs py-1 px-2"
                        placeholder="Address Counterparty"
                        name="counterPartyAddress"
                        onChange={handleChange}
                    ></input>
                </div>

                <div className="flex flex-col py-[5px]">
                    <div className="flex flex-row items-center h-[38px]">
                        {/* <Tokendrop
                            title="Token to transfer"
                            name="tokenToTransfer"
                            OptionData={tokenMetadata}
                        /> */}
                        <select
                            required
                            name="tokenToTransfer"
                            onChange={handleChange}
                            className="block appearance-none w-full h-full border border-gray-100 px-3 py-[2px] pr-8 rounded text-xs"
                        >
                            <option value="">Token to transfer</option>
                            {tokenMetadata.map((item) => (
                                <option
                                    className="items-center text-small"
                                    value={item.address}
                                >
                                    {item.symbol}
                                </option>
                            ))}
                            {/* {OptionData.map((item) => (
                                <option
                                    key={item.address}
                                    className="flex flex-row items-center justify-start text-xm"
                                >
                                    {item.symbol}
                                </option>
                            ))} */}
                        </select>

                        <input
                            onChange={handleChange}
                            required
                            type="text"
                            id="Tokenamt"
                            name="tokenAmountToTransfer"
                            className="w-2/5 h-full border-[2px] border-gray-100 rounded-md text-xs py-1 px-2"
                            placeholder="Amount"
                        ></input>
                    </div>

                    <div className="flex flex-row items-center h-[38px]">
                        {/* <Tokendrop
                            title="Address token to receive"
                            name="tokens"
                            OptionData={tokenMetadata}
                        /> */}
                        <input
                            onChange={handleChange}
                            required
                            type="text"
                            id="address"
                            className="w-full h-full border-[2px] border-gray-100 rounded-md text-xs py-1 px-2"
                            name="tokenToReceive"
                            placeholder="Address token to receive"
                        ></input>
                        <input
                            onChange={handleChange}
                            required
                            type="text"
                            id="CPtokenamt"
                            className="w-2/5 h-full border-[2px] border-gray-100 rounded-md text-xs py-1 px-2"
                            placeholder="Amount"
                            name="tokenAmountToReceive"
                        ></input>
                    </div>
                </div>

                <div className="date-time flex flex-row">
                    <div className="w-1/2 h-[38px] pr-1">
                        <input
                            onChange={handleChange}
                            name="expiryDate"
                            required
                            placeholder="Expiry Date"
                            className="w-full h-full text-xs pl-2 border-gray-100 rounded-md border-[2px] py-1"
                            type="date"
                        ></input>
                    </div>
                    <div className="w-1/2 h-[38px] pl-1">
                        <input
                            onChange={handleChange}
                            name="expiryTime"
                            required
                            placeholder="Expiry Time"
                            className="w-full h-full text-xs pl-2 border-gray-100 rounded-md border-[2px] py-1"
                            type="time"
                        ></input>
                    </div>
                </div>

                <div className="btn-div h-[50px] mt-[60px]">
                    <button
                        type="button"
                        className="w-full h-full bg-secondary-600 rounded-sm"
                        onClick={handleSubmitTrade}
                    >
                        {" "}
                        Submit Trade
                    </button>
                </div>
            </div>
        </form>
    );
};

//Buyer address: 0x7e14dcb55f6d5c2259e616ff254f566117dbde5c
//Buyer Token address: 0xee0240DCa0C5bF8B34B4242265230fad6B180c13

export default CreateTransaction;
