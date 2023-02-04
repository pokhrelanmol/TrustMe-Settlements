import React, { useCallback, useEffect, useMemo, useState } from "react"
// import Button from "@/components/elements/Button"
import { useAccount } from "wagmi"
import { getTrade, trustMeContract, erc20Contract } from "@/helpers/getterHelpers"
import Layout from "@/Layout"
import { parseEther } from "ethers/lib/utils.js"
// import { BiTransfer } from "react-icons/bi"
import { AiOutlineCheck, AiOutlineLoading } from "react-icons/ai"
import InfoCard from "../../components/elements/InfoCard"
import { getFormatAddress, getFormatDate } from "@/utils"
import { useRouter } from "next/router"
import { fetchTrade } from "@/helpers/fetchTrade"
import { Trade } from "@/components/TransactionList/type"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/redux/store"
import Spinner from "@/components/elements/Spinner"
import { updateCreatedTrade } from "@/redux/trade/tradesSlice"

type TransactionDetailProps = {
  tradeId: number
}

const TransactionDetail = (props: TransactionDetailProps) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const [currentTrade, setCurrentTrade] = useState({}) as any
  const [buttonClicked, setButtonClicked] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [txWait, setTxWait] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const tradeList = useSelector((state: RootState) => state.trades.data)
  const { address } = useSelector((state: RootState) => state.wallets)

  const setState = async (id: number) => {
    const trade = await getTrade(id)
    if (trade.status === 0) {
      setIsPending(true)
    } else if (trade.status === 3) {
      setIsExpired(true)
    }
  }

  const handleCancelTrade = async (id: string) => {
    setTxWait(true)
    const contract = await trustMeContract()
    const cancel = await contract.cancelTrade(id)
    await cancel.wait()
    setTxWait(false)
  }

  const handleConfirmTrade = async (id: string) => {
    setTxWait(true)
    const contract = await trustMeContract()
    console.log(currentTrade)
    const erc20 = await erc20Contract(currentTrade.tokenToBuy)

    await erc20.approve(contract.address, parseEther(currentTrade.amountOfTokenToBuy))
    const confirm = await contract.confirmTrade(id)
    await confirm.wait()
    setTxWait(false)
  }

  const handleWithdrawTrade = async (id: string) => {
    setTxWait(true)
    const contract = await trustMeContract()
    const withdraw = await contract.withdraw(id)
    await withdraw.wait()
    setTxWait(false)
  }

  useEffect(() => {
    let tradeObj: Trade | undefined

    if (router.isReady) {
      const slug = parseInt(router.query.slug as string)
      const fetchData = async () => {
        try {
          if (tradeList.length > 0 && tradeList.find((trade: Trade) => trade.id === slug)) {
            // fetches from store
            tradeObj = tradeList.find((trade: Trade) => trade.id === slug)
            console.log(tradeObj)
          } else {
            //fetches from api
            tradeObj = await fetchTrade(address, slug)
            dispatch(updateCreatedTrade(tradeObj))
          }
          setCurrentTrade(tradeObj)
          setIsLoading(false)
        } catch (err) {
          console.log(err)
        }
      }

      fetchData()
        .then(() => {
          if (currentTrade.status === "Pending") {
            setIsPending(true)
          } else if (currentTrade.status === "Expired") {
            setIsExpired(true)
          }
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [router.isReady, router.query.slug, tradeList, address, currentTrade.status])

  return (
    <Layout>
      {isLoading ? (
        <div className="flex items-center gap-2 text-xl text-secondary-800 justify-center w-full h-full uppercase">
          <Spinner /> Loading...
        </div>
      ) : (
        <div className="w-full px-5 md:px-0">
          <div className="flex flex-row items-center justify-start w-screenpt-10 pb-2 md:py-5">
            <h3 className="text-dark mx-1 font-semibold text-secondary-900 md:text-2xl">
              Transaction Detail
            </h3>
          </div>
          <div className="grid grid-cols-1 w-full gap-x-2 gap-y-2 md:grid-cols-4 md:gap-x-5">
            <div className="flex flex-row w-full h-[55px] md:flex-col md:h-[200px]">
              <div className="flex flex-row items-center justify-between w-1/2 pr-2 md:w-full md:h-1/2">
                <InfoCard label={"TRANSACTION ID"} value={currentTrade.id} />
              </div>
              <div className="flex flex-row items-center justify-between w-1/2 md:mt-2 md:w-full md:h-1/2">
                <InfoCard label={"TXN STATUS"} value={currentTrade.status} />
              </div>
            </div>

            <div className="flex flex-row w-full h-[55px] md:flex-col md:h-[200px]">
              <div className="flex flex-row items-center justify-between w-1/2 pr-2 md:w-full md:h-1/2">
                <InfoCard label={"YOUR ADDRESS"} value={getFormatAddress(currentTrade.seller)} />
              </div>
              <div className="flex flex-row items-center justify-between w-1/2 md:mt-2 md:w-full md:h-1/2">
                <InfoCard label={"CP ADDRESS"} value={getFormatAddress(currentTrade.buyer)} />
              </div>
            </div>

            <div className="flex flex-row w-full h-[55px] md:flex-col md:h-[200px]">
              <div className="flex flex-row items-center justify-between w-1/2 pr-2 md:w-full md:h-1/2">
                <InfoCard label={"DATE CREATED"} value={getFormatDate(currentTrade.deadline)} />
              </div>
              <div className="flex flex-row items-center justify-between w-1/2 md:mt-2 md:w-full md:h-1/2">
                <InfoCard label={"EXPIRY DATE"} value={getFormatDate(currentTrade.deadline)} />
              </div>
            </div>

            <div className="flex flex-row w-full h-[55px] md:flex-col md:h-[200px]">
              <div className="flex flex-row items-center justify-between w-1/2 pr-2 md:w-full md:h-1/2">
                <InfoCard
                  label={"TOKEN TO TRANSFER"}
                  value={`${currentTrade.symbolToSell}  ${currentTrade.amountOfTokenToSell}`}
                />
              </div>
              <div className="flex flex-row items-center justify-between w-1/2 md:mt-2 md:w-full md:h-1/2">
                <InfoCard
                  label={"TOKEN TO RECEIVE"}
                  value={`${currentTrade.symbolToBuy}   ${currentTrade.amountOfTokenToBuy} `}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-end pt-5">
            <div className="flex items-center justify-center w-full h-11/12 py-10 px-10">
              {/* <Spinner/> */}
            </div>
            <div className="flex flex-row items-center">
              <>
                {isExpired && currentTrade.isOutgoing && (
                  <div className="mt-5 flex flex-1">
                    <button
                      className="flex flex-row items-center justify-center p-4 m-auto bg-yellow-300 rounded-md"
                      onClick={() => {
                        handleWithdrawTrade(currentTrade?.id)
                        setButtonClicked(true)
                      }}
                    >
                      {!txWait && !buttonClicked && (
                        <>
                          <span>Withdraw</span>
                        </>
                      )}
                      {txWait && (
                        <>
                          <AiOutlineLoading className="animate-spin h-5 w-5 " />
                          <span>Withdraw in progress</span>
                        </>
                      )}
                      {!txWait && buttonClicked && (
                        <>
                          <AiOutlineCheck className="text-green h-5 w-5" />
                          <span>Withdrawn</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {isPending && currentTrade.isOutgoing && (
                  <div className="mt-5 flex flex-1">
                    <button
                      className="flex flex-row items-center justify-center p-4 m-auto bg-red-300 rounded-md"
                      onClick={() => {
                        handleCancelTrade(currentTrade?.id)
                        setButtonClicked(true)
                      }}
                    >
                      {!txWait && !buttonClicked && (
                        <>
                          <span>Cancel</span>
                        </>
                      )}
                      {txWait && (
                        <>
                          <AiOutlineLoading className="animate-spin h-5 w-5 " />
                          <span>Cancelling</span>
                        </>
                      )}
                      {!txWait && buttonClicked && (
                        <>
                          <AiOutlineCheck className="text-green h-5 w-5" />
                          <span>Cancelled</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {isPending && !currentTrade.isOutgoing && (
                  <div className="mt-5 flex flex-1">
                    <button
                      className="flex flex-row items-center justify-center p-4 m-auto bg-green-300 rounded-md"
                      onClick={() => {
                        handleConfirmTrade(currentTrade?.id)
                        setButtonClicked(true)
                      }}
                    >
                      {!txWait && !buttonClicked && (
                        <>
                          <span>Confirm</span>
                        </>
                      )}
                      {txWait && (
                        <>
                          <AiOutlineLoading className="animate-spin h-5 w-5 " />
                          <span>Waiting for approval...</span>
                        </>
                      )}
                      {!txWait && buttonClicked && (
                        <>
                          <AiOutlineCheck className="text-green h-5 w-5" />
                          <span>Confirmed</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* <div className="px-2">
              <Button
                label="Reject"
                variant="tertiary"
                buttonType="submit"
                size="medium"
                bg="bg-bg"
              />
            </div>
            <div className="px-2">
              <Button
                label="Withdraw"
                buttonType="submit"
                size="medium"
                bg="bg-bg"
              />
            </div>
          </div>
          <div className="flex flex-row w-full items-center justify-center px-2 mt-3">
            <button className=" flex flex-row w-full bg-secondary-900 items-center justify-center rounded-sm h-[40px]">
              <BiTransfer />
              <span className="text-white px-2 font-medium ">Transfer</span>
            </button>
          </div> */}
              </>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default TransactionDetail
