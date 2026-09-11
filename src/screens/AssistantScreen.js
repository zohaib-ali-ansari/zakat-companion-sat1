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

const SUGGESTIONS_EN = [
  'What is Nisab?',
  'How to calculate Gold & Silver?',
  'Who is eligible to receive Zakat?',
  'Zakat on Cash & Bank Savings',
  'Is Zakat applicable on Property?',
  'How to calculate Zakat on Stocks?',
];

const SUGGESTIONS_UR = [
  'نصاب کی مقدار کیا ہے؟',
  'سونے اور چاندی پر زکوٰۃ کا حساب کیسے لگائیں؟',
  'زکوٰۃ کا مستحق کون ہے؟',
  'بینک بیلنس اور نقد رقم پر زکوٰۃ',
  'کیا پراپرٹی پر زکوٰۃ لاگو ہوتی ہے؟',
  'شیئرز اور اسٹاکس پر زکوٰۃ کا حساب',
];

function getMockReply(text, language) {
  const lower = text.toLowerCase();
  const isUr = language === 'ur';

  if (lower.includes('nisab') || lower.includes('نصاب')) {
    return isUr
      ? 'نصاب وہ کم از کم شرعی مالیت ہے جس پر زکوٰۃ فرض ہوتی ہے۔ یہ 87.48 گرام (7.5 تولے) سونا یا 612.36 گرام (52.5 تولے) چاندی کی مالیت کے برابر ہوتا ہے۔'
      : 'Nisab is the minimum threshold of wealth you must own before Zakat becomes due, commonly equal to 87.48g of gold or 612.36g of silver.';
  }
  if (lower.includes('gold') || lower.includes('silver') || lower.includes('سونا') || lower.includes('چاندی')) {
    return isUr
      ? 'سونا اور چاندی پر ان کی موجودہ مارکیٹ ویلیو کے مطابق 2.5% زکوٰۃ واجب الادا ہوتی ہے، چاہے وہ زیورات کی شکل میں ہوں یا سکے/بسکوٹ۔'
      : 'Gold and silver are zakatable at 2.5% of their current market value, whether held as jewelry, coins, or bullion.';
  }
  if (lower.includes('eligible') || lower.includes('receive') || lower.includes('مستحق') || lower.includes('کس کو')) {
    return isUr
      ? 'زکوٰۃ غراء، مساکین، مقروضین، اور قران مجید میں بیان کردہ 8 مخصوص مصارف زکوٰۃ میں دی جا سکتی ہے۔'
      : 'Zakat can be given to categories such as the poor, the needy, those in debt, and other eligible recipients defined in Islamic guidance.';
  }
  if (lower.includes('cash') || lower.includes('bank') || lower.includes('نقد') || lower.includes('بینک')) {
    return isUr
      ? 'والٹ میں موجود نقد رقم اور بینک اکاؤنٹس کے تمام بیلنس پر 2.5% کی شرح سے زکوٰۃ فرض ہے۔'
      : 'All cash on hand and balances in savings or current bank accounts are zakatable at 2.5% of the total amount.';
  }
  if (lower.includes('property') || lower.includes('پراپرٹی')) {
    return isUr
      ? 'ذاتی رہائش کی پراپرٹی پر زکوٰۃ نہیں ہے۔ تجارتی یا بیچنے کی غرض سے خریدی گئی پراپرٹی پر زکوٰۃ واجب ہوتی ہے۔'
      : 'Personal residence property is not zakatable. Property held for resale or trade is zakatable on its market value.';
  }

  return isUr
    ? 'یہ ایک اہم سوال ہے۔ دقیق شرعی رہنمائی اور مخصوص حالات کے حل کے لیے گائیڈنس کا شعبہ ملاحظہ کریں یا عالم دین سے رجوع کریں۔'
    : "That is an important question. For a precise ruling on your situation, check the Guidance section or consult a knowledgeable scholar.";
}

