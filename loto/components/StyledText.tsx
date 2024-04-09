import { ReactNode } from 'react'
import { Text as DefaultText } from 'react-native'

import Colors from '@/constants/Colors'
import { useColorScheme } from '@/components/useColorScheme'

const colorScheme = useColorScheme()

type TextStyle = { 
  [key in 'XLTitle1' | 'XLTitle2' | 'LargeTitle' | 'Title1' | 'Title2' | 'Title3' | 'Headline' | 'Body' | 'Callout' | 'Subheadline' | 'Footnote' | 'Caption1' | 'Caption2']: { fontSize: number, fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' } 
}

const fontWeightBold = '700'
const fontWeightMedium = '500'
const fontWeightRegular = '400'

const textStyles: TextStyle = {
  'XLTitle1': { fontSize: 48, fontWeight: fontWeightBold },
  'XLTitle2': { fontSize: 38, fontWeight: fontWeightBold },
  'LargeTitle': { fontSize: 29, fontWeight: fontWeightBold },
  'Title1': { fontSize: 24, fontWeight: fontWeightBold },
  'Title2': { fontSize: 22, fontWeight: fontWeightBold },
  'Title3': { fontSize: 19, fontWeight: fontWeightBold },
  'Headline': { fontSize: 17, fontWeight: fontWeightBold },
  'Body': { fontSize: 17, fontWeight: fontWeightMedium },
  'Callout': { fontSize: 15, fontWeight: fontWeightMedium },
  'Subheadline': { fontSize: 15, fontWeight: fontWeightBold },
  'Footnote': { fontSize: 13, fontWeight: fontWeightRegular },
  'Caption1': { fontSize: 12, fontWeight: fontWeightMedium },
  'Caption2': { fontSize: 12, fontWeight: fontWeightMedium },
}

type ColorStyle = {
  [key in 'Primary' | 'Secondary' | 'Tertiary']: string
}

const colorStyles: ColorStyle = {
  'Primary': Colors[colorScheme ?? 'light'].textPrimary,
  'Secondary': Colors[colorScheme ?? 'light'].textSecondary,
  'Tertiary': Colors[colorScheme ?? 'light'].textTertiary,
}

interface TextProps {
  textStyle: keyof TextStyle
  colorStyle: keyof ColorStyle
  children: ReactNode
}

export function Text({ textStyle, colorStyle, children }: TextProps) {
  const { fontSize, fontWeight } = textStyles[textStyle]
  const color = colorStyles[colorStyle]

  return <DefaultText style={{ fontSize, fontWeight, color, fontFamily: 'SFPro' }}>{children}</DefaultText>
}