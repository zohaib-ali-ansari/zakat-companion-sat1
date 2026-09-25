import { useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';

const SUGGESTIONS_EN = [
  'What is Zakat?',
  'What is nisab?',
  "Benifits of zakat",
  'How to calculate Gold & Silver?',
  'Who is eligible to receive Zakat?',
  'Zakat on Cash & Bank Savings',
  'Is Zakat applicable on Property?',
  
];

const RAG_API_URL = process.env.EXPO_PUBLIC_RAG_API_URL;

async function getAssistantReply(question) {
  if (!RAG_API_URL || !RAG_API_URL.startsWith('https://')) {
    throw new Error('The assistant service is not configured.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 150000);

  try {
    const response = await fetch(`${RAG_API_URL.replace(/\/$/, '')}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorDetail = '';

      try {
        const errorData = await response.json();
        errorDetail =
          errorData?.detail ||
          errorData?.message ||
          errorData?.error ||
          '';
      } catch {}

      throw new Error(
        errorDetail ||
        `Assistant service returned ${response.status} ${response.statusText}.`
      );
    }

    const data = await response.json();

    if (typeof data.answer !== 'string' || !data.answer.trim()) {
      throw new Error('Assistant service returned an invalid answer.');
    }

    return data.answer.trim();
  } finally {
    clearTimeout(timeoutId);
  }
}

export const AssistantScreen = ({ onOpenSettings }) => {
  const { themeColors } = useLanguage();
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hello! I'm your Zakat Assistant. Ask me any question about Zakat, and I'll help you find an answer.",
      sender: 'assistant',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const activeSuggestions = SUGGESTIONS_EN;

  const filteredSuggestions = activeSuggestions.filter((item) =>
    item.toLowerCase().includes(inputText.toLowerCase().trim())
  );

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = { id: Date.now().toString(), text, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const replyText = await getAssistantReply(text.trim());
      const aiMsg = { id: (Date.now() + 1).toString(), text: replyText, sender: 'assistant' };
      setMessages((prev) => [...prev, aiMsg]);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorText = error?.name === 'AbortError'
        ? `Assistant error: ${errorMessage || 'The request timed out.'}`
        : `Assistant error: ${errorMessage || 'Unknown error.'}`;
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: errorText, sender: 'assistant' },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
      <Header onOpenSettings={onOpenSettings} />

      <View style={[styles.privacyBadge, { backgroundColor: themeColors.successBg || '#F0FDF4' }]}>
        <Text style={[styles.privacyText, { color: themeColors.success || '#166534' }]}>
          Private and secure Zakat guidance
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
                ]}
              >
                {item.sender === 'user' ? 'You' : 'Assistant'}
              </Text>
              <View
                style={[
                  styles.messageBubble,
                  item.sender === 'user'
                    ? { alignSelf: 'flex-end', backgroundColor: themeColors.primary }
                    : { alignSelf: 'flex-start', backgroundColor: themeColors.cardBgAlt },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: item.sender === 'user' ? '#FFFFFF' : themeColors.textPrimary },
                  ]}
                >
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
              Assistant is typing...
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

        <View style={[styles.inputContainer, { backgroundColor: themeColors.cardBg, borderTopColor: themeColors.border }]}>
          <TextInput
            style={[
              styles.input,
              { color: themeColors.textPrimary, borderColor: themeColors.border, backgroundColor: themeColors.background },
            ]}
            placeholder="Ask a question about Zakat..."
            placeholderTextColor={themeColors.textMuted}
            value={inputText}
            onChangeText={setInputText}
          />

          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: themeColors.primary }]}
            onPress={() => handleSend()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimerContainer}>
          <Text style={[styles.disclaimerText, { color: themeColors.textMuted }]}>
            Answers are for general guidance and are not a substitute for qualified advice.
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
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: 13, borderWidth: 1 },
  sendButton: { justifyContent: 'center', alignItems: 'center', marginLeft: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  sendButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  disclaimerContainer: { paddingVertical: 6, alignItems: 'center' },
  disclaimerText: { fontSize: 10, textAlign: 'center', paddingHorizontal: 20 },
});