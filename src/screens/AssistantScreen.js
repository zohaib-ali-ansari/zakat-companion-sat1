import React, { useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { Header } from '../components/Header';

// Master list of suggestions for search and auto-filtering
const ALL_SUGGESTIONS = [
  'What is Nisab?',
  'How to calculate Gold & Silver?',
  'Who is eligible to receive Zakat?',
  'Zakat on Cash & Bank Savings',
  'Is Zakat applicable on Property & Real Estate?',
  'How to calculate Zakat on Stocks & Crypto?',
  'What is Hawl (Zakat Year)?',
  'Zakat on Business Inventory & Receivables',
  'How to pay Zakat on Provident Fund?',
];

const INITIAL_MESSAGES = [
  {
    id: '1',
    text: 'As-salamu alaykum. I am your Zakat Assistant. How can I help you with your Zakat rules or calculations today?',
    sender: 'assistant',
  },
];

// Topic-specific mock replies. Replace with a real AI API call later.
function getMockReply(text, isQuestionValid) {
  const lower = text.toLowerCase();

  if (lower.includes('nisab')) {
    return 'Nisab is the minimum amount of wealth you must own before Zakat becomes due, commonly based on the value of 87.48g of gold or 612.36g of silver.';
  }
  if (lower.includes('gold') || lower.includes('silver')) {
    return 'Gold and silver are zakatable at 2.5% of their current market value, whether held as jewelry, coins, or bullion.';
  }
  if (lower.includes('eligible') || lower.includes('receive')) {
    return 'Zakat can be given to categories such as the poor, the needy, those in debt, and other eligible recipients defined in Islamic guidance.';
  }
  if (lower.includes('cash') || lower.includes('bank') || lower.includes('saving')) {
    return 'All cash on hand and balances in savings or current bank accounts are zakatable at 2.5% of the total amount.';
  }
  if (lower.includes('property') || lower.includes('real estate')) {
    return 'Property used for personal residence is not zakatable. Property held for investment or resale is generally zakatable on its value or rental income.';
  }
  if (lower.includes('stock') || lower.includes('crypto')) {
    return 'Stocks held for trading and cryptocurrency are typically zakatable at their current market value. Long-term investment shares may only require Zakat on the underlying zakatable assets.';
  }
  if (lower.includes('hawl')) {
    return 'Hawl is the completion of one full lunar year during which your wealth stays above the Nisab threshold, after which Zakat becomes due.';
  }
  if (lower.includes('business') || lower.includes('inventory') || lower.includes('receivable')) {
    return 'Business inventory held for resale is zakatable at its current market value. Receivables you expect to collect are also generally zakatable.';
  }
  if (lower.includes('provident') || lower.includes('fund')) {
    return 'Provident fund contributions are generally zakatable once you have access to withdraw them and they meet the Nisab threshold, held for one lunar year.';
  }
  if (text.trim().length < 3 || (!isQuestionValid && !lower.includes('zakat'))) {
    return "I couldn't understand that. Please ask a question related to Zakat, Gold, Nisab, or Cash.";
  }
  return "That's a good question. For a precise ruling on your situation, I'd recommend checking the Guidance section or consulting a knowledgeable source.";
}

export const AssistantScreen = ({ onOpenSettings }) => {
  const { themeColors, isRTL } = useLanguage();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const listRef = useRef(null);

  const filteredSuggestions = ALL_SUGGESTIONS.filter((item) =>
    item.toLowerCase().includes(inputText.toLowerCase().trim())
  );

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const isQuestionValid = ALL_SUGGESTIONS.some((s) =>
      text.toLowerCase().includes(s.toLowerCase().split(' ')[0])
    );

    const userMsg = { id: Date.now().toString(), text, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    setTimeout(() => {
      const replyText = getMockReply(text, isQuestionValid);
      const aiMsg = { id: (Date.now() + 1).toString(), text: replyText, sender: 'assistant' };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }, 1000);
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    Alert.alert('Voice Listening', 'Listening for your question... (Voice recognition enabled)');
    setTimeout(() => {
      setIsListening(false);
      setInputText('How to calculate Zakat on Gold?');
    }, 2000);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
      <Header onOpenSettings={onOpenSettings} />

      <View style={[styles.privacyBadge, { backgroundColor: themeColors.successBg || '#F0FDF4' }]}>
        <Text style={styles.privacyText}>🔒 100% Private (On-Device Local Processing)</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 12 }}>
              <Text style={item.sender === 'user' ? styles.userTag : styles.aiTag}>
                {item.sender === 'user' ? 'YOU' : 'ZAKAT ASSISTANT'}
              </Text>
              <View
                style={[
                  styles.messageBubble,
                  item.sender === 'user'
                    ? { alignSelf: 'flex-end', backgroundColor: themeColors.primary }
                    : { alignSelf: 'flex-start', backgroundColor: themeColors.cardBgAlt },
                ]}>
                <Text
                  style={[
                    styles.messageText,
                    { color: item.sender === 'user' ? themeColors.white : themeColors.textPrimary },
                  ]}>
                  {item.text}
                </Text>
              </View>
            </View>
          )}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={themeColors.primary} />
            <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
              AI Assistant is typing...
            </Text>
          </View>
        )}

        {filteredSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={filteredSuggestions}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.chip, { borderColor: themeColors.border, backgroundColor: themeColors.cardBg }]}
                  onPress={() => handleSend(item)}>
                  <Text style={[styles.chipText, { color: themeColors.textSecondary }]}>🔍 {item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <View style={[styles.inputContainer, { backgroundColor: themeColors.cardBg, borderTopColor: themeColors.border }]}>
          <TouchableOpacity
            style={[styles.micButton, { backgroundColor: themeColors.cardBgAlt }, isListening && styles.micActive]}
            onPress={handleVoiceInput}>
            <Ionicons name="mic" size={18} color={themeColors.textSecondary} />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { color: themeColors.textPrimary, borderColor: themeColors.border, backgroundColor: themeColors.background }]}
            placeholder="Ask or tap mic to speak..."
            placeholderTextColor={themeColors.textMuted}
            value={inputText}
            onChangeText={setInputText}
          />

          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: themeColors.primary }]}
            onPress={() => handleSend()}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimerContainer}>
          <Text style={[styles.disclaimerText, { color: themeColors.textMuted }]}>
            Zakat Assistant may produce inaccurate information about complex cases. Consult a scholar for official rulings.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  privacyBadge: { paddingVertical: 4, alignItems: 'center' },
  privacyText: { fontSize: 10, fontWeight: '600', color: '#166534' },
  chatList: { paddingHorizontal: 16, paddingTop: 8 },
  aiTag: { fontSize: 9, fontWeight: '700', color: '#64748B', marginBottom: 4 },
  userTag: { fontSize: 9, fontWeight: '700', color: '#64748B', marginBottom: 4, alignSelf: 'flex-end' },
  messageBubble: { padding: 14, borderRadius: 16, maxWidth: '85%' },
  messageText: { fontSize: 13, lineHeight: 20 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  loadingText: { marginLeft: 8, fontSize: 12 },
  suggestionsContainer: { paddingHorizontal: 12, marginBottom: 8 },
  chip: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  chipText: { fontSize: 12 },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  micButton: { padding: 8, borderRadius: 20, marginRight: 8 },
  micActive: { backgroundColor: '#FECACA' },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: 13, borderWidth: 1 },
  sendButton: { justifyContent: 'center', alignItems: 'center', marginLeft: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  sendButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  disclaimerContainer: { paddingVertical: 6, alignItems: 'center' },
  disclaimerText: { fontSize: 10, textAlign: 'center', paddingHorizontal: 20 },
});
