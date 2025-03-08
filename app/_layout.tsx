import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack  screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="nfctags/[id]" />
        <Stack.Screen name="nfctagscanlink" />
        <Stack.Screen name="callnfcweb" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </PaperProvider>
  );
};