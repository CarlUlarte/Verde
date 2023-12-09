import React from 'react';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';

const FontProvider = ({ children }) => {
  const [loaded] = useFonts({
    'FiraSansRegular': require('../assets/fonts/FiraSans-Regular.ttf'),
    'FiraSansMedium': require('../assets/fonts/FiraSans-Medium.ttf'),
    'FiraSansBold': require('../assets/fonts/FiraSans-Bold.ttf'),
    'FiraSansLight': require('../assets/fonts/FiraSans-Light.ttf'),
    'FiraSansThin': require('../assets/fonts/FiraSans-Thin.ttf'),
    'PoppinsRegular': require('../assets/fonts/Poppins-Regular.ttf'),
    'PoppinsMedium': require('../assets/fonts/Poppins-Medium.ttf'),
    'PoppinsLight': require('../assets/fonts/Poppins-Light.ttf'),
    'PoppinsThin': require('../assets/fonts/Poppins-Thin.ttf'),
    'PoppinsBold': require('../assets/fonts/Poppins-Bold.ttf'),
    'FiraCodeRegular': require("../assets/fonts/FiraCode-Regular.ttf"),
    'FiraCodeBold': require("../assets/fonts/FiraCode-Bold.ttf"),
    'FiraCodeLight': require("../assets/fonts/FiraCode-Light.ttf"),
  });

  if (!loaded) {
    console.log('Fonts not loaded!');
    return null;
  }

  return (
    <PaperProvider
      theme={{
        ...DefaultTheme,
        fonts: {
          firaegular: { fontFamily: 'FiraSans-Regular', fontWeight: 'normal' },
          firamedium: { fontFamily: 'FiraSans-Medium', fontWeight: 'normal' },
          firabold: { fontFamily: 'FiraSans-Bold', fontWeight: 'normal' },
          firalight: { fontFamily: 'FiraSans-Light', fontWeight: 'normal' },
          firathin: { fontFamily: 'FiraSans-Thin', fontWeight: 'normal' },
          poppinsRegular: { fontFamily: 'Poppins-Regular', fontWeight: 'normal' },
          poppinsMedium: { fontFamily: 'Poppins-Medium', fontWeight: 'normal' },
          poppinsLight: { fontFamily: 'Poppins-Light', fontWeight: 'normal' },
          poppinsThin: { fontFamily: 'Poppins-Thin', fontWeight: 'normal' },
          poppinsBold: { fontFamily: 'Poppins-Bold', fontWeight: 'normal' },
          firacoderegular: { fontFamily: 'FiraCode-Regular', fontWeight: 'normal' },
          firacodelight: { fontFamily: 'FiraCode-Light', fontWeight: 'normal' },
          firacodebold: { fontFamily: 'FiraCode-Bold', fontWeight: 'normal' },
        },
      }}
    >
      {children}
    </PaperProvider>
  );
};

export default FontProvider;
