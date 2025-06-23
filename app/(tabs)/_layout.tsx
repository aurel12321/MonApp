// app/_layout.js
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { datasAddEventScreen } from './AddEventScreen/MyContext';

export default function RootLayout() {
  const [allDatas, setAllDatas] = useState({});

  return (
    <datasAddEventScreen.Provider value={{ allDatas, setAllDatas }}>
    <Stack
      screenOptions={{
        headerShown: false, // Cela supprime le bandeau (header) en haut de tous les écrans
      }}
    />
  </datasAddEventScreen.Provider>
  );
}