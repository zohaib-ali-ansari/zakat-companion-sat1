import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { zakatRates, initialMockAssets } from './mockData';

export default function ZakatCalculator({ onLogout }) {
  const [assets, setAssets] = useState(initialMockAssets);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const categories = ['Cash', 'Gold', 'Silver', 'Bank balance', 'Stocks', 'Cryptocurrency', 'Business assets', 'Other'];

  const handleAddAsset = () => {
    if (inputValue && !isNaN(inputValue)) {
      const newAsset = {
        id: Date.now().toString(),
        category: selectedCategory,
        name: selectedCategory,
        value: parseFloat(inputValue)
      };
      setAssets([...assets, newAsset]);
      setSelectedCategory(null);
      setInputValue('');
    }
  };

  const handleRemoveAsset = (id) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const totalAssetsValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const isEligible = totalAssetsValue >= zakatRates.nisabThreshold;
  const zakatPayable = isEligible ? (totalAssetsValue * 0.025) : 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Zakat Calculator</Text>
        <TouchableOpacity onPress={onLogout}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>
      </View>
      
      <View style={styles.ratesCard}>
        <Text style={styles.ratesTitle}>Current Rates (Mock Data)</Text>
        <Text>Nisab Threshold (Silver): Rs {zakatRates.nisabThreshold.toLocaleString()}</Text>
        <Text>Gold Rate: Rs {zakatRates.goldRatePerTola.toLocaleString()} / tola</Text>
      </View>

      <Text style={styles.subHeader}>1. Add Assets</Text>
      <View style={styles.grid}>
        {categories.map((cat, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.gridItem, selectedCategory === cat && styles.gridItemActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.gridText, selectedCategory === cat && styles.gridTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedCategory && (
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Enter value for {selectedCategory} (PKR):</Text>
          <View style={styles.inputRow}>
            <TextInput 
              style={styles.textInput} 
              keyboardType="numeric" 
              placeholder="e.g. 50000" 
              value={inputValue} 
              onChangeText={setInputValue} 
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddAsset}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={styles.subHeader}>2. Your Assets</Text>
      {assets.length === 0 ? <Text style={styles.emptyText}>No assets added yet.</Text> : null}
      {assets.map((asset) => (
        <View key={asset.id} style={styles.assetRow}>
          <Text style={styles.assetName}>{asset.category}</Text>
          <Text style={styles.assetValue}>Rs {asset.value.toLocaleString()}</Text>
          <TouchableOpacity onPress={() => handleRemoveAsset(asset.id)}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.subHeader}>3. Calculation Summary</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Total Assets: Rs {totalAssetsValue.toLocaleString()}</Text>
        <Text style={styles.summaryText}>Eligible for Zakat: {isEligible ? 'Yes' : 'No'}</Text>
        <View style={styles.divider} />
        <Text style={styles.resultText}>Zakat Payable: Rs {zakatPayable.toLocaleString()}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: '#f8f9fa', paddingBottom: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#005b9f' },
  logoutText: { color: 'red', fontWeight: 'bold' },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#333' },
  ratesCard: { backgroundColor: '#e2f0fb', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#b6d4fe' },
  ratesTitle: { fontWeight: 'bold', marginBottom: 5, color: '#005b9f' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '31%', backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  gridItemActive: { borderColor: '#005b9f', backgroundColor: '#e2f0fb' },
  gridText: { fontSize: 11, fontWeight: 'bold', textAlign: 'center', color: '#555' },
  gridTextActive: { color: '#005b9f' },
  inputSection: { backgroundColor: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginTop: 5 },
  inputLabel: { marginBottom: 10, fontWeight: 'bold', color: '#333' },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
  textInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 10, backgroundColor: '#f9f9f9' },
  addButton: { backgroundColor: '#28a745', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { fontStyle: 'italic', color: '#777', marginBottom: 10 },
  assetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  assetName: { flex: 1, fontWeight: 'bold', color: '#333' },
  assetValue: { flex: 1, color: '#555', textAlign: 'right', paddingRight: 15 },
  removeText: { color: '#dc3545', fontSize: 12, fontWeight: 'bold' },
  summaryCard: { backgroundColor: '#d4edda', padding: 20, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#c3e6cb' },
  summaryText: { fontSize: 15, marginBottom: 5, color: '#155724' },
  divider: { height: 1, backgroundColor: '#c3e6cb', marginVertical: 10 },
  resultText: { fontSize: 18, fontWeight: 'bold', color: '#155724' }
});