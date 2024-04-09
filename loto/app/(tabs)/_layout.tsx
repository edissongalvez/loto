import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Link, Tabs } from 'expo-router'
import { Pressable } from 'react-native'

import Colors from '@/constants/Colors'
import { useColorScheme } from '@/components/useColorScheme'
import { useClientOnlyValue } from '@/components/useClientOnlyValue'

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name']
  color: string
}) {
  return <MaterialCommunityIcons size={28} style={{ marginBottom: -3 }} {...props} />
}

export default function TabLayout() {
  const colorScheme = useColorScheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Base de datos',
          tabBarIcon: ({ color }) => <TabBarIcon name="database" color={color} />,
          headerRight: () => (
            <Link href="/database" asChild>
              <Pressable>
                {({ pressed }) => (
                  <MaterialCommunityIcons
                    name="database-outline"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].tint}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Registros secuenciales',
          tabBarIcon: ({ color }) => <TabBarIcon name="view-sequential" color={color} />,
        }}
      />
      <Tabs.Screen
        name="three"
        options={{
          title: 'Integridad de campos',
          tabBarIcon: ({ color }) => <TabBarIcon name="focus-field" color={color} />,
        }}
      />
      <Tabs.Screen
        name="four"
        options={{
          title: 'Integridad de tablas',
          tabBarIcon: ({ color }) => <TabBarIcon name="table" color={color} />,
        }}
      />
      <Tabs.Screen
        name="five"
        options={{
          title: 'Más excepciones',
          tabBarIcon: ({ color }) => <TabBarIcon name="database-eye" color={color} />,
        }}
      />
      <Tabs.Screen
        name="six"
        options={{
          title: 'Instrucciones SQL',
          tabBarIcon: ({ color }) => <TabBarIcon name="script" color={color} />,
        }}
      />
    </Tabs>
  )
}
