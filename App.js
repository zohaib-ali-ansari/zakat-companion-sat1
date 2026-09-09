import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import TrackingScreen from './src/screens/TrackingScreen';
import AddPaymentScreen from './src/screens/AddPaymentScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import HistoryYearDetailScreen from './src/screens/HistoryYearDetailScreen';
import HistoryRecordsScreen from './src/screens/HistoryRecordsScreen';

export default function App() {
  const [route, setRoute] = useState({ name: 'Track', params: {} });
  const navigation = {
    navigate: (name, params = {}) => setRoute({ name, params }),
  };

  return (
    <>
      {route.name === 'AddPaymentScreen' ? (
        <AddPaymentScreen navigation={navigation} />
      ) : route.name === 'History' ? (
        <HistoryScreen navigation={navigation} />
      ) : route.name === 'HistoryYearDetail' ? (
        <HistoryYearDetailScreen navigation={navigation} route={route} />
      ) : route.name === 'HistoryRecords' ? (
        <HistoryRecordsScreen navigation={navigation} />
      ) : (
        <TrackingScreen navigation={navigation} />
      )}
      <StatusBar style="dark" />
    </>
  );
}
