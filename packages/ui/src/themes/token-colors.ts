import { Variable } from '@tamagui/web'
import {
  blue,
  blueDark,
  gray,
  grayDark,
  green,
  greenDark,
  orange,
  orangeDark,
  pink,
  pinkDark,
  purple,
  purpleDark,
  red,
  redDark,
  yellow,
  yellowDark,
  gold,
  goldDark,
  brandColors,
} from './colors'

export {
  darkColor,
  darkPalette,
  darkTransparent,
  lightColor,
  lightPalette,
  lightTransparent,
} from './colors'

export const colorTokens = {
  light: {
    blue: blue,
    gray: gray,
    green: green,
    orange: orange,
    pink: pink,
    purple: purple,
    red: red,
    yellow: yellow,
    gold: gold,
  },
  dark: {
    blue: blueDark,
    gray: grayDark,
    green: greenDark,
    orange: orangeDark,
    pink: pinkDark,
    purple: purpleDark,
    red: redDark,
    yellow: yellowDark,
    gold: goldDark,
  },
}

export const darkColors = {
  ...colorTokens.dark.blue,
  ...colorTokens.dark.gray,
  ...colorTokens.dark.green,
  ...colorTokens.dark.orange,
  ...colorTokens.dark.pink,
  ...colorTokens.dark.purple,
  ...colorTokens.dark.red,
  ...colorTokens.dark.yellow,
  ...colorTokens.dark.gold,
}

export const lightColors = {
  ...colorTokens.light.blue,
  ...colorTokens.light.gray,
  ...colorTokens.light.green,
  ...colorTokens.light.orange,
  ...colorTokens.light.pink,
  ...colorTokens.light.purple,
  ...colorTokens.light.red,
  ...colorTokens.light.yellow,
  ...colorTokens.light.gold,
}

export const color = {
  ...postfixObjKeys(lightColors, 'Light'),
  ...postfixObjKeys(darkColors, 'Dark'),
  ...brandColors,
}

function postfixObjKeys<A extends { [key: string]: Variable<string> | string }, B extends string>(
  obj: A,
  postfix: B
): {
    [Key in `${keyof A extends string ? keyof A : never}${B}`]: Variable<string> | string
  } {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [`${k}${postfix}`, v])) as never
}
