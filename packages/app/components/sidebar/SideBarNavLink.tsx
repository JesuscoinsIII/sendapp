import { Button, ButtonIcon, ButtonText, Link, type LinkProps } from '@my/ui'
import { usePathname } from 'app/utils/usePathname'
import { type ReactElement } from 'react'

export function SideBarNavLink({
  icon,
  text,
  ...props
}: { icon?: ReactElement; text: string } & Omit<LinkProps, 'children'>): ReactElement {
  const location = usePathname()
  const isActiveRoute = location === props.href

  return (
    <Link {...props} href={props.disabled ? '' : props.href}>
      <Button
        disabled={props.disabled}
        color={isActiveRoute ? '$white' : '$gold10'}
        bg={isActiveRoute ? '$gold7' : 'transparent'}
        hoverStyle={{ scale: '105%' }}
        fontSize={'$4'}
        fontFamily={'$heading'}
      >
        <ButtonIcon>{icon}</ButtonIcon>
        <ButtonText fontWeight={isActiveRoute ? 'bold' : 'normal'}>{text}</ButtonText>
      </Button>
    </Link>
  )
}
