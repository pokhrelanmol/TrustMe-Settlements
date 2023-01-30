import React from "react";
import { CgArrowsExchangeAlt } from "react-icons/cg";
import { BsLink, BsPlus, BsPlusCircle } from "react-icons/bs";
import { MdLogout } from "react-icons/md";
import { AiFillPlusCircle } from "react-icons/ai";
import Button from "../elements/Button";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useFormatAddress } from "@/hooks/hook";
const UserDetail = () => {
    const { address } = useAccount();
    const formattedAddress = useFormatAddress(address || "");
    return (
        <div className="flex flex-row justify-between items-center mt-3">
            <div className="flex flex-col gap-5 shadow-md  shadow-gray-300 p-3 rounded bg-text border-[0.2px] border-gray-300">
                <div className="flex flex-row gap-5">
                    <CgArrowsExchangeAlt className="text-2xl text-secondary-900" />
                    <div className="flex flex-col gap-2">
                        <h3 className="text-bg-light">Connected Address</h3>
                        <h4 className="text-sm text-secondary-800 tracking-wider">
                            {formattedAddress}
                        </h4>
                    </div>
                </div>

                <div className="flex flex-row gap-5 items-center">
                    <BsLink className="text-2xl text-secondary-900" />
                    <h3 className="text-bg-light">
                        Transactions - <span>10</span>
                    </h3>
                </div>
            </div>

            {/* <Button
        label="Exit"
        variant="tertiary"
        bg="bg-red-400 flex flex-row gap-2 items-center justify-center px-1 py-3"
        onClick={() => {}}
      >
        <MdLogout className="text-xl" />
      </Button> */}
            <div className="flex flex-col gap-2 justify-end items-center mt-auto">
                <button
                    type="button"
                    className="w-[70px] h-[70px] rounded-full p-[3px] bg-secondary-800 text-white outline-none border-none hover:outline-none hover:bg-none focus:outline-none focus:bg-none flex flex-col items-center justify-center"
                >
                    <Link href="/createTrade">
                        <BsPlus className="text-5xl" />
                    </Link>
                </button>
                <span className="font-semibold tracking-wide uppercase">
                    Create Trade
                </span>
            </div>
        </div>
    );
};

export default UserDetail;
