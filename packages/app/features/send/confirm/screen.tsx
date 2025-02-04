import {
  Avatar,
  Button,
  ButtonText,
  Label,
  LinkableAvatar,
  Paragraph,
  ScrollView,
  Spinner,
  Stack,
  XStack,
  YStack,
  type ParagraphProps,
  type YStackProps,
} from '@my/ui'
import { baseMainnet } from '@my/wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { IconAccount } from 'app/components/icons'
import { IconCoin } from 'app/components/icons/IconCoin'
import { coins } from 'app/data/coins'
import { useTokenActivityFeed } from 'app/features/home/utils/useTokenActivityFeed'
import { useSendScreenParams } from 'app/routers/params'
import { assert } from 'app/utils/assert'
import { hexToBytea } from 'app/utils/hexToBytea'
import { useSendAccount } from 'app/utils/send-accounts'
import { shorten } from 'app/utils/strings'
import { throwIf } from 'app/utils/throwIf'
import { useProfileLookup } from 'app/utils/useProfileLookup'
import {
  useGenerateTransferUserOp,
  useUserOpGasEstimate,
  useUserOpTransferMutation,
} from 'app/utils/useUserOpTransferMutation'
import { useAccountNonce } from 'app/utils/userop'
import {
  isSendAccountReceiveEvent,
  isSendAccountTransfersEvent,
  type Activity,
} from 'app/utils/zod/activity'
import { useEffect, useState } from 'react'
import { useRouter } from 'solito/router'
import { isAddress, parseUnits, type Hex } from 'viem'
import { useBalance, useEstimateFeesPerGas } from 'wagmi'

export function SendConfirmScreen() {
  const [queryParams] = useSendScreenParams()
  const { recipient, idType, sendToken, amount } = queryParams
  const { data: profile, isLoading, error } = useProfileLookup(idType ?? 'tag', recipient ?? '')

  const router = useRouter()

  useEffect(() => {
    if (!profile && !recipient)
      router.replace({
        pathname: '/send',
        query: {
          idType: idType,
          recipient: recipient,
          sendToken: sendToken,
          amount: amount,
        },
      })
  }, [profile, recipient, idType, router, sendToken, amount])
  if (error) throw new Error(error.message)
  if (isLoading && !profile) return <Spinner size="large" />
  return <SendConfirm />
}

