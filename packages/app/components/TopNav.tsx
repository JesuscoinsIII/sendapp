// TopNav.tsx
import {
  H2,
  Header,
  Paragraph,
  XStack,
  Stack,
  useMedia,
  Button as ButtonOg,
  Container,
  Separator,
  useToastController,
  type ButtonProps,
  ButtonText,
  View,
} from '@my/ui'
import { useRootScreenParams } from 'app/routers/params'
import { useThemeSetting } from '@tamagui/next-theme'
import { IconArrowLeft, IconGear, IconHamburger, IconQr, IconSendLogo } from 'app/components/icons'
import { usePathname } from 'app/utils/usePathname'
import { useRouter } from 'solito/router'

import { SettingsBottomSheet } from 'app/features/account/settings/SettingsBottomSheet'
import { TokenDetailsMarketData } from 'app/features/home/TokenDetails'
import { useCoinFromTokenParam } from '../utils/useCoinFromTokenParam'
import { ReferralLink } from './ReferralLink'
import { usePwa } from 'app/utils/usePwa'
import { IconCoin } from './icons/IconCoin'
import { Link } from 'solito/link'

export enum ButtonOption {
  QR = 'QR',
  SETTINGS = 'SETTINGS',
  REFERRAL = 'REFERRAL',
}

interface TopNavProps {
  header?: string
  subheader?: string
  showLogo?: boolean
  showReferral?: boolean
  /**
   * Customize the button on the right side of the top nav.
   * @default ButtonOption.QR
   */
  button?: ButtonOption
  /**
   * Hide the subroute button
   * @default false
   */
  noSubroute?: boolean
}

