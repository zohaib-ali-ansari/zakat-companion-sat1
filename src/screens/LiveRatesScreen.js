import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';

const RATES_API_URL =
  'https://goldrateinpakistan.org/api/rates.json';

const LIVE_RATES_CACHE_KEY =
  '@zakat_live_rates_cache_v1';

const CACHE_DURATION_MS = 5 * 60 * 1000;

const SILVER_NISAB_TOLA = 52.5;
const GOLD_NISAB_TOLA = 7.5;

const formatPkr = (val) => {
  const number = Number(val);

  if (!Number.isFinite(number)) {
    return 'PKR —';
  }

  return `PKR ${Math.round(number).toLocaleString('en-US')}`;
};

const formatUpdatedAt = (value) => {
  if (!value) {
    return 'Unavailable';
  }

  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  return String(value);
};

const fetchLiveRates = async () => {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {
    const response = await fetch(RATES_API_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    const responseText = await response.text();

    let data;

    try {
      data = responseText
        ? JSON.parse(responseText)
        : null;
    } catch (error) {
      throw new Error(
        'Invalid response received from rates API.'
      );
    }

    if (!response.ok) {
      throw new Error(
        `API request failed with status ${response.status}.`
      );
    }

    const gold24k =
      Number(data?.gold?.['24k']?.per_tola);

    const silver =
      Number(data?.silver?.per_tola);

    if (
      !Number.isFinite(gold24k) ||
      !Number.isFinite(silver)
    ) {
      throw new Error(
        'Gold or silver rate is missing from the API response.'
      );
    }

    return data;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(
        'Rate request timed out.'
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const readCachedRates = async () => {
  try {
    const cached =
      await AsyncStorage.getItem(
        LIVE_RATES_CACHE_KEY
      );

    if (!cached) {
      return null;
    }

    const parsed = JSON.parse(cached);

    if (
      !parsed?.data ||
      !parsed?.cachedAt
    ) {
      return null;
    }

    const cachedAt =
      Number(parsed.cachedAt);

    if (!Number.isFinite(cachedAt)) {
      return null;
    }

    if (
      Date.now() - cachedAt <
      CACHE_DURATION_MS
    ) {
      return parsed.data;
    }

    return null;
  } catch (error) {
    return null;
  }
};

const saveCachedRates = async (data) => {
  try {
    await AsyncStorage.setItem(
      LIVE_RATES_CACHE_KEY,
      JSON.stringify({
        data,
        cachedAt: Date.now(),
      })
    );
  } catch (error) {}
};

export default function LiveRatesScreen({
  onBack,
  onNavigateCalculator,
}) {
  const {
    t,
    isRTL,
    themeColors,
  } = useLanguage();

  const {
    applyLiveRates,
  } = useZakat();

  const insets = useSafeAreaInsets();

  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadRates = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        if (!forceRefresh) {
          const cachedRates =
            await readCachedRates();

          if (
            cachedRates &&
            isMountedRef.current
          ) {
            setRates(cachedRates);
            setLoading(false);
            return;
          }
        }

        const liveData =
          await fetchLiveRates();

        if (!isMountedRef.current) {
          return;
        }

        setRates(liveData);

        await saveCachedRates(
          liveData
        );
      } catch (err) {
        if (!isMountedRef.current) {
          return;
        }

        setError(
          err?.message ||
            'Unable to fetch live market rates.'
        );
      } finally {
        if (!isMountedRef.current) {
          return;
        }

        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadRates(false);
  }, [loadRates]);

  const gold24kTola =
    Number(
      rates?.gold?.['24k']?.per_tola
    ) || 0;

  const gold22kTola =
    Number(
      rates?.gold?.['22k']?.per_tola
    ) || 0;

  const gold21kTola =
    Number(
      rates?.gold?.['21k']?.per_tola
    ) || 0;

  const gold18kTola =
    Number(
      rates?.gold?.['18k']?.per_tola
    ) || 0;

  const gold24kGram =
    Number(
      rates?.gold?.['24k']?.per_gram
    ) || 0;

  const silverTola =
    Number(
      rates?.silver?.per_tola
    ) || 0;

  const silverGram =
    Number(
      rates?.silver?.per_gram
    ) || 0;

  const silverNisabPkr =
    SILVER_NISAB_TOLA *
    silverTola;

  const goldNisabPkr =
    GOLD_NISAB_TOLA *
    gold24kTola;

  const handleApply = () => {
    if (!rates) {
      Alert.alert(
        t('appTitle'),
        'Live market rates are not available yet. Please refresh and try again.'
      );

      return;
    }

    const liveRates = {
      silverNisabPkr,
      goldNisabPkr,

      gold24kTola,
      gold22kTola,
      gold21kTola,
      gold18kTola,

      silver24kTola:
        silverTola,

      silverTola,

      gold24kGram,
      silverGram,

      usdToPkr: null,

      lastUpdated:
        rates.updated_at || '',

      source:
        'GoldRateInPakistan.org',

      currency:
        rates.currency || 'PKR',
    };

    applyLiveRates(liveRates);

    Alert.alert(
      t('appTitle'),
      `Live rates applied successfully!\n\nNisab (Silver): ${formatPkr(
        silverNisabPkr
      )}\nGold (24K/Tola): ${formatPkr(
        gold24kTola
      )}`,
      [
        {
          text: 'Open Calculator',
          onPress: () =>
            onNavigateCalculator?.(),
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            themeColors.background,
        },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          themeColors.background
        }
      />

      <View
        style={[
          styles.topHeader,
          {
            paddingTop: 10,
            paddingBottom: 10,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor:
                themeColors.cardBg,
              borderColor:
                themeColors.border,
            },
          ]}
          onPress={() =>
            onBack?.()
          }
          activeOpacity={0.7}
        >
          <Ionicons
            name={
              isRTL
                ? 'arrow-forward'
                : 'arrow-back'
            }
            size={20}
            color={
              themeColors.primary
            }
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.topHeaderTitle,
            {
              color:
                themeColors.textPrimary,
            },
          ]}
        >
          {t('liveRatesTitle')}
        </Text>

        <TouchableOpacity
          style={[
            styles.refreshButton,
            {
              backgroundColor:
                themeColors.cardBg,
              borderColor:
                themeColors.border,
            },
          ]}
          onPress={() =>
            loadRates(true)
          }
          disabled={refreshing}
          activeOpacity={0.7}
        >
          {refreshing ? (
            <ActivityIndicator
              size="small"
              color={
                themeColors.primary
              }
            />
          ) : (
            <Ionicons
              name="refresh-outline"
              size={20}
              color={
                themeColors.primary
              }
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={styles.titleSection}
        >
          <Text
            style={[
              styles.title,
              {
                color:
                  themeColors.textPrimary,
              },
              isRTL &&
                styles.rtlText,
            ]}
          >
            {t('liveRatesTitle')}
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  themeColors.textSecondary,
              },
              isRTL &&
                styles.rtlText,
            ]}
          >
            Current gold & silver market rates in Pakistan
          </Text>
        </View>

        {loading && !rates ? (
          <View
            style={[
              styles.loadingCard,
              {
                backgroundColor:
                  themeColors.cardBg,
                borderColor:
                  themeColors.primaryBorder,
              },
            ]}
          >
            <ActivityIndicator
              size="large"
              color={
                themeColors.primary
              }
            />

            <Text
              style={[
                styles.loadingText,
                {
                  color:
                    themeColors.textSecondary,
                },
              ]}
            >
              Fetching current market rates...
            </Text>
          </View>
        ) : null}

        {error ? (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor:
                  themeColors.cardBg,
                borderColor:
                  themeColors.primaryBorder,
              },
            ]}
          >
            <View
              style={styles.errorRow}
            >
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={
                  themeColors.primary
                }
              />

              <Text
                style={[
                  styles.errorText,
                  {
                    color:
                      themeColors.textPrimary,
                  },
                ]}
              >
                {error}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.retryButton,
                {
                  backgroundColor:
                    themeColors.primary,
                },
              ]}
              onPress={() =>
                loadRates(true)
              }
              activeOpacity={0.85}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.retryButtonText
                }
              >
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {rates ? (
          <>
            <View
              style={[
                styles.metaCard,
                {
                  backgroundColor:
                    themeColors.primaryLight,
                  borderColor:
                    themeColors.primaryBorder,
                },
              ]}
            >
              <View
                style={styles.metaRow}
              >
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={
                    themeColors.primary
                  }
                />

                <Text
                  style={[
                    styles.metaText,
                    {
                      color:
                        themeColors.primary,
                    },
                  ]}
                >
                  Last updated:{' '}
                  {formatUpdatedAt(
                    rates.updated_at
                  )}
                </Text>
              </View>

              <View
                style={styles.metaRow}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color={
                    themeColors.primary
                  }
                />

                <Text
                  style={[
                    styles.metaText,
                    {
                      color:
                        themeColors.primary,
                    },
                  ]}
                >
                  Source: GoldRateInPakistan.org
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    'https://goldrateinpakistan.org/'
                  )
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.attributionText,
                    {
                      color:
                        themeColors.primary,
                    },
                  ]}
                >
                  View rate source
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor:
                    themeColors.cardBg,
                  borderColor:
                    themeColors.primaryBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.sectionHeader,
                  isRTL &&
                    styles.rtlRow,
                ]}
              >
                <Ionicons
                  name="sparkles"
                  size={20}
                  color={
                    themeColors.primary
                  }
                />

                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color:
                        themeColors.textPrimary,
                    },
                  ]}
                >
                  Nisab Benchmarks
                </Text>
              </View>

              <View
                style={[
                  styles.rateRow,
                  isRTL &&
                    styles.rtlRow,
                ]}
              >
                <View>
                  <Text
                    style={[
                      styles.rateLabel,
                      {
                        color:
                          themeColors.textPrimary,
                      },
                    ]}
                  >
                    {t(
                      'nisabSilverLabel'
                    )}
                  </Text>

                  <Text
                    style={[
                      styles.unitSub,
                      {
                        color:
                          themeColors.textMuted,
                      },
                    ]}
                  >
                    52.5 Tolas (612.36g Silver)
                  </Text>
                </View>

                <Text
                  style={[
                    styles.rateVal,
                    {
                      color:
                        themeColors.primary,
                    },
                  ]}
                >
                  {formatPkr(
                    silverNisabPkr
                  )}
                </Text>
              </View>

              <View
                style={[
                  styles.rateRow,
                  isRTL &&
                    styles.rtlRow,
                ]}
              >
                <View>
                  <Text
                    style={[
                      styles.rateLabel,
                      {
                        color:
                          themeColors.textPrimary,
                      },
                    ]}
                  >
                    {t(
                      'nisabGoldLabel'
                    )}
                  </Text>

                  <Text
                    style={[
                      styles.unitSub,
                      {
                        color:
                          themeColors.textMuted,
                      },
                    ]}
                  >
                    7.5 Tolas (87.48g Gold)
                  </Text>
                </View>

                <Text
                  style={[
                    styles.rateVal,
                    {
                      color:
                        themeColors.textPrimary,
                    },
                  ]}
                >
                  {formatPkr(
                    goldNisabPkr
                  )}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor:
                    themeColors.cardBg,
                  borderColor:
                    themeColors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.sectionHeader,
                  isRTL &&
                    styles.rtlRow,
                ]}
              >
                <Ionicons
                  name="cube-outline"
                  size={20}
                  color={
                    themeColors.primary
                  }
                />

                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color:
                        themeColors.textPrimary,
                    },
                  ]}
                >
                  Precious Metals & Forex
                </Text>
              </View>

              <View
                style={[
                  styles.rateRow,
                  isRTL &&
                    styles.rtlRow,
                ]}
              >
                <Text
                  style={[
                    styles.rateLabel,
                    {
                      color:
                        themeColors.textSecondary,
                    },
                  ]}
                >
                  {t('goldRateLabel')}
                </Text>

                <Text
                  style={[
                    styles.rateVal,
                    {
                      color:
                        themeColors.textPrimary,
                    },
                  ]}
                >
                  {formatPkr(
                    gold24kTola
                  )}{' '}
                  / Tola
                </Text>
              </View>

              <View
                style={[
                  styles.rateRow,
                  isRTL &&
                    styles.rtlRow,
                ]}
              >
                <Text
                  style={[
                    styles.rateLabel,
                    {
                      color:
                        themeColors.textSecondary,
                    },
                  ]}
                >
                  22K Gold
                </Text>

                <Text
                  style={[
                    styles.rateVal,
                    {
                      color:
                        themeColors.textPrimary,
                    },
                  ]}
                >
                  {formatPkr(
                    gold22kTola
                  )}{' '}
                  / Tola
                </Text>
              </View>

              <View
                style={[
                  styles.rateRow,
                  isRTL &&
                    styles.rtlRow,
                ]}
              >
                <Text
                  style={[
                    styles.rateLabel,
                    {
                      color:
                        themeColors.textSecondary,
                    },
                  ]}
                >
                  21K Gold
                </Text>

                <Text
                  style={[
                    styles.rateVal,
                    {
                      color:
                        themeColors.textPrimary,
                    },
                  ]}
                >
                  {formatPkr(
                    gold21kTola
                  )}{' '}
                  / Tola
                </Text>
              </View>

              <View
                style={[
                  styles.rateRow,
                  isRTL &&
                    styles.rtlRow,
                ]}
              >
                <Text
                  style={[
                    styles.rateLabel,
                    {
                      color:
                        themeColors.textSecondary,
                    },
                  ]}
                >
                  18K Gold
                </Text>

                <Text
                  style={[
                    styles.rateVal,
                    {
                      color:
                        themeColors.textPrimary,
                    },
                  ]}
                >
                  {formatPkr(
                    gold18kTola
                  )}{' '}
                  / Tola
                </Text>
              </View>

              <View
                style={[
                  styles.rateRow,
                  isRTL &&
                    styles.rtlRow,
                ]}
              >
                <Text
                  style={[
                    styles.rateLabel,
                    {
                      color:
                        themeColors.textSecondary,
                    },
                  ]}
                >
                  {t(
                    'silverRateLabel'
                  )}
                </Text>

                <Text
                  style={[
                    styles.rateVal,
                    {
                      color:
                        themeColors.textPrimary,
                    },
                  ]}
                >
                  {formatPkr(
                    silverTola
                  )}{' '}
                  / Tola
                </Text>
              </View>

              <View
                style={[
                  styles.rateRow,
                  isRTL &&
                    styles.rtlRow,
                ]}
              >
                <Text
                  style={[
                    styles.rateLabel,
                    {
                      color:
                        themeColors.textSecondary,
                    },
                  ]}
                >
                  Gold 24K / Gram
                </Text>

                <Text
                  style={[
                    styles.rateVal,
                    {
                      color:
                        themeColors.textPrimary,
                    },
                  ]}
                >
                  {formatPkr(
                    gold24kGram
                  )}
                </Text>
              </View>

              <View
                style={[
                  styles.rateRow,
                  isRTL &&
                    styles.rtlRow,
                ]}
              >
                <Text
                  style={[
                    styles.rateLabel,
                    {
                      color:
                        themeColors.textSecondary,
                    },
                  ]}
                >
                  Silver / Gram
                </Text>

                <Text
                  style={[
                    styles.rateVal,
                    {
                      color:
                        themeColors.textPrimary,
                    },
                  ]}
                >
                  {formatPkr(
                    silverGram
                  )}
                </Text>
              </View>

              <View
                style={[
                  styles.rateRow,
                  isRTL &&
                    styles.rtlRow,
                ]}
              >
                <Text
                  style={[
                    styles.rateLabel,
                    {
                      color:
                        themeColors.textSecondary,
                    },
                  ]}
                >
                  {t(
                    'usdRateLabel'
                  )}
                </Text>

                <Text
                  style={[
                    styles.rateVal,
                    {
                      color:
                        themeColors.textPrimary,
                    },
                  ]}
                >
                  Not provided
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.applyBtn,
                {
                  backgroundColor:
                    themeColors.primary,
                },
              ]}
              onPress={handleApply}
              activeOpacity={0.85}
            >
              <Ionicons
                name="calculator-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.applyBtnText
                }
              >
                Apply Rates to Calculator
              </Text>
            </TouchableOpacity>

            <Text
              style={[
                styles.disclaimer,
                {
                  color:
                    themeColors.textMuted,
                },
              ]}
            >
              Rates are indicative Pakistan
              market benchmarks and may differ
              from individual jeweller or local
              Sarafa quotes.
            </Text>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  topHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
  },

  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  titleSection: {
    marginTop: 10,
    marginBottom: 16,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },

  rtlText: {
    textAlign: 'right',
  },

  rtlRow: {
    flexDirection: 'row-reverse',
  },

  loadingCard: {
    minHeight: 150,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginBottom: 16,
    gap: 12,
  },

  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  errorCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 14,
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },

  retryButton: {
    minHeight: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  metaCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 6,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  metaText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },

  attributionText: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 24,
    textDecorationLine: 'underline',
  },

  sectionCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    marginBottom: 16,
    gap: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  rateLabel: {
    fontSize: 14,
    fontWeight: '700',
  },

  unitSub: {
    fontSize: 11,
    marginTop: 2,
  },

  rateVal: {
    fontSize: 15,
    fontWeight: '800',
  },

  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: 27,
    gap: 10,
    marginTop: 10,
    shadowColor: '#1A4FD6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  disclaimer: {
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
  },
});