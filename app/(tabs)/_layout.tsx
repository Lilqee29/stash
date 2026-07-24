import React from 'react';
import { Tabs } from 'expo-router';
import AddAnythingModal from '../../components/modals/AddAnythingModal';
import SearchModal from '../../components/modals/SearchModal';

export default function TabsLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      />
      <AddAnythingModal />
      <SearchModal />
    </>
  );
}
