import { StyleSheet } from 'react-native'

import { View } from '@/components/Themed'
import { Text } from '@/components/StyledText'

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Text textStyle='Title1' colorStyle='Primary'>Instrucciones SQL</Text>
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