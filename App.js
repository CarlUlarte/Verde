import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import FontProvider from "./app/components/FontProvider";
import AuthStack from "./app/components/AuthStack";
import MainStack from "./app/components/MainStack";
import { registerDailyNotificationTask } from "./app/components/NotificationService";

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    registerDailyNotificationTask();
  }, []);

  return (
    <FontProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthStack} />
          <Stack.Screen name="Main" component={MainStack} />
        </Stack.Navigator>
      </NavigationContainer>
    </FontProvider>
  );
}
