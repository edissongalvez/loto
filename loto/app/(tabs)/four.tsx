import { StyleSheet } from 'react-native'

import { View } from '@/components/Themed'
import { Text } from '@/components/StyledText'

export default function TabFourScreen() {
  return (
    <View style={styles.container}>
      <Text textStyle='Title1' colorStyle='Primary'>Integridad de tablas</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
})