export function SendConfirm() {
  const queryClient = useQueryClient()
  const { data: sendAccount } = useSendAccount()

  const [queryParams] = useSendScreenParams()
  const { sendToken, recipient, idType } = queryParams

  const { data: profile, isLoading: isProfileLoading } = useProfileLookup(
    idType ?? 'tag',
    recipient ?? ''
  )

  const webauthnCreds =
    sendAccount?.send_account_credentials
      .filter((c) => !!c.webauthn_credentials)
      .map((c) => c.webauthn_credentials as NonNullable<typeof c.webauthn_credentials>) ?? []
  const [sentTxHash, setSentTxHash] = useState<Hex>()

  const router = useRouter()
  const { data: balance, isLoading: balanceIsLoading } = useBalance({
    address: sendAccount?.address,
    token: sendToken === 'eth' ? undefined : sendToken,
    query: { enabled: !!sendAccount },
    chainId: baseMainnet.id,
  })

  const amount = parseUnits((queryParams.amount ?? '0').toString(), balance?.decimals ?? 0)
  const {
    data: nonce,
    error: nonceError,
    isLoading: nonceIsLoading,
  } = useAccountNonce({
    sender: sendAccount?.address,
  })
  const { data: userOp } = useGenerateTransferUserOp({
    sender: sendAccount?.address,
    // @ts-expect-error some work to do here
    to: profile?.address ?? recipient,
    token: sendToken === 'eth' ? undefined : sendToken,
    amount: BigInt(amount),
    nonce: nonce ?? 0n,
  })

  const { data: gasEstimate } = useUserOpGasEstimate({ userOp })
  const {
    data: feesPerGas,
    isLoading: isFeesPerGasLoading,
    error: feesPerGasError,
  } = useEstimateFeesPerGas({ chainId: baseMainnet.id })
  const {
    mutateAsync: sendUserOp,
    isPending: isTransferPending,
    isError: isTransferError,
  } = useUserOpTransferMutation()
  const [error, setError] = useState<Error>()

  const {
    data: transfers,
    error: tokenActivityError,
    dataUpdatedAt,
  } = useTokenActivityFeed({
    address: sendToken === 'eth' ? undefined : hexToBytea(sendToken),
    refetchInterval: sentTxHash ? 1000 : undefined, // refetch every second if we have sent a tx
    enabled: !!sentTxHash,
  })
  const [dataFirstFetch, setDataFirstFetch] = useState<number>()

  const canSubmit =
    !nonceIsLoading &&
    !isFeesPerGasLoading &&
    Number(queryParams.amount) > 0 &&
    coins.some((coin) => coin.token === sendToken) &&
    (balance?.value ?? BigInt(0) >= amount) &&
    !sentTxHash

  async function onSubmit() {
    try {
      assert(!!userOp, 'User op is required')
      assert(!!balance, 'Balance is not available')
      assert(nonceError === null, `Failed to get nonce: ${nonceError}`)
      assert(nonce !== undefined, 'Nonce is not available')
      throwIf(feesPerGasError)
      assert(!!feesPerGas, 'Fees per gas is not available')

      assert(balance.value >= amount, 'Insufficient balance')
      const sender = sendAccount?.address as `0x${string}`
      assert(isAddress(sender), 'No sender address')
      const _userOp = {
        ...userOp,
        maxFeePerGas: feesPerGas.maxFeePerGas,
        maxPriorityFeePerGas: feesPerGas.maxPriorityFeePerGas,
      }

      console.log('gasEstimate', gasEstimate)
      console.log('feesPerGas', feesPerGas)
      console.log('userOp', _userOp)
      const receipt = await sendUserOp({
        userOp: _userOp,
        webauthnCreds,
      })
      assert(receipt.success, 'Failed to send user op')
      setSentTxHash(receipt.receipt.transactionHash)
    } catch (e) {
      console.error(e)
      setError(e)
      await queryClient.invalidateQueries({ queryKey: [useAccountNonce.queryKey] })
    }
  }

  useEffect(() => {
    if (!dataFirstFetch && dataUpdatedAt) {
      setDataFirstFetch(dataUpdatedAt)
    }
    if (!dataFirstFetch) return
    if (!dataUpdatedAt) return
    const hasBeenLongEnough = dataUpdatedAt - dataFirstFetch > 5_000
    if (sentTxHash) {
      const tfr = transfers?.pages.some((page) =>
        page.some((activity: Activity) => {
          if (isSendAccountTransfersEvent(activity)) {
            return activity.data.tx_hash === sentTxHash
          }
          if (isSendAccountReceiveEvent(activity)) {
            return activity.data.tx_hash === sentTxHash
          }
          return false
        })
      )

      if (tokenActivityError) {
        console.error(tokenActivityError)
      }
      // found the transfer or we waited 5 seconds or we got an error 😢
      if (tfr || tokenActivityError || hasBeenLongEnough) {
        router.replace({ pathname: '/', query: { token: sendToken } })
      }
    }
  }, [sentTxHash, transfers, router, sendToken, tokenActivityError, dataFirstFetch, dataUpdatedAt])

  if (balanceIsLoading || nonceIsLoading || isProfileLoading)
    return <Spinner size="large" color={'$color'} />

  return (
    <YStack
      $gtLg={{ jc: 'flex-start', ai: 'flex-start' }}
      flexDirection="column"
      jc="center"
      ai="center"
      f={1}
      pb="$5"
    >
      <YStack
        gap="$6"
        width="100%"
        f={1}
        maw={784}
        $sm={{
          jc: 'space-between',
        }}
      >
        <Stack $gtLg={{ fd: 'row', gap: '$12', miw: 80 }} w="100%" gap="$5">
          <SendRecipient $gtLg={{ f: 1, maw: 350 }} />

          <YStack gap="$2.5" f={1} $gtLg={{ maw: 350 }} jc="space-between">
            <XStack jc="space-between" ai="center" gap="$3">
              <Label
                fontWeight="500"
                fontSize="$5"
                textTransform="uppercase"
                $theme-dark={{ col: '$gray8Light' }}
              >
                AMOUNT
              </Label>
              <Button
                bc="transparent"
                chromeless
                hoverStyle={{ bc: 'transparent' }}
                pressStyle={{ bc: 'transparent' }}
                focusStyle={{ bc: 'transparent' }}
                onPress={() =>
                  router.push({
                    pathname: '/send',
                    query: {
                      recipient,
                      idType,
                      sendToken: queryParams.sendToken,
                      amount: queryParams.amount,
                    },
                  })
                }
              >
                <ButtonText $theme-dark={{ col: '$primary' }}>edit</ButtonText>
              </Button>
            </XStack>
            <XStack
              ai="center"
              gap="$3"
              bc="$metalTouch"
              p="$3"
              br="$3"
              $theme-light={{ bc: '$gray3Light' }}
              f={1}
            >
              <Paragraph fontSize="$9" fontWeight="600" color="$color12">
                {queryParams.amount}
              </Paragraph>
              {(() => {
                const coin = coins.find((coin) => coin.token === queryParams.sendToken)
                if (coin) {
                  return <IconCoin coin={coin} />
                }
                return null
              })()}
            </XStack>
          </YStack>
        </Stack>
        {/*  TODO add this back when backend is ready
        <YStack gap="$5" f={1}>
          <Label
            fontWeight="500"
            fontSize={'$5'}
            textTransform="uppercase"
            $theme-dark={{ col: '$gray8Light' }}
          >
            ADD A NOTE
          </Label>
          <Input
            placeholder="(Optional)"
            placeholderTextColor="$color12"
            value={note}
            onChangeText={(text) => setParams({ note: text }, { webBehavior: 'replace' })}
            fontSize={20}
            fontWeight="400"
            lineHeight={1}
            color="$color12"
            borderColor="transparent"
            outlineColor="transparent"
            $theme-light={{ bc: '$gray3Light' }}
            br={'$3'}
            bc="$metalTouch"
            hoverStyle={{
              borderColor: 'transparent',
              outlineColor: 'transparent',
            }}
            focusStyle={{
              borderColor: 'transparent',
              outlineColor: 'transparent',
            }}
            fontFamily="$mono"
          />
        </YStack> */}
        <Button
          theme="green"
          onPress={onSubmit}
          br={12}
          disabledStyle={{ opacity: 0.5 }}
          disabled={!canSubmit}
          gap={4}
          mx="auto"
          $gtXs={{
            maw: 350,
          }}
          $gtLg={{
            mr: '0',
            ml: 'auto',
          }}
          width={'100%'}
        >
          {(() => {
            switch (true) {
              case isTransferPending && !isTransferError:
                return (
                  <>
                    <Button.Icon>
                      <Spinner size="small" color="$color" />
                    </Button.Icon>
                    <Button.Text>Sending...</Button.Text>
                  </>
                )
              case sentTxHash !== undefined:
                return (
                  <>
                    <Button.Icon>
                      <Spinner size="small" color="$color" />
                    </Button.Icon>
                    <Button.Text>Confirming...</Button.Text>
                  </>
                )
              default:
                return <Button.Text>/SEND</Button.Text>
            }
          })()}
        </Button>
        {error && (
          <ErrorMessage
            mx="auto"
            $gtXs={{
              maw: 350,
            }}
            $gtLg={{
              mr: '0',
              ml: 'auto',
            }}
            error={(error as { details?: string }).details ?? error.message ?? 'Error sending'}
          />
        )}
      </YStack>
    </YStack>
  )
}

