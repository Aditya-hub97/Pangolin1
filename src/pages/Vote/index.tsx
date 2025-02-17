//import React,{useState,useEffect} from 'react';
import styled ,{ ThemeContext } from 'styled-components';
import { TopBanner,BannerTextHead,BannerTextTag,BannerTextHolder,Span,PeliconCloseFlipImage,PeliconOpenImage } from '../Swap/styled'
//import {Link} from 'react-router-dom';
import PelicanOpenLogo from '../../assets/Logo_Exports/Illustration/Pelican-Gullar-Open.png'
import PelicanCloseLogo from '../../assets/Logo_Exports/Illustration/Pelican-Gullar-Closed.png'
import { useWalletModalToggle } from '../../state/application/hooks'
import axios from 'axios';
//import { useActiveWeb3React } from '../../hooks';
import { CurrencyAmount, JSBI, Token, Trade } from '@pangolindex/sdk'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowDown } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import Settings from '../../components/Settings/index'
//import  { ThemeContext } from 'styled-components'
import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonError, ButtonLight, ButtonPrimary, ButtonConfirmed } from '../../components/Button'
import Card, { GreyCard } from '../../components/Card'
import Column, { AutoColumn } from '../../components/Column'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween } from '../../components/Row'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import BetterTradeLink, { DefaultVersionLink } from '../../components/swap/BetterTradeLink'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
import TradePrice from '../../components/swap/TradePrice'
import TokenWarningModal from '../../components/TokenWarningModal'
import ProgressSteps from '../../components/ProgressSteps'