export function TopNav({
  header = '',
  subheader,
  showLogo = false,
  showReferral = false,
  button,
  noSubroute = false,
}: TopNavProps) {
  const [queryParams, setRootParams] = useRootScreenParams()
  const path = usePathname()
  const parts = path.split('/').filter(Boolean)
  const { push } = useRouter()
  const media = useMedia()
  const toast = useToastController()
  const selectedCoin = useCoinFromTokenParam()
  const isPwa = usePwa()

  const handleHomeBottomSheet = () => {
    setRootParams(
      { ...queryParams, nav: queryParams.nav ? undefined : 'home' },
      { webBehavior: 'replace' }
    )
  }

  const handleSettingsBottomSheet = () => {
    setRootParams(
      { ...queryParams, nav: queryParams.nav ? undefined : 'settings' },
      { webBehavior: 'replace' }
    )
  }

  const hasSelectedCoin = selectedCoin !== undefined

  const handleBack = () => {
    // always pop to the base path. e.g. /account/settings/edit-profile -> /account
    if (hasSelectedCoin) {
      setRootParams({ ...queryParams, token: undefined })
    }
    const newPath = parts.slice(0, 1).join('/')
    push(`/${newPath}`)
  }

  const { resolvedTheme } = useThemeSetting()
  const iconColor = resolvedTheme?.startsWith('dark') ? '$primary' : '$black'

  const isSubRoute = !noSubroute && parts.length > 1

  const renderButton = () => {
    switch (true) {
      case button === undefined:
        return <Button opacity={0} disabled $gtMd={{ display: 'none' }} />
      case selectedCoin !== undefined:
        return (
          <ButtonOg
            disabled
            $gtLg={{ display: 'none' }}
            icon={<IconCoin coin={selectedCoin} />}
            bc="transparent"
            chromeless
            jc={'flex-end'}
            ai={'center'}
            gap="$2"
          >
            <ButtonText
              size={'$9'}
              fontFamily={'$mono'}
              col={'$color12'}
              textTransform="uppercase"
              fontWeight={'700'}
            >
              {selectedCoin.label}
            </ButtonText>
          </ButtonOg>
        )
      case button === ButtonOption.QR:
        return (
          <Button
            $gtLg={{ display: 'none' }}
            icon={<IconQr size={'$2.5'} color={iconColor} />}
            onPress={() => toast.show('Coming Soon')}
          />
        )
      case button === ButtonOption.SETTINGS:
        return (
          <Button
            $gtLg={{ display: 'none' }}
            icon={<IconGear size={'$2.5'} color={iconColor} />}
            onPress={handleSettingsBottomSheet}
          />
        )
      default:
        if (__DEV__) throw new Error(`Unknown button option: ${button}`)
        return null
    }
  }

  return (
    <Header w="100%">
      <Container
        $gtLg={{ jc: 'flex-start', pb: '$2', ai: 'flex-start' }}
        ai="center"
        jc="space-between"
        $lg={{ pt: isPwa ? '$0' : '$5', pb: '$5' }}
      >
        <Stack display={isSubRoute || media.lg ? 'flex' : 'none'} jc="center" $gtLg={{ fd: 'row' }}>
          {isSubRoute || hasSelectedCoin ? (
            <Button onPress={handleBack} icon={<IconArrowLeft size={'$2.5'} color={iconColor} />} />
          ) : (
            <Button
              $gtLg={{ disabled: true, opacity: 0 }} // We need the button to be there for layout purposes
              onPress={handleHomeBottomSheet}
              icon={<IconHamburger size={'$2.5'} color={iconColor} />}
            />
          )}
        </Stack>
        {showLogo && media.lg ? (
          <XStack>
            <Link href="/send">
              <IconSendLogo
                size={'$2.5'}
                color={'$color12'}
                display={selectedCoin && !media.gtLg ? 'none' : 'flex'}
              />
            </Link>
          </XStack>
        ) : (
          <H2
            fontWeight={'300'}
            col="$color10"
            lineHeight={32}
            $gtLg={{ ml: isSubRoute ? '$4' : '$0' }}
            display={selectedCoin && !media.gtLg ? 'none' : 'flex'}
            als={'center'}
          >
            {header}
          </H2>
        )}
        {showReferral && media.gtLg && (
          <XStack jc={'center'} ai={'center'} ml="auto">
            <Paragraph>Referral Link</Paragraph> <ReferralLink />
          </XStack>
        )}
        <XStack>{renderButton()}</XStack>
      </Container>
      {subheader && (
        <Container fd="column">
          <Paragraph
            fontWeight={'400'}
            fontSize={'$5'}
            fontFamily={'$mono'}
            lineHeight={24}
            py="$3"
            $gtSm={{ py: '$6' }}
            $gtLg={{ pl: '$1', pb: '$6', pt: '$0', ...{ ml: isSubRoute ? '$10' : '$1' } }}
            col="$color10"
          >
            {subheader}
          </Paragraph>
          <Separator w={'100%'} borderColor="$jet" $lg={{ display: 'none' }} />
        </Container>
      )}
      <Separator w={'100%'} borderColor="$decay" $gtLg={{ display: 'none' }} />
      {!media.gtLg && selectedCoin && selectedCoin.label !== 'USDC' && (
        <Container pos="relative">
          <View
            position="absolute"
            $lg={{ right: '$6' }}
            $md={{ right: 0 }}
            right={0}
            bottom={0}
            top={0}
            justifyContent="center"
          >
            <View bw={1} br={'$2'} boc="$decay" py={'$1.5'} px={'$2'} miw="$18" bc="$background">
              <TokenDetailsMarketData coin={selectedCoin} />
            </View>
          </View>
        </Container>
      )}
      <SettingsBottomSheet />
    </Header>
  )
}

function Button(props: ButtonProps) {
  return (
    <ButtonOg
      bc="transparent"
      chromeless
      circular
      jc={'center'}
      ai={'center'}
      hoverStyle={{
        backgroundColor: 'transparent',
        borderColor: '$background',
      }}
      pressStyle={{
        backgroundColor: 'transparent',
      }}
      focusStyle={{
        backgroundColor: 'transparent',
      }}
      theme="green"
      {...props}
    />
  )
}