export const AssistantScreen = ({ onOpenSettings }) => {
  const { t, language, themeColors, isRTL } = useLanguage();
  const isUr = language === 'ur';

  const initialMsgText = t('welcomeMessage');

  const [messages, setMessages] = useState([
    {
      id: '1',
      text: initialMsgText,
      sender: 'assistant',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const listRef = useRef(null);

  const activeSuggestions = isUr ? SUGGESTIONS_UR : SUGGESTIONS_EN;

  const filteredSuggestions = activeSuggestions.filter((item) =>
    item.toLowerCase().includes(inputText.toLowerCase().trim())
  );

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = { id: Date.now().toString(), text, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    setTimeout(() => {
      const replyText = getMockReply(text, language);
      const aiMsg = { id: (Date.now() + 1).toString(), text: replyText, sender: 'assistant' };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }, 1000);
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    Alert.alert(
      isUr ? 'آواز ریکارڈ ہو رہی ہے' : 'Voice Listening',
      isUr ? 'آپ کا سوال سن رہے ہیں...' : 'Listening for your question...'
    );
    setTimeout(() => {
      setIsListening(false);
      setInputText(isUr ? 'سونے پر زکوٰۃ کا حساب کیسے ہوگا؟' : 'How to calculate Zakat on Gold?');
    }, 2000);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
      <Header onOpenSettings={onOpenSettings} />

      <View style={[styles.privacyBadge, { backgroundColor: themeColors.successBg || '#F0FDF4' }]}>
        <Text style={[styles.privacyText, { color: themeColors.success || '#166534' }]}>
          {t('assistantTagline')}
        </Text>
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
              <Text
                style={[
                  item.sender === 'user' ? styles.userTag : styles.aiTag,
                  { color: themeColors.textMuted },
                  isRTL && item.sender === 'user' && { alignSelf: 'flex-start' },
                  isRTL && item.sender !== 'user' && { alignSelf: 'flex-end' },
                ]}
              >
                {item.sender === 'user' ? t('youTag') : t('aiTag')}
              </Text>
              <View
                style={[
                  styles.messageBubble,
                  item.sender === 'user'
                    ? { alignSelf: isRTL ? 'flex-start' : 'flex-end', backgroundColor: themeColors.primary }
                    : { alignSelf: isRTL ? 'flex-end' : 'flex-start', backgroundColor: themeColors.cardBgAlt },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: item.sender === 'user' ? '#FFFFFF' : themeColors.textPrimary },
                    isRTL && { textAlign: 'right' },
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            </View>
          )}
        />

        {loading && (
          <View style={[styles.loadingContainer, isRTL && styles.rtlRow]}>
            <ActivityIndicator size="small" color={themeColors.primary} />
            <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
              {t('typingText')}
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
                  onPress={() => handleSend(item)}
                >
                  <Text style={[styles.chipText, { color: themeColors.textSecondary }]}>🔍 {item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <View style={[styles.inputContainer, { backgroundColor: themeColors.cardBg, borderTopColor: themeColors.border }, isRTL && styles.rtlRow]}>
          <TouchableOpacity
            style={[styles.micButton, { backgroundColor: themeColors.cardBgAlt }, isListening && styles.micActive]}
            onPress={handleVoiceInput}
          >
            <Ionicons name="mic" size={18} color={themeColors.textSecondary} />
          </TouchableOpacity>

          <TextInput
            style={[
              styles.input,
              { color: themeColors.textPrimary, borderColor: themeColors.border, backgroundColor: themeColors.background },
              isRTL && { textAlign: 'right' },
            ]}
            placeholder={t('micPrompt')}
            placeholderTextColor={themeColors.textMuted}
            value={inputText}
            onChangeText={setInputText}
          />

          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: themeColors.primary }]}
            onPress={() => handleSend()}
          >
            <Text style={styles.sendButtonText}>{t('sendBtn')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimerContainer}>
          <Text style={[styles.disclaimerText, { color: themeColors.textMuted }]}>
            {t('disclaimerText')}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  privacyBadge: { paddingVertical: 6, alignItems: 'center' },
  privacyText: { fontSize: 11, fontWeight: '700' },
  chatList: { paddingHorizontal: 16, paddingTop: 8 },
  aiTag: { fontSize: 9, fontWeight: '700', marginBottom: 4 },
  userTag: { fontSize: 9, fontWeight: '700', marginBottom: 4, alignSelf: 'flex-end' },
  messageBubble: { padding: 14, borderRadius: 16, maxWidth: '85%' },
  messageText: { fontSize: 14, lineHeight: 20 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  loadingText: { marginLeft: 8, fontSize: 12 },
  rtlRow: { flexDirection: 'row-reverse' },
  suggestionsContainer: { paddingHorizontal: 12, marginBottom: 8 },
  chip: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  chipText: { fontSize: 12, fontWeight: '600' },
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