import { INITIAL_ALLOWED_SLIPPAGE, TRUSTED_TOKEN_ADDRESSES } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion, { DEFAULT_VERSION, Version } from '../../hooks/useToggledVersion'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useToggleSettingsMenu} from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '../../state/swap/hooks'
import { useExpertModeManager, useUserSlippageTolerance } from '../../state/user/hooks'
import { LinkStyledButton, TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
//import AppBody from '../AppBody'
import { ClickableText } from '../Pool/styleds'
import Loader from '../../components/Loader'
import useENS from '../../hooks/useENS'
import {  useTranslation } from 'react-i18next'
import { useIsSelectedAEBToken, useSelectedTokenList } from '../../state/lists/hooks'
import { DeprecatedWarning } from '../../components/Warning'
import { isTokenOnList } from '../../utils'
import { Link } from 'react-router-dom'

const BodyWrapper = styled.div`
  position: relative;
  max-width: 420px;
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 30px;
  padding: 1rem;
  margin-top:3rem;
  margin-left:39rem;
`
const WarningWrapper = styled.div`
  max-width: 420px;
  width: 100%;
  margin: 0 0 2rem 0;
`
const Heading = styled.h1`

position: absolute;
width: 101px;
height: 50px;
left: 240px;
margin-left : -2rem;
top: 455.88px;
margin-top : 6.6rem;

font-weight: 600;
font-size: 60px;
line-height: 50px;
`
const Paragraph  = styled.p`
position :absolute;
width:70%;

margin-left : 0.5rem;
font-weight: 600;
margin-top : 7.5rem;
top:520px;
color: #F8941D
`
const Paragraph2 = styled.p`
position:absolute;
display : flex;
width : 40%;
margin-left : -25rem;
font-weight: 500;
font-size:17px;
margin-top:36.3rem;
line-height:22px;
text-align: justify;
text-justify: inter-word
`
// const Square = styled.div`


// width: 424.75px;
// height: 429.54px;
// left: 800.41px;
// top: 470.4px;
// margin-left:44rem;
// margin-top : 3rem;
// background: #FFFFFF;
// box-shadow: 0px 10px 50px rgba(0, 0, 0, 0.1);
// border-radius: 25px;

// `
const Text1 = styled.h2`
font-size:18px;
margin-top : 2.2rem;
margin-left : 1.8rem;

`
// const Text2 = styled.h3`
// font-weight: 600;
// font-size: 14px;
// line-height: 16px;
// color: #B1B1B1;
// margin-left : 1.8rem;
// `
// const Text3 = styled.h2`
// color: #B1B1B1;
// font-weight: 600;
// font-size: 14px;
// line-height: 16px;
// margin-top:10rem;
// margin-left : 1.8rem;
// `
// const Text4 = styled.h2`
// margin-top : -5rem;
// margin-left:13rem;
// `

//  const Box = styled.div`
// position: absolute;
// width: 313.27px;
// height: 49.54px;

// left: 799px;
// top: 620px;
// margin-left : 1.8rem;
// padding-right: 24.5rem;
// background: #FFFFFF;
// border: 1px solid #F7931F;
// box-sizing: border-box;
// border-radius: 15px;
// `
// const Box1 = styled.div`
// position: absolute;
// width: 313.27px;
// height: 49.54px;

// left: 799px;
// top: 790px;
// margin-left : 1.8rem;
// padding-right: 24.5rem;
// background: #FFFFFF;
// border: 1px solid #F7931F;
// box-sizing: border-box;
// border-radius: 15px;
// `
// const ConnectWalletBtn = styled.button`
// position:absolute;
// font-size: 20px;
// width: auto;
// height: 49.54px;
// left: 182.54px;
// margin-top: 677px;
// margin-left : 40.4rem;
// padding-right:24.5rem;
// cursor: pointer;
// border: none;
// background: #F7931F;
// border-radius: 15px ;

// `
// const ConnectedWalletBtn = styled.button`
// position:absolute;
// font-size: 20px;
// width: auto;
// height: 49.54px;
// left: 182.54px;
// margin-top: 677px;
// margin-left : 40.4rem;
// padding-right:24.5rem;
// cursor: pointer;
// border: none;
// background: #F7931F;
// border-radius: 15px ;
// `
// const Text17 = styled.h2`
// position: absolute;
// width: auto;
// height: 14.97px;
// left: 167px;
// top: 4px;

// font-weight: 600;
// font-size: 16px;
// line-height: 18px;
// text-align: center;
// overflow:hidden;
// color: #FFFFFF;
// `
// const Text18 = styled.h2`
// position: absolute;
// width: auto;
// height: 14.97px;
// left: 150px;
// top: 4px;
// margin-left : -1rem;

// font-weight: 600;
// font-size: 16px;
// line-height: 18px;
// text-align: center;
// overflow:hidden;
// color: #FFFFFF;
// `
// const Text5 = styled.h2`
// color: #D7E7FF;
// margin-left:1.7rem;
// width: 39.78px;
// height: 15.92px;
// left: 817.8px;
// top: 630.55px;
// margin-top : 0.8rem;
// font-weight: bold;
// font-size: 20px;
// line-height: 22px;

// margin-bottom:5rem;
// `
// const Text6 = styled.h2`
// color: #D7E7FF;
// margin-left:1.7rem;
// width: 39.78px;
// height: 15.92px;
// left: 817.8px;
// top: 630.55px;
// margin-top : 0.8rem;
// font-weight: bold;
// font-size: 20px;
// line-height: 22px;

// margin-bottom:5rem;

// const Vector = styled.svg`
// position: absolute;
// width: 0px;
// height: 34.98px;
// left: 190px;
// top: 8px;
// border: 1px solid #EAEAEA;

// `
// const Vector2 = styled.svg`
// position: absolute;
// width: 0px;
// height: 34.98px;
// left: 190px;
// top: 8px;
// border: 1px solid #EAEAEA;

// `
const SettingHolder = styled.div`
display:flex;
  width: 20px;
  justify-content: flex-end;
  margin-left: 22rem;
  margin-top : -5rem;
`


const Vote = ()=>{
  
    const loadedUrlParams = useDefaultsFromURLSearch()
    const { t } = useTranslation()
  
    // token warning stuff
    const [loadedInputCurrency, loadedOutputCurrency] = [
      useCurrency(loadedUrlParams?.inputCurrencyId),
      useCurrency(loadedUrlParams?.outputCurrencyId)
    ]
    const [ dismissTokenWarning,setDismissTokenWarning] = useState<boolean>(false)
    const urlLoadedTokens: Token[] = useMemo(
      () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
      [loadedInputCurrency, loadedOutputCurrency]
    )
    const handleConfirmTokenWarning = useCallback(() => {
      setDismissTokenWarning(true)
    }, [])
  
    const { account, chainId } = useActiveWeb3React()
    const theme = useContext(ThemeContext)
  
    // toggle wallet when disconnected
    //const toggleWalletModal = useWalletModalToggle()
  
    // for expert mode
    const toggleSettings = useToggleSettingsMenu()
    const [isExpertMode] = useExpertModeManager()
  
    // get custom setting values for user
    const [allowedSlippage] = useUserSlippageTolerance()
  
    // swap state
    const { independentField, typedValue, recipient } = useSwapState()
    const {
      v1Trade,
      v2Trade,
      currencyBalances,
      parsedAmount,
      currencies,
      inputError: swapInputError
    } = useDerivedSwapInfo()
    const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
      currencies[Field.INPUT],
      currencies[Field.OUTPUT],
      typedValue
    )
    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
    const { address: recipientAddress } = useENS(recipient)
    const toggledVersion = useToggledVersion()
    const tradesByVersion = {
      [Version.v1]: v1Trade,
      [Version.v2]: v2Trade
    }
    const trade = showWrap ? undefined : tradesByVersion[toggledVersion]
    const defaultTrade = showWrap ? undefined : tradesByVersion[DEFAULT_VERSION]
  
    const betterTradeLinkVersion: Version | undefined = undefined
  
    const parsedAmounts = showWrap
      ? {
          [Field.INPUT]: parsedAmount,
          [Field.OUTPUT]: parsedAmount
        }
      : {
          [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
          [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
        }
  
    const { onSwitchTokens,onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
    const isValid = !swapInputError
    const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT
  
    const handleTypeInput = useCallback(
      (value: string) => {
        onUserInput(Field.INPUT, value)
      },
      [onUserInput]
    )
    const handleTypeOutput = useCallback(
      (value: string) => {
        onUserInput(Field.OUTPUT, value)
      },
      [onUserInput]
    )
  
    // modal and loading
    const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
      showConfirm: boolean
      tradeToConfirm: Trade | undefined
      attemptingTxn: boolean
      swapErrorMessage: string | undefined
      txHash: string | undefined
    }>({
      showConfirm: false,
      tradeToConfirm: undefined,
      attemptingTxn: false,
      swapErrorMessage: undefined,
      txHash: undefined
    })
  
    const formattedAmounts = {
      [independentField]: typedValue,
      [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
    }
  
    const route = trade?.route
    const userHasSpecifiedInputOutput = Boolean(
      currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
    )
    const noRoute = !route
  
    // check whether the user has approved the router on the input token
    const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)
  
    // check if user has gone through approval process, used to show two step buttons, reset on token change
    const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)
  
    // mark when a user has submitted an approval, reset onTokenSelection for input field
    useEffect(() => {
      if (approval === ApprovalState.PENDING) {
        setApprovalSubmitted(true)
      }
    }, [approval, approvalSubmitted])
  
    const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
    const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))
  
    // the callback to execute the swap
    const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)
  
    const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)
  
    const handleSwap = useCallback(() => {
      if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
        return
      }
      if (!swapCallback) {
        return
      }
      setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
      swapCallback()
        .then(hash => {
          setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })
  
          ReactGA.event({
            category: 'Swap',
            action:
              recipient === null
                ? 'Swap w/o Send'
                : (recipientAddress ?? recipient) === account
                ? 'Swap w/o Send + recipient'
                : 'Swap w/ Send',
            label: [trade?.inputAmount?.currency?.symbol, trade?.outputAmount?.currency?.symbol, Version.v2].join('/')
          })
        })
        .catch(error => {
          setSwapState({
            attemptingTxn: false,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage: error.message,
            txHash: undefined
          })
        })
    }, [tradeToConfirm, account, priceImpactWithoutFee, recipient, recipientAddress, showConfirm, swapCallback, trade])
  
    // errors
    const [showInverted, setShowInverted] = useState<boolean>(false)
  
    // warnings on slippage
    const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)
  
    // show approve flow when: no error on inputs, not approved or pending, or approved in current session
    // never show if price impact is above threshold in non expert mode
    const showApproveFlow =
      !swapInputError &&
      (approval === ApprovalState.NOT_APPROVED ||
        approval === ApprovalState.PENDING ||
        (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
      !(priceImpactSeverity > 3 && !isExpertMode)
  
    const handleConfirmDismiss = useCallback(() => {
      setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
      // if there was a tx hash, we want to clear the input
      if (txHash) {
        onUserInput(Field.INPUT, '')
      }
    }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])
  
    const handleAcceptChanges = useCallback(() => {
      setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
    }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])
  
    const handleInputSelect = useCallback(
      inputCurrency => {
        setApprovalSubmitted(false) // reset 2 step UI for approvals
        onCurrencySelection(Field.INPUT, inputCurrency)
      },
      [onCurrencySelection]
    )
  
    const handleMaxInput = useCallback(() => {
      maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
    }, [maxAmountInput, onUserInput])
  
    const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
      onCurrencySelection
    ])
  
    const isAEBToken = useIsSelectedAEBToken()
  
    const selectedTokens = useSelectedTokenList()
  
    const isTrustedToken = useCallback(
      (token: Token) => {
        if (!chainId || !selectedTokens) return true // Assume trusted at first to avoid flashing a warning
        return TRUSTED_TOKEN_ADDRESSES[chainId].includes(token.address) || isTokenOnList(selectedTokens, token)
      },
      [chainId, selectedTokens]
    )
  



  const toggleWalletModal = useWalletModalToggle()
  //const { account } = useActiveWeb3React()
  const [coins, setCoins] = useState<any[]>([])
  
  const tokenFetch = () => {
    axios
      .get(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h%2C7d'
      )
      .then(res => {
        setCoins(res.data)
        //console.log(coins);
      })
      .catch(error => console.log(error))
  }
  
  useEffect(() => {
    tokenFetch()
  }, [coins]) 


  return(
   
      <>
      <TokenWarningModal
        isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning && !urlLoadedTokens.every(isTrustedToken)}
        tokens={urlLoadedTokens}
        onConfirm={handleConfirmTokenWarning}
      />
      {isAEBToken && (
        <WarningWrapper>
          <DeprecatedWarning />
        </WarningWrapper>
      )}
      <TopBanner>
            <PeliconOpenImage src={PelicanOpenLogo} />
            <BannerTextHolder>
              <BannerTextHead>Zap</BannerTextHead>
              <BannerTextTag>
                <Link style={{ color: 'inherit', textDecoration: 'none' }} to="/">
                  Home
                </Link>
                <Span> {'>'} </Span>
                <Link style={{ color: 'inherit', textDecoration: 'none' }} to="/stake/0">
                  Pool
                </Link>
                <Span> {'>'} </Span>
                <Link style={{ color: 'inherit', textDecoration: 'none' }} to="/stake/0">
                  Zap
                </Link>
              </BannerTextTag>
            </BannerTextHolder>
            <PeliconCloseFlipImage src={PelicanCloseLogo} />
          </TopBanner>
          
          <Heading>
          Zap
          </Heading>
          <Paragraph>
           1-click convert tokens to LP tokens.
          </Paragraph>
          <Paragraph2>
          Warning: Zap can cause slippage. Small amounts only.
          </Paragraph2>
          
        {/* <Square>
        <Text1>
          Zap
        </Text1>
        <Text2>
          From token
        </Text2>
        <Text3>
          To LP (estimate not available)
        </Text3>
        <Text4>↓</Text4>
        
        </Square>
        <Box>
        <Text5>0.0</Text5>
        <Vector>

         </Vector>
        </Box>
        <Box1>
          <Text6>0.0</Text6>
          <Vector2>

          </Vector2> */}
          <BodyWrapper>
        <SwapPoolTabs active={'swap'} />
        <Wrapper id="swap-page">
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />

          <AutoColumn gap={'md'}>
            <Text1>Zap</Text1>
            <SettingHolder >
              <Settings  />
            </SettingHolder>
            <CurrencyInputPanel
              label={
                independentField === Field.OUTPUT && !showWrap && trade
                  ? t('swapPage.fromEstimated')
                  : t('votePage.from')
              }
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={!atMaxAmountInput}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              id="swap-currency-input"
            />
            <AutoColumn justify="space-between">
              <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                <ArrowWrapper clickable>
                  <ArrowDown
                    size="16"
                    onClick={() => {
                      setApprovalSubmitted(false) // reset 2 step UI for approvals
                      onSwitchTokens()
                    }}
                    color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.primary1 : theme.text2}
                  />
                </ArrowWrapper>
                {recipient === null && !showWrap && isExpertMode ? (
                  <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                    {t('swapPage.addSend')}
                  </LinkStyledButton>
                ) : null}
              </AutoRow>
            </AutoColumn>
            <CurrencyInputPanel
              value={formattedAmounts[Field.OUTPUT]}
              onUserInput={handleTypeOutput}
              label={
                independentField === Field.INPUT && !showWrap && trade ? t('swapPage.toEstimated') : t('votePage.to')
              }
              showMaxButton={false}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              id="swap-currency-output"
            />
            {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.text2} />
                  </ArrowWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    {t('swapPage.removeSend')}
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}
            {showWrap ? null : (
              <Card padding={'.25rem .75rem 0 .75rem'} borderRadius={'20px'}>
                <AutoColumn gap="4px">
                  {Boolean(trade) && (
                    <RowBetween align="center">
                      <Text fontWeight={500} fontSize={14} color={theme.text2}>
                        {t('swapPage.price')}
                      </Text>
                      <TradePrice
                        price={trade?.executionPrice}
                        showInverted={showInverted}
                        setShowInverted={setShowInverted}
                      />
                    </RowBetween>
                  )}
                  {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                    <RowBetween align="center">
                      <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                        {t('swapPage.slippageTolerance')}
                      </ClickableText>
                      <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                        {allowedSlippage / 100}%
                      </ClickableText>
                    </RowBetween>
                  )}
                </AutoColumn>
              </Card>
            )}
          </AutoColumn>
          <BottomGrouping>
            {!account ? (
              <ButtonLight onClick={toggleWalletModal}>{t('swapPage.connectWallet')}</ButtonLight>
            ) : showWrap ? (
              <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap}>
                {wrapInputError ??
                  (wrapType === WrapType.WRAP
                    ? t('swapPage.wrap')
                    : wrapType === WrapType.UNWRAP
                    ? t('swapPage.unwrap')
                    : null)}
              </ButtonPrimary>
            ) : noRoute && userHasSpecifiedInputOutput ? (
              <GreyCard style={{ textAlign: 'center' }}>
                <TYPE.main mb="4px">{t('swapPage.insufficientLiquidity')}</TYPE.main>
              </GreyCard>
            ) : showApproveFlow ? (
              <RowBetween>
                <ButtonConfirmed
                  onClick={approveCallback}
                  disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                  width="48%"
                  altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                  confirmed={approval === ApprovalState.APPROVED}
                >
                  {approval === ApprovalState.PENDING ? (
                    <AutoRow gap="6px" justify="center">
                      {t('swapPage.approving')} <Loader stroke="white" />
                    </AutoRow>
                  ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                    t('swapPage.approved')
                  ) : (
                    t('swapPage.approve') + currencies[Field.INPUT]?.symbol
                  )}
                </ButtonConfirmed>
                <ButtonError
                  onClick={() => {
                    if (isExpertMode) {
                      handleSwap()
                    } else {
                      setSwapState({
                        tradeToConfirm: trade,
                        attemptingTxn: false,
                        swapErrorMessage: undefined,
                        showConfirm: true,
                        txHash: undefined
                      })
                    }
                  }}
                  width="48%"
                  id="swap-button"
                  disabled={
                    !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                  }
                  error={isValid && priceImpactSeverity > 2}
                >
                  <Text fontSize={16} fontWeight={500}>
                    {priceImpactSeverity > 3 && !isExpertMode
                      ? t('swapPage.priceImpactHigh')
                      : t('swapPage.swap') + `${priceImpactSeverity > 2 ? t('swapPage.anyway') : ''}`}
                  </Text>
                </ButtonError>
              </RowBetween>
            ) : (
              <ButtonError
                onClick={() => {
                  if (isExpertMode) {
                    handleSwap()
                  } else {
                    setSwapState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined
                    })
                  }
                }}
                id="swap-button"
                disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
              >
                <Text fontSize={20} fontWeight={500}>
                  {swapInputError
                    ? swapInputError
                    : priceImpactSeverity > 3 && !isExpertMode
                    ? t('swapPage.priceImpactHigh')
                    : t('swapPage.swap') + `${priceImpactSeverity > 2 ? t('swapPage.anyway') : ''}`}
                </Text>
              </ButtonError>
            )}
            {showApproveFlow && (
              <Column style={{ marginTop: '1rem' }}>
                <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
              </Column>
            )}
            {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
            {betterTradeLinkVersion ? (
              <BetterTradeLink version={betterTradeLinkVersion} />
            ) : toggledVersion !== DEFAULT_VERSION && defaultTrade ? (
              <DefaultVersionLink />
            ) : null}
          </BottomGrouping>
        </Wrapper>
      </BodyWrapper>
      <AdvancedSwapDetailsDropdown trade={trade} />
        
        {/* {account ? (
              <ConnectedWalletBtn>
                <Text17>Wallet Connected</Text17>
              </ConnectedWalletBtn>
              
            ) : (
              <ConnectWalletBtn onClick={toggleWalletModal}>
                <Text18>Connect Wallet</Text18>
              </ConnectWalletBtn>
            )} */}
</>
  )
}

export default Vote;