export function SendRecipient({ ...props }: YStackProps) {
  const [queryParams] = useSendScreenParams()
  const { recipient, idType } = queryParams
  const router = useRouter()
  const { data: profile, isLoading, error } = useProfileLookup(idType ?? 'tag', recipient ?? '')

  if (isLoading) return <Spinner size="large" />
  if (error) throw new Error(error.message)

  const href =
    idType === 'address'
      ? `${baseMainnet.blockExplorers.default.url}/address/${recipient}`
      : `/profile/${recipient}`

  return (
    <YStack gap="$2.5" {...props}>
      <XStack jc="space-between" ai="center" gap="$3">
        <Label
          fontWeight="500"
          fontSize={'$5'}
          textTransform="uppercase"
          $theme-dark={{ col: '$gray8Light' }}
        >
          TO
        </Label>
        <Button
          bc="transparent"
          chromeless
          hoverStyle={{ bc: 'transparent' }}
          pressStyle={{ bc: 'transparent' }}
          focusStyle={{ bc: 'transparent' }}
          onPress={() =>
            router.push({
              pathname: '/send',
              query: { sendToken: queryParams.sendToken, amount: queryParams.amount },
            })
          }
        >
          <ButtonText $theme-dark={{ col: '$primary' }}>edit</ButtonText>
        </Button>
      </XStack>
      <XStack
        ai="center"
        gap="$3"
        bc="$metalTouch"
        p="$2"
        br="$3"
        $theme-light={{ bc: '$gray3Light' }}
        f={1}
      >
        <LinkableAvatar size="$4.5" br="$3" href={href}>
          <Avatar.Image src={profile?.avatar_url ?? ''} />
          <Avatar.Fallback jc="center">
            <IconAccount size="$4.5" color="$olive" />
          </Avatar.Fallback>
        </LinkableAvatar>
        <YStack gap="$1.5">
          <Paragraph fontSize="$4" fontWeight="500" color="$color12">
            {profile?.name}
          </Paragraph>
          <Paragraph
            fontFamily="$mono"
            fontSize="$4"
            fontWeight="400"
            lineHeight="$1"
            color="$color11"
          >
            {(() => {
              switch (true) {
                case idType === 'address':
                  return shorten(recipient, 6, 6)
                case !!profile?.tag:
                  return `/${profile?.tag}`
                default:
                  return `#${profile?.sendid}`
              }
            })()}
          </Paragraph>
        </YStack>
      </XStack>
    </YStack>
  )
}

function ErrorMessage({ error, ...props }: ParagraphProps & { error?: string }) {
  if (!error) return null

  return (
    <ScrollView height="$4">
      <Paragraph
        testID="SendConfirmError"
        size="$2"
        maw="$20"
        width="100%"
        col={'$error'}
        {...props}
      >
        {error.split('.').at(0)}
      </Paragraph>
    </ScrollView>
  )
}
