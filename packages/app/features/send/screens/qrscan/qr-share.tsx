import {
  Button,
  SizableText,
  XStack,
  YStack,
} from "@my/ui"
import { Link } from '@my/ui/src/components'
import { IQRScreenProps } from "app/features/send/types"
import { IconArrowLeft, IconCopy } from "app/components/icons"
import { useTransferContext } from 'app/features/send/providers/transfer-provider'

export const QRShareScreen = ({ setCurrentScreen }: IQRScreenProps) => {
  const { transferState } = useTransferContext()

  const { sendTo } = transferState

  const share_link = `send.app/${sendTo?.name.toLowerCase()}`

  return (
    <YStack
      gap={'$5'}
      px={'$5'}
      pt={'$size.8'}
      pb={'$7'}
      fullscreen
      $shorter={{
        pt: '$8',
        pb: '$6'
      }}
    >
      <YStack ai={'center'} gap={'$3.5'}>
        <SizableText
          fontSize={'$9'}
          fontWeight={'700'}
          $shorter={{ fontSize: '$8' }}
        >
          {sendTo?.name}
        </SizableText>
        <SizableText
          fontSize={'$6'}
          color={'$primary'}
          $shorter={{ fontSize: '$8' }}
        >
          @{sendTo?.name.toLowerCase()}
        </SizableText>
      </YStack>

      <YStack jc={'center'} fg={1}>
        <YStack ai={'center'}>
          <XStack
            width={330}
            height={330}
            backgroundColor={'$primary'}
            mb={'$6'}
          />
          <SizableText theme={'alt1'}>Share this payment link with others</SizableText>
          <XStack ai={'center'} gap="$3">
            <SizableText color={'$primary'} fontWeight={'700'}>{share_link}</SizableText>
            <IconCopy />
          </XStack>
        </YStack>
      </YStack>
      <Button
        pos={'absolute'}
        top={'$size.8'}
        left={'$5'}
        size="$2.5"
        circular
        bg={'$backgroundTransparent'}
        ai={'center'}
        $shorter={{ top: '$size.4' }}
        onPress={() => setCurrentScreen(['qr-scan', -1])}
      >
        <IconArrowLeft />
      </Button>
    </YStack>
  )
}