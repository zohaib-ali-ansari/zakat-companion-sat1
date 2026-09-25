import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';

const GOLDPRICE_BASE_URL = 'https://api.goldprice.dev/v1';
const FX_BASE_URL = 'https://open.er-api.com/v6/latest/USD';

const PRICE_CACHE_KEY = '@zakat_price_cache_v1';
const CALC_HISTORY_KEY = '@zakat_calculation_history_v1';
const NISAB_PREFERENCE_KEY = '@zakat_nisab_preference_v1';

const TROY_OUNCE_GRAMS = 31.1034768;
const TOLA_GRAMS = 11.6638125;
const MASHA_TO_TOLA = 1 / 12;
const GOLD_NISAB_TOLA = 7.5;
const SILVER_NISAB_TOLA = 52.5;
const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

const GOLD_KARATS = [24, 22, 21, 18];
const UNITS = ['tola', 'gram', 'masha'];

const GOLD_PURITY_FACTORS = {
  24: 1,
  22: 22 / 24,
  21: 21 / 24,
  18: 18 / 24,
};

const getPublicApiKey = () => {
  try {
    return process.env.EXPO_PUBLIC_GOLDPRICE_API_KEY || '';
  } catch (error) {
    return '';
  }
};

const API_KEY = getPublicApiKey();

const getHeaders = () => {
  if (!API_KEY) return {};
  return {
    Authorization: `Bearer ${API_KEY}`,
  };
};

const sleepableFetch = async (url, options = {}, timeoutMs = 15000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    const textBody = await response.text();
    let data = null;

    try {
      data = textBody ? JSON.parse(textBody) : null;
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      const apiMessage = data?.message || data?.error || data?.code;
      const error = new Error(
        typeof apiMessage === 'string' ? `HTTP ${response.status}: ${apiMessage}` : `HTTP ${response.status}`
      );
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

// goldprice.dev also serves this endpoint anonymously. If a configured key is
// rejected (401/403), or the request fails before any HTTP response (on web this
// is usually a CORS preflight failure caused by the Authorization header),
// retry without the key. A header-less GET is a "simple" request: no preflight.
const fetchGoldSpot = async () => {
  const url = `${GOLDPRICE_BASE_URL}/prices?symbol=XAU-USD-SPOT`;
  try {
    return await sleepableFetch(url, { headers: getHeaders() });
  } catch (error) {
    const authRejected = error?.status === 401 || error?.status === 403;
    const noHttpResponse = error?.status === undefined;
    if (API_KEY && (authRejected || noHttpResponse)) {
      return sleepableFetch(url);
    }
    throw error;
  }
};

// Strips thousands separators so "1,500,000" parses as 1500000, not 1.
const parseNumber = (value) => {
  const parsed = Number.parseFloat(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizePositive = (value) => {
  const parsed = parseNumber(value);
  return parsed > 0 ? parsed : 0;
};

const formatPKR = (value) => {
  if (!Number.isFinite(value)) return '0';
  return Math.round(value).toLocaleString('en-PK');
};

const formatRate = (value) => {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const formatAge = (timestamp) => {
  if (!timestamp) return '—';

  const time = new Date(timestamp).getTime();
  if (!Number.isFinite(time)) return '—';

  const diffMs = Math.max(0, Date.now() - time);
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const getUnitTolaFactor = (unit) => {
  if (unit === 'tola') return 1;
  if (unit === 'gram') return 1 / TOLA_GRAMS;
  if (unit === 'masha') return MASHA_TO_TOLA;
  return 1;
};

const getWeightInTola = (weight, unit) => {
  return normalizePositive(weight) * getUnitTolaFactor(unit);
};

const getDefaultGoldItem = () => ({
  id: `${Date.now()}-gold`,
  mode: 'weight',
  unit: 'tola',
  karat: 24,
  weight: '',
  directValue: '',
  priceMode: 'auto',
  manualRate: '',
});

const getDefaultSilverItem = () => ({
  id: `${Date.now()}-silver`,
  unit: 'tola',
  weight: '1',
  priceMode: 'manual',
  manualRate: '',
  purity: 'pure',
});

const getDefaultPriceState = () => ({
  goldSpotUsdOz: null,
  usdPkr: null,
  goldComputedAt: null,
  fxUpdatedAt: null,
  goldApiStale: false,
  source: 'none',
  fetchedAt: null,
});

export const CalculatorScreen = ({ onOpenSettings }) => {
  const { t, themeColors, isRTL } = useLanguage();
  const { updateTotalDue } = useZakat();

  const ui = (en, ur) => (isRTL ? ur : en);

  const [selectedCategories, setSelectedCategories] = useState({
    goldSilver: true,
    cash: true,
    stocks: true,
    property: false,
    business: false,
    liabilities: true,
  });

  const [goldItems, setGoldItems] = useState([getDefaultGoldItem()]);
  const [silverItems, setSilverItems] = useState([getDefaultSilverItem()]);

  const [cashHand, setCashHand] = useState('300000');
  const [bankSavings, setBankSavings] = useState('500000');
  const [stockVal, setStockVal] = useState('450000');
  const [propertyVal, setPropertyVal] = useState('0');
  const [businessVal, setBusinessVal] = useState('0');
  const [liabilitiesVal, setLiabilitiesVal] = useState('100000');

  const [priceState, setPriceState] = useState(getDefaultPriceState());
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);
  const [priceError, setPriceError] = useState('');
  const [hasEverFetched, setHasEverFetched] = useState(false);

  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [nisabBasis, setNisabBasis] = useState('silver');
  const [nisabPriceMode, setNisabPriceMode] = useState('manual');
  // Separate manual rate per basis so a silver rate is never reused for gold.
  const [nisabManualRates, setNisabManualRates] = useState({ silver: '', gold: '' });
  const nisabManualRate = nisabManualRates[nisabBasis];
  const setNisabManualRate = (value) =>
    setNisabManualRates((prev) => ({ ...prev, [nisabBasis]: value }));

  const [calculated, setCalculated] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const categories = [
    { key: 'goldSilver', labelKey: 'catGoldSilver', icon: 'sparkles-outline' },
    { key: 'cash', labelKey: 'catCash', icon: 'wallet-outline' },
    { key: 'stocks', labelKey: 'catStocks', icon: 'trending-up-outline' },
    { key: 'property', labelKey: 'catProperty', icon: 'home-outline' },
    { key: 'business', labelKey: 'catBusiness', icon: 'briefcase-outline' },
    { key: 'liabilities', labelKey: 'catLiabilities', icon: 'card-outline' },
  ];

  const liveGold24kPerGram = useMemo(() => {
    if (!Number.isFinite(priceState.goldSpotUsdOz) || !Number.isFinite(priceState.usdPkr)) {
      return null;
    }
    return (priceState.goldSpotUsdOz / TROY_OUNCE_GRAMS) * priceState.usdPkr;
  }, [priceState.goldSpotUsdOz, priceState.usdPkr]);

  const liveGoldRatePerTola = useMemo(() => {
    if (!Number.isFinite(liveGold24kPerGram)) return null;
    return liveGold24kPerGram * TOLA_GRAMS;
  }, [liveGold24kPerGram]);

  const getGoldLiveRatePerTola = (karat) => {
    if (!Number.isFinite(liveGoldRatePerTola)) return null;
    return liveGoldRatePerTola * (GOLD_PURITY_FACTORS[karat] || 1);
  };

  const isOlderThan24Hours = (timestamp) => {
    if (!timestamp) return true;
    const parsed = new Date(timestamp).getTime();
    return !Number.isFinite(parsed) || Date.now() - parsed > STALE_AFTER_MS;
  };

  const getCurrentGoldRate = (item) => {
    if (item.priceMode === 'manual') {
      const manual = normalizePositive(item.manualRate);
      return manual || null;
    }
    return getGoldLiveRatePerTola(item.karat);
  };

  const getCurrentSilverRate = (item) => {
    const manual = normalizePositive(item.manualRate);
    return manual || null;
  };

  const goldRateStatus = priceState.goldComputedAt
    ? isOlderThan24Hours(priceState.goldComputedAt) || priceState.goldApiStale
    : true;

  const toggleCategory = (catKey) => {
    setSelectedCategories((prev) => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  const updateGoldItem = (id, patch) => {
    setGoldItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const updateSilverItem = (id, patch) => {
    setSilverItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const addGoldItem = () => {
    setGoldItems((prev) => [
      ...prev,
      {
        ...getDefaultGoldItem(),
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        weight: '',
      },
    ]);
  };

  const removeGoldItem = (id) => {
    setGoldItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  };

  const addSilverItem = () => {
    setSilverItems((prev) => [
      ...prev,
      {
        ...getDefaultSilverItem(),
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        weight: '',
      },
    ]);
  };

  const removeSilverItem = (id) => {
    setSilverItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  };

  const readCachedPrices = async () => {
    try {
      const cached = await AsyncStorage.getItem(PRICE_CACHE_KEY);
      if (!cached) return null;

      const parsed = JSON.parse(cached);
      if (!parsed?.goldSpotUsdOz || !parsed?.usdPkr) return null;

      return parsed;
    } catch (error) {
      return null;
    }
  };

  const saveCachedPrices = async (snapshot) => {
    try {
      await AsyncStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(snapshot));
    } catch (error) {
      // Cache failure should not block the calculator.
    }
  };

  const fetchGoldRates = async () => {
    setIsFetchingPrices(true);
    setPriceError('');

    try {
      const [goldResult, fxResult] = await Promise.allSettled([
        fetchGoldSpot(),
        sleepableFetch(FX_BASE_URL),
      ]);

      const goldResponse = goldResult.status === 'fulfilled' ? goldResult.value : null;
      const fxResponse = fxResult.status === 'fulfilled' ? fxResult.value : null;

      if (goldResult.status === 'rejected' || fxResult.status === 'rejected') {
        const reasons = [
          goldResult.status === 'rejected' && `Gold: ${goldResult.reason?.message}`,
          fxResult.status === 'rejected' && `FX: ${fxResult.reason?.message}`,
        ]
          .filter(Boolean)
          .join(' | ');
        throw new Error(reasons);
      }

      const goldRow = goldResponse?.symbols?.[0];
      const usdPkr = Number(fxResponse?.rates?.PKR);

      if (!goldRow?.price || !Number.isFinite(usdPkr)) {
        throw new Error('Price response was incomplete.');
      }

      const snapshot = {
        goldSpotUsdOz: Number(goldRow.price),
        usdPkr,
        goldComputedAt: goldRow.computed_at || new Date().toISOString(),
        fxUpdatedAt: fxResponse?.time_last_update_utc
          ? new Date(fxResponse.time_last_update_utc).toISOString()
          : new Date().toISOString(),
        goldApiStale: Boolean(goldRow.is_stale),
        source: 'live',
        fetchedAt: new Date().toISOString(),
      };

      setPriceState(snapshot);
      setHasEverFetched(true);
      await saveCachedPrices(snapshot);
    } catch (error) {
      // Handled below (cache fallback), so log quietly instead of triggering the red error screen.
      if (__DEV__) console.log('Price API fetch failed:', error?.message);
      const reason = error?.message ? ` (${error.message})` : '';
      const cached = await readCachedPrices();

      if (cached) {
        setPriceState({
          ...cached,
          source: 'cached',
          fetchedAt: cached.fetchedAt || null,
        });
        setHasEverFetched(true);
        setPriceError(
          ui(
            `Live pricing is unavailable. Using the last saved price.${reason}`,
            `لائیو قیمت دستیاب نہیں۔ آخری محفوظ قیمت استعمال ہو رہی ہے۔${reason}`
          )
        );
      } else {
        setPriceState(getDefaultPriceState());
        setHasEverFetched(false);
        setPriceError(
          ui(
            `Could not fetch prices. Try again, or switch items to Manual.${reason}`,
            `قیمتیں حاصل نہیں ہو سکیں۔ دوبارہ کوشش کریں یا آئٹمز کو Manual کریں۔${reason}`
          )
        );
      }
    } finally {
      setIsFetchingPrices(false);
    }
  };

  const loadSavedPreferences = async () => {
    try {
      const savedNisab = await AsyncStorage.getItem(NISAB_PREFERENCE_KEY);
      if (savedNisab === 'gold' || savedNisab === 'silver') {
        setNisabBasis(savedNisab);
        setNisabPriceMode(savedNisab === 'gold' ? 'auto' : 'manual');
      }

      const cached = await readCachedPrices();
      if (cached) {
        setPriceState({
          ...cached,
          source: 'cached',
        });
        setHasEverFetched(true);
      }
    } catch (error) {
      // Defaults are safe.
    } finally {
      setPrefsLoaded(true);
    }
  };

  // Load saved data first, then fetch live prices, so the cache can never
  // overwrite a fresh live snapshot.
  useEffect(() => {
    (async () => {
      await loadSavedPreferences();
      fetchGoldRates();
    })();
  }, []);

  // Only persist once the saved value has been read, otherwise the default
  // ('silver') would overwrite a saved 'gold' preference on startup.
  useEffect(() => {
    if (!prefsLoaded) return;
    AsyncStorage.setItem(NISAB_PREFERENCE_KEY, nisabBasis).catch(() => {});
  }, [nisabBasis, prefsLoaded]);

  // Any input change invalidates the shown result, so a stale snapshot can't be saved.
  useEffect(() => {
    setCalculated(null);
    setIsSaved(false);
  }, [
    selectedCategories,
    goldItems,
    silverItems,
    cashHand,
    bankSavings,
    stockVal,
    propertyVal,
    businessVal,
    liabilitiesVal,
    nisabBasis,
    nisabPriceMode,
    nisabManualRates,
    priceState.goldSpotUsdOz,
    priceState.usdPkr,
  ]);

  const goldCalculations = useMemo(() => {
    return goldItems.map((item) => {
      if (item.mode === 'value') {
        return {
          id: item.id,
          value: normalizePositive(item.directValue),
          blocked: false,
          rate: null,
          tola: null,
        };
      }

      const tola = getWeightInTola(item.weight, item.unit);
      const rate = getCurrentGoldRate(item);

      if (!tola) {
        return { id: item.id, value: 0, blocked: false, rate, tola };
      }

      return {
        id: item.id,
        value: rate ? tola * rate : 0,
        blocked: !rate,
        rate,
        tola,
      };
    });
  }, [goldItems, liveGoldRatePerTola]);

  const silverCalculations = useMemo(() => {
    return silverItems.map((item) => {
      const activeWeight = normalizePositive(item.weight) || 1;
      const tola = getWeightInTola(activeWeight, item.unit || 'tola');
      const rate = getCurrentSilverRate(item);

      if (!tola) {
        return { id: item.id, value: 0, blocked: false, rate, tola };
      }

      return {
        id: item.id,
        value: rate ? tola * rate : 0,
        blocked: !rate,
        rate,
        tola,
      };
    });
  }, [silverItems]);

  // Only weight-mode gold items need a rate; "I already know the value" items do not.
  const autoPricingNeedsGold =
    selectedCategories.goldSilver &&
    goldItems.some(
      (item, index) =>
        item.mode === 'weight' &&
        normalizePositive(item.weight) > 0 &&
        item.priceMode === 'auto' &&
        !goldCalculations[index]?.rate
    );

  const getNisabRate = () => {
    if (nisabBasis === 'silver' || nisabPriceMode === 'manual') {
      return normalizePositive(nisabManualRate);
    }
    return liveGoldRatePerTola || 0;
  };

  const getNisabThreshold = () => {
    const rate = getNisabRate();
    if (!rate) return 0;
    return (nisabBasis === 'silver' ? SILVER_NISAB_TOLA : GOLD_NISAB_TOLA) * rate;
  };

  // A missing Nisab rate (Auto or Manual) must block the calculation,
  // otherwise a 0 threshold is shown as "Nisab not met".
  const nisabRateUnavailable = !getNisabRate();

  const buildCalculationSnapshot = (calculation) => ({
    savedAt: new Date().toISOString(),
    calculation,
    priceSnapshot: priceState,
    goldItems,
    silverItems,
    nisab: {
      basis: nisabBasis,
      priceMode: nisabPriceMode,
      manualRate: nisabManualRate,
    },
  });

  const handleCompute = () => {
    if (autoPricingNeedsGold) {
      Alert.alert(
        t('appTitle'),
        ui(
          'Gold live price is unavailable for an Auto item. Retry fetching prices or switch that item to Manual.',
          'Gold کی لائیو قیمت Auto آئٹم کے لیے دستیاب نہیں۔ قیمت دوبارہ حاصل کریں یا اس آئٹم کو Manual کریں۔'
        )
      );
      return;
    }

    if (
      selectedCategories.goldSilver &&
      (goldCalculations.some((c) => c.blocked) ||
        silverCalculations.some((c) => c.blocked))
    ) {
      Alert.alert(
        t('appTitle'),
        ui(
          'Enter a rate per tola for every gold and silver item that has a weight.',
          'وزن والے ہر سونے اور چاندی کے آئٹم کے لیے فی تولہ ریٹ درج کریں۔'
        )
      );
      return;
    }

    if (nisabRateUnavailable) {
      Alert.alert(
        t('appTitle'),
        ui(
          'Nisab price is missing. Enter a rate per tola, or use the live gold price.',
          'نصاب کی قیمت موجود نہیں۔ فی تولہ ریٹ درج کریں یا لائیو سونے کی قیمت استعمال کریں۔'
        )
      );
      return;
    }

    const gold = selectedCategories.goldSilver
      ? goldCalculations.reduce((sum, item) => sum + item.value, 0)
      : 0;
    const silver = selectedCategories.goldSilver
      ? silverCalculations.reduce((sum, item) => sum + item.value, 0)
      : 0;
    const cash = selectedCategories.cash
      ? normalizePositive(cashHand) + normalizePositive(bankSavings)
      : 0;
    const stocks = selectedCategories.stocks ? normalizePositive(stockVal) : 0;
    const property = selectedCategories.property ? normalizePositive(propertyVal) : 0;
    const business = selectedCategories.business ? normalizePositive(businessVal) : 0;
    const liabilities = selectedCategories.liabilities ? normalizePositive(liabilitiesVal) : 0;

    const totalAssets = gold + silver + cash + stocks + property + business;
    const netZakatableWealth = Math.max(0, totalAssets - liabilities);
    const nisabThreshold = getNisabThreshold();
    const isNisabMet = nisabThreshold > 0 && netZakatableWealth >= nisabThreshold;
    const zakatPayable = isNisabMet ? netZakatableWealth * 0.025 : 0;

    setCalculated({
      totalAssets,
      gold,
      silver,
      cash,
      stocks,
      property,
      business,
      liabilities,
      netZakatableWealth,
      nisabBasis,
      nisabThreshold,
      isNisabMet,
      zakatPayable,
    });
    setIsSaved(false);
  };

  const handleSaveToHistory = async () => {
    if (!calculated) return;

    try {
      const raw = await AsyncStorage.getItem(CALC_HISTORY_KEY);
      const history = raw ? JSON.parse(raw) : [];
      const snapshot = buildCalculationSnapshot(calculated);
      const nextHistory = [snapshot, ...(Array.isArray(history) ? history : [])].slice(0, 20);

      await AsyncStorage.setItem(CALC_HISTORY_KEY, JSON.stringify(nextHistory));

      if (calculated.zakatPayable > 0) {
        updateTotalDue(calculated.zakatPayable);
      }

      setIsSaved(true);

      Alert.alert(
        t('appTitle'),
        ui(
          'Calculation saved and the tracker has been updated.',
          'حساب محفوظ ہو گیا اور ٹریکر اپ ڈیٹ ہو گیا۔'
        )
      );
    } catch (error) {
      Alert.alert(
        t('appTitle'),
        ui(
          'The calculation could not be saved.',
          'حساب محفوظ نہیں ہو سکا۔'
        )
      );
    }
  };

  // ---------- Small render helpers (behaviour identical to the original inline JSX) ----------

  const renderLabel = (text) => (
    <Text
      style={[
        styles.inputLabel,
        { color: themeColors.textPrimary },
        isRTL && styles.rtlText,
      ]}
    >
      {text}
    </Text>
  );

  const renderInput = (value, onChangeText, placeholder = '0') => (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: themeColors.cardBg,
          color: themeColors.textPrimary,
          borderColor: themeColors.border,
        },
        isRTL && styles.rtlInput,
      ]}
      keyboardType="decimal-pad"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={themeColors.textMuted}
    />
  );

  const renderChip = (key, selected, label, onPress) => (
    <TouchableOpacity
      key={key}
      style={[
        styles.optionChip,
        {
          backgroundColor: selected ? themeColors.primaryLight : themeColors.cardBg,
          borderColor: selected ? themeColors.primary : themeColors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.optionChipText,
          { color: selected ? themeColors.primary : themeColors.textPrimary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderResultRow = (label, value, valueStyle, labelStyle) => (
    <View style={[styles.resultRow, isRTL && styles.rtlRow]}>
      <Text
        style={[
          styles.resultRowLabel,
          { color: themeColors.textSecondary },
          labelStyle,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.resultRowVal,
          { color: themeColors.textPrimary },
          valueStyle,
        ]}
      >
        {value}
      </Text>
    </View>
  );

  const renderAddButton = (onPress) => (
    <TouchableOpacity
      style={[styles.addBtn, { backgroundColor: themeColors.primaryLight }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name="add-outline" size={17} color={themeColors.primary} />
      <Text style={[styles.addBtnText, { color: themeColors.primary }]}>
        {ui('Add item', 'آئٹم شامل کریں')}
      </Text>
    </TouchableOpacity>
  );

  const renderPriceModeSwitch = (item, onChange) => (
    <View style={[styles.modeRow, isRTL && styles.rtlRow]}>
      <Text style={[styles.modeLabel, { color: themeColors.textSecondary }]}>
        {ui('Auto', 'خودکار')}
      </Text>
      <Switch
        value={item.priceMode === 'auto'}
        onValueChange={(value) => onChange(value ? 'auto' : 'manual')}
        trackColor={{
          false: themeColors.border,
          true: themeColors.primaryLight,
        }}
        thumbColor={item.priceMode === 'auto' ? themeColors.primary : themeColors.textMuted}
      />
      <Text style={[styles.liveManualLabel, { color: themeColors.textPrimary }]}>
        {item.priceMode === 'auto'
          ? ui('Live', 'لائیو')
          : ui('Manual', 'دستی')}
      </Text>
    </View>
  );

  const renderUnitChips = (value, onChange) => (
    <View style={[styles.optionRow, isRTL && styles.rtlRow]}>
      {UNITS.map((unit) =>
        renderChip(
          unit,
          value === unit,
          unit === 'tola'
            ? ui('Tola', 'تولہ')
            : unit === 'gram'
            ? ui('Gram', 'گرام')
            : ui('Masha', 'ماشہ'),
          () => onChange(unit)
        )
      )}
    </View>
  );

  const renderAssetHeader = (title, canRemove, onRemove) => (
    <View style={[styles.assetCardHeader, isRTL && styles.rtlRow]}>
      <Text style={[styles.assetCardTitle, { color: themeColors.textPrimary }]}>
        {title}
      </Text>

      {canRemove && (
        <TouchableOpacity onPress={onRemove} activeOpacity={0.8}>
          <Ionicons name="trash-outline" size={18} color={themeColors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderGoldItem = (item, index) => {
    const currentRate = getCurrentGoldRate(item);
    const rateUnavailable =
      item.mode === 'weight' &&
      item.priceMode === 'auto' &&
      !currentRate &&
      normalizePositive(item.weight) > 0;
    const value = goldCalculations[index]?.value || 0;

    return (
      <View
        key={item.id}
        style={[
          styles.assetCard,
          {
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border,
          },
        ]}
      >
        {renderAssetHeader(
          ui(`Gold ${index + 1}`, `سونا ${index + 1}`),
          goldItems.length > 1,
          () => removeGoldItem(item.id)
        )}

        {renderLabel(ui('Entry type', 'اندراج کی قسم'))}

        <View style={[styles.optionRow, isRTL && styles.rtlRow]}>
          {renderChip('weight', item.mode === 'weight', ui('Weight', 'وزن'), () =>
            updateGoldItem(item.id, { mode: 'weight' })
          )}
          {renderChip(
            'value',
            item.mode === 'value',
            ui('I already know the value', 'مجھے قیمت معلوم ہے'),
            () => updateGoldItem(item.id, { mode: 'value' })
          )}
        </View>

        {item.mode === 'weight' ? (
          <>
            {renderLabel(ui('Unit', 'اکائی'))}
            {renderUnitChips(item.unit, (unit) => updateGoldItem(item.id, { unit }))}

            {renderLabel(ui('Karat', 'کیرٹ'))}
            <View style={[styles.optionRow, isRTL && styles.rtlRow]}>
              {GOLD_KARATS.map((karat) =>
                renderChip(karat, item.karat === karat, `${karat}K`, () =>
                  updateGoldItem(item.id, { karat })
                )
              )}
            </View>

            {renderLabel(ui('Weight', 'وزن'))}
            {renderInput(item.weight, (weight) => updateGoldItem(item.id, { weight }))}
          </>
        ) : (
          <>
            {renderLabel(ui('Gold value in PKR', 'سونے کی قیمت پاکستانی روپے میں'))}
            {renderInput(item.directValue, (directValue) =>
              updateGoldItem(item.id, { directValue })
            )}
          </>
        )}

        {item.mode === 'weight' && (
          <>
            {renderPriceModeSwitch(item, (priceMode) =>
              updateGoldItem(item.id, { priceMode })
            )}

            {item.priceMode === 'auto' ? (
              <View
                style={[
                  styles.readonlyBox,
                  {
                    backgroundColor: themeColors.cardBgAlt,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <View style={[styles.priceRow, isRTL && styles.rtlRow]}>
                  <View style={styles.priceInfo}>
                    <Text
                      style={[
                        styles.smallLabel,
                        { color: themeColors.textSecondary },
                      ]}
                    >
                      {ui(
                        `${item.karat}K live rate per tola`,
                        `${item.karat}K لائیو ریٹ فی تولہ`
                      )}
                    </Text>
                    <Text
                      style={[
                        styles.liveRate,
                        { color: themeColors.textPrimary },
                      ]}
                    >
                      {currentRate
                        ? `PKR ${formatRate(currentRate)}`
                        : ui('Unavailable', 'دستیاب نہیں')}
                    </Text>
                  </View>

                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={themeColors.textMuted}
                  />
                </View>

                <Text
                  style={[
                    styles.statusText,
                    {
                      color: goldRateStatus
                        ? themeColors.danger
                        : themeColors.textSecondary,
                    },
                  ]}
                >
                  {priceState.source === 'cached'
                    ? `${ui('Cached', 'محفوظ')} • ${formatAge(priceState.goldComputedAt)}`
                    : `${ui('Live', 'لائیو')} • ${formatAge(priceState.goldComputedAt)}`}
                  {goldRateStatus ? ` • ${ui('stale', 'پرانا ڈیٹا')}` : ''}
                </Text>

                <Text style={[styles.noteText, { color: themeColors.textMuted }]}>
                  {ui(
                    'Spot-based rate can differ from a jeweller’s local shop price. Use Manual when you need the quoted shop price.',
                    'Spot ریٹ مقامی سنار کی دکان کے ریٹ سے مختلف ہو سکتا ہے۔ دکاندار کا ریٹ استعمال کرنے کے لیے Manual منتخب کریں۔'
                  )}
                </Text>
              </View>
            ) : (
              <View style={styles.manualRateBox}>
                {renderLabel(
                  ui(
                    `Your ${item.karat}K rate per tola`,
                    `آپ کا ${item.karat}K ریٹ فی تولہ`
                  )
                )}
                {renderInput(item.manualRate, (manualRate) =>
                  updateGoldItem(item.id, { manualRate })
                )}
              </View>
            )}

            {rateUnavailable && (
              <Text style={[styles.errorText, { color: themeColors.danger }]}>
                {ui(
                  'No live rate available. Retry or switch to Manual.',
                  'لائیو ریٹ دستیاب نہیں۔ دوبارہ کوشش کریں یا Manual منتخب کریں۔'
                )}
              </Text>
            )}

            {goldCalculations[index]?.tola > 0 && currentRate ? (
              <Text style={[styles.calculatedPreview, { color: themeColors.primary }]}>
                {item.priceMode === 'manual'
                  ? ui('Value', 'قیمت')
                  : ui('Calculated value', 'حساب شدہ قیمت')}
                : PKR {formatPKR(value)}
              </Text>
            ) : null}
          </>
        )}
      </View>
    );
  };

  const renderSilverItem = (item, index) => {
    const value = silverCalculations[index]?.value || 0;

    return (
      <View
        key={item.id}
        style={[
          styles.assetCard,
          {
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border,
          },
        ]}
      >
        {renderAssetHeader(
          ui(`Silver ${index + 1}`, `چاندی ${index + 1}`),
          silverItems.length > 1,
          () => removeSilverItem(item.id)
        )}

        <View style={styles.manualRateBox}>
          {renderLabel(
            ui('Your silver rate per tola', 'آپ کا چاندی کا ریٹ فی تولہ')
          )}
          {renderInput(item.manualRate, (manualRate) =>
            updateSilverItem(item.id, { manualRate })
          )}
        </View>

        {silverCalculations[index]?.tola > 0 && (
          <Text style={[styles.calculatedPreview, { color: themeColors.primary }]}>
            {ui('Calculated value', 'حساب شدہ قیمت')}: PKR {formatPKR(value)}
          </Text>
        )}
      </View>
    );
  };

  const nisabRate = getNisabRate();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: themeColors.background }]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={themeColors.background}
      />

      <Header onOpenSettings={onOpenSettings} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <Text
            style={[
              styles.pageTitle,
              { color: themeColors.textPrimary },
              isRTL && styles.rtlText,
            ]}
          >
            {t('calculatorTitle')}
          </Text>

          <Text
            style={[
              styles.pageSub,
              { color: themeColors.textSecondary },
              isRTL && styles.rtlText,
            ]}
          >
            {t('calculatorSub')}
          </Text>
        </View>

        <View style={styles.priceHeaderCard}>
          <View style={[styles.priceHeaderTop, isRTL && styles.rtlRow]}>
            <View style={styles.priceHeaderText}>
              <Text
                style={[styles.priceHeaderTitle, { color: themeColors.textPrimary }]}
              >
                {ui('Gold Rates and Manual Silver Rates', 'سونے اور دستی چاندی کے ریٹس')}
              </Text>

              <Text
                style={[styles.priceHeaderSub, { color: themeColors.textSecondary }]}
              >
                {ui(
                  'Gold uses live spot prices. Enter the silver rate manually.',
                  'سونے کے لیے لائیو spot قیمتیں استعمال ہوتی ہیں۔ چاندی کا ریٹ دستی طور پر درج کریں۔'
                )}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.refreshBtn, { backgroundColor: themeColors.primaryLight }]}
              onPress={fetchGoldRates}
              disabled={isFetchingPrices}
              activeOpacity={0.8}
            >
              {isFetchingPrices ? (
                <ActivityIndicator size="small" color={themeColors.primary} />
              ) : (
                <Ionicons
                  name="refresh-outline"
                  size={19}
                  color={themeColors.primary}
                />
              )}

              <Text style={[styles.refreshText, { color: themeColors.primary }]}>
                {ui('Refresh', 'تازہ کریں')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fxPill}>
            <Ionicons
              name="swap-horizontal-outline"
              size={15}
              color={themeColors.primary}
            />
            <Text style={[styles.fxText, { color: themeColors.textSecondary }]}>
              {priceState.usdPkr
                ? `USD/PKR ${formatRate(priceState.usdPkr)} • ${ui(
                    `FX updated ${formatAge(priceState.fxUpdatedAt)}`,
                    `FX اپ ڈیٹ ${formatAge(priceState.fxUpdatedAt)}`
                  )}`
                : ui('USD/PKR unavailable', 'USD/PKR دستیاب نہیں')}
            </Text>
          </View>

          {priceError ? (
            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: themeColors.cardBgAlt,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Ionicons
                name="warning-outline"
                size={17}
                color={themeColors.danger}
              />
              <Text style={[styles.warningText, { color: themeColors.textSecondary }]}>
                {priceError}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.stepBox}>
          <Text
            style={[
              styles.stepTitle,
              { color: themeColors.textPrimary },
              isRTL && styles.rtlText,
            ]}
          >
            {t('selectAssetsStep')}
          </Text>

          <View style={[styles.chipsGrid, isRTL && styles.rtlRow]}>
            {categories.map((cat) => {
              const isSelected = selectedCategories[cat.key];

              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.chipItem,
                    {
                      backgroundColor: isSelected
                        ? themeColors.primaryLight
                        : themeColors.cardBg,
                      borderColor: isSelected
                        ? themeColors.primary
                        : themeColors.border,
                    },
                    isRTL && styles.rtlRow,
                  ]}
                  onPress={() => toggleCategory(cat.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={cat.icon}
                    size={18}
                    color={isSelected ? themeColors.primary : themeColors.textMuted}
                  />

                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected
                          ? themeColors.primary
                          : themeColors.textPrimary,
                      },
                    ]}
                  >
                    {t(cat.labelKey)}
                  </Text>

                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={themeColors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.stepBox}>
          <Text
            style={[
              styles.stepTitle,
              { color: themeColors.textPrimary },
              isRTL && styles.rtlText,
            ]}
          >
            {t('enterValuesStep')}
          </Text>

          {selectedCategories.goldSilver && (
            <View style={styles.fieldGroup}>
              <View style={[styles.sectionHeadingRow, isRTL && styles.rtlRow]}>
                <Text
                  style={[
                    styles.sectionHeading,
                    { color: themeColors.textPrimary },
                    isRTL && styles.rtlText,
                  ]}
                >
                  {ui('Gold', 'سونا')}
                </Text>
                {renderAddButton(addGoldItem)}
              </View>

              {goldItems.map((item, index) => renderGoldItem(item, index))}

              <Text
                style={[
                  styles.infoNote,
                  { color: themeColors.textMuted },
                  isRTL && styles.rtlText,
                ]}
              >
                {ui(
                  'Personal jewellery: scholarly views differ. This app does not decide the ruling for you; confirm the treatment you follow with your scholar.',
                  'ذاتی زیورات کے بارے میں اہلِ علم کی آراء مختلف ہیں۔ یہ ایپ خود فیصلہ نہیں کرتی؛ اپنے عالم سے اپنے فقہی طریقے کے مطابق تصدیق کریں۔'
                )}
              </Text>

              <View style={[styles.sectionHeadingRow, isRTL && styles.rtlRow]}>
                <Text
                  style={[
                    styles.sectionHeading,
                    { color: themeColors.textPrimary },
                    isRTL && styles.rtlText,
                  ]}
                >
                  {ui('Silver', 'چاندی')}
                </Text>
                {renderAddButton(addSilverItem)}
              </View>

              {silverItems.map((item, index) => renderSilverItem(item, index))}

              <Text
                style={[
                  styles.infoNote,
                  { color: themeColors.textMuted },
                  isRTL && styles.rtlText,
                ]}
              >
                {ui(
                  'Enter the rate for pure silver. Sterling silver is valued at 92.5% of that rate.',
                  'خالص چاندی کا ریٹ درج کریں۔ اسٹرلنگ چاندی کی قیمت اس ریٹ کے 92.5% پر شمار ہوگی۔'
                )}
              </Text>
            </View>
          )}

          {selectedCategories.cash && (
            <View style={styles.fieldGroup}>
              {renderLabel(t('fieldCashHand'))}
              {renderInput(cashHand, setCashHand)}

              {renderLabel(t('fieldBankSavings'))}
              {renderInput(bankSavings, setBankSavings)}
            </View>
          )}

          {selectedCategories.stocks && (
            <View style={styles.fieldGroup}>
              {renderLabel(t('fieldStockVal'))}
              {renderInput(stockVal, setStockVal)}
            </View>
          )}

          {selectedCategories.property && (
            <View style={styles.fieldGroup}>
              {renderLabel(t('fieldPropertyVal'))}
              {renderInput(propertyVal, setPropertyVal)}
            </View>
          )}

          {selectedCategories.business && (
            <View style={styles.fieldGroup}>
              {renderLabel(t('fieldBusinessVal'))}
              {renderInput(businessVal, setBusinessVal)}
            </View>
          )}

          {selectedCategories.liabilities && (
            <View style={styles.fieldGroup}>
              {renderLabel(t('fieldLiabilitiesVal'))}
              {renderInput(liabilitiesVal, setLiabilitiesVal)}
            </View>
          )}
        </View>

        <View style={styles.nisabCard}>
          <View style={[styles.sectionHeadingRow, isRTL && styles.rtlRow]}>
            <View style={styles.priceInfo}>
              <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }]}>
                {ui('Nisab', 'نصاب')}
              </Text>
              <Text style={[styles.smallLabel, { color: themeColors.textSecondary }]}>
                {ui(
                  'Choose the Nisab basis and whether its price is Auto or Manual.',
                  'نصاب کی بنیاد اور قیمت کا Auto یا Manual طریقہ منتخب کریں۔'
                )}
              </Text>
            </View>
          </View>

          {renderLabel(ui('Nisab basis', 'نصاب کی بنیاد'))}

          <View style={[styles.optionRow, isRTL && styles.rtlRow]}>
            {renderChip(
              'silver',
              nisabBasis === 'silver',
              ui('Silver • 52.5 tola', 'چاندی • 52.5 تولہ'),
              () => {
                setNisabBasis('silver');
                setNisabPriceMode('manual');
              }
            )}
            {renderChip(
              'gold',
              nisabBasis === 'gold',
              ui('Gold • 7.5 tola', 'سونا • 7.5 تولہ'),
              () => {
                setNisabBasis('gold');
                setNisabPriceMode('auto');
              }
            )}
          </View>

          {renderLabel(ui('Nisab price', 'نصاب کی قیمت'))}

          <View style={[styles.modeRow, isRTL && styles.rtlRow]}>
            <Text style={[styles.modeLabel, { color: themeColors.textSecondary }]}>
              {ui('Auto', 'خودکار')}
            </Text>

            <Switch
              value={nisabPriceMode === 'auto'}
              disabled={nisabBasis === 'silver'}
              onValueChange={(value) => setNisabPriceMode(value ? 'auto' : 'manual')}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primaryLight,
              }}
              thumbColor={
                nisabPriceMode === 'auto'
                  ? themeColors.primary
                  : themeColors.textMuted
              }
            />

            <Text style={[styles.liveManualLabel, { color: themeColors.textPrimary }]}>
              {nisabPriceMode === 'auto'
                ? ui('Live', 'لائیو')
                : ui('Manual', 'دستی')}
            </Text>
          </View>

          {nisabPriceMode === 'auto' && nisabBasis === 'gold' ? (
            <View
              style={[
                styles.readonlyBox,
                {
                  backgroundColor: themeColors.cardBgAlt,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <View style={[styles.priceRow, isRTL && styles.rtlRow]}>
                <View style={styles.priceInfo}>
                  <Text style={[styles.smallLabel, { color: themeColors.textSecondary }]}>
                    {ui('24K gold rate per tola', '24K سونے کا ریٹ فی تولہ')}
                  </Text>
                  <Text style={[styles.liveRate, { color: themeColors.textPrimary }]}>
                    {nisabRate
                      ? `PKR ${formatRate(nisabRate)}`
                      : ui('Unavailable', 'دستیاب نہیں')}
                  </Text>
                </View>

                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={themeColors.textMuted}
                />
              </View>

              <Text
                style={[
                  styles.statusText,
                  {
                    color: goldRateStatus
                      ? themeColors.danger
                      : themeColors.textSecondary,
                  },
                ]}
              >
                {`${ui('Gold', 'سونا')} • ${formatAge(priceState.goldComputedAt)}`}
              </Text>
            </View>
          ) : (
            renderInput(
              nisabManualRate,
              setNisabManualRate,
              nisabBasis === 'silver'
                ? ui('Pure silver rate per tola', 'خالص چاندی ریٹ فی تولہ')
                : ui('24K gold rate per tola', '24K سونے کا ریٹ فی تولہ')
            )
          )}

          <Text style={[styles.nisabPreview, { color: themeColors.primary }]}>
            {nisabRate
              ? ui(
                  `Nisab threshold: PKR ${formatPKR(getNisabThreshold())}`,
                  `نصاب کی حد: PKR ${formatPKR(getNisabThreshold())}`
                )
              : ui(
                  'Nisab threshold is unavailable.',
                  'نصاب کی حد دستیاب نہیں۔'
                )}
          </Text>

          <Text
            style={[
              styles.infoNote,
              { color: themeColors.textMuted },
              isRTL && styles.rtlText,
            ]}
          >
            {ui(
              'Nisab default is Silver. Confirm the basis and treatment you follow with your scholar.',
              'پہلے سے منتخب نصاب چاندی ہے۔ اپنے عالم سے اپنے فقہی طریقے کے مطابق بنیاد کی تصدیق کریں۔'
            )}
          </Text>
        </View>

        <Text
          style={[
            styles.hawlNote,
            { color: themeColors.textMuted },
            isRTL && styles.rtlText,
          ]}
        >
          {ui(
            'Hawl reminder: this calculator is an estimate. Zakat eligibility also depends on the lunar year (hawl) and the ruling you follow.',
            'حول کی یاد دہانی: یہ کیلکولیٹر صرف ایک تخمینہ ہے۔ زکوٰۃ کے وجوب میں قمری سال (حول) اور آپ کے اختیار کردہ فقہی حکم بھی اہم ہیں۔'
          )}
        </Text>

        <TouchableOpacity
          style={[styles.computeBtn, { backgroundColor: themeColors.primary }]}
          onPress={handleCompute}
          activeOpacity={0.85}
        >
          <Ionicons name="calculator-outline" size={22} color="#FFFFFF" />
          <Text style={styles.computeBtnText}>{t('computeResultBtn')}</Text>
        </TouchableOpacity>

        {calculated && (
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: themeColors.cardBg,
                borderColor: themeColors.primaryBorder,
              },
            ]}
          >
            <Text style={[styles.resultTitle, { color: themeColors.textPrimary }]}>
              {t('remainingZakatLabel')}
            </Text>

            {renderResultRow(
              t('totalWealthLabel'),
              `PKR ${formatPKR(calculated.totalAssets)}`
            )}
            {renderResultRow(
              ui('Gold', 'سونا'),
              `PKR ${formatPKR(calculated.gold)}`
            )}
            {renderResultRow(
              ui('Silver', 'چاندی'),
              `PKR ${formatPKR(calculated.silver)}`
            )}
            {renderResultRow(
              t('netDeductionsLabel'),
              `- PKR ${formatPKR(calculated.liabilities)}`,
              { color: themeColors.danger }
            )}

            <View style={styles.divider} />

            {renderResultRow(
              t('netWealthLabel'),
              `PKR ${formatPKR(calculated.netZakatableWealth)}`,
              { fontWeight: '800' },
              { color: themeColors.textPrimary, fontWeight: '700' }
            )}
            {renderResultRow(
              ui('Nisab basis', 'نصاب کی بنیاد'),
              calculated.nisabBasis === 'silver'
                ? ui('Silver • 52.5 tola', 'چاندی • 52.5 تولہ')
                : ui('Gold • 7.5 tola', 'سونا • 7.5 تولہ')
            )}
            {renderResultRow(
              ui('Nisab value', 'نصاب کی قیمت'),
              `PKR ${formatPKR(calculated.nisabThreshold)}`
            )}

            <View
              style={[
                styles.badgeBox,
                {
                  backgroundColor: calculated.isNisabMet
                    ? themeColors.successBg
                    : themeColors.cardBgAlt,
                },
              ]}
            >
              <Ionicons
                name={calculated.isNisabMet ? 'checkmark-circle' : 'information-circle'}
                size={18}
                color={
                  calculated.isNisabMet ? themeColors.success : themeColors.textMuted
                }
              />
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: calculated.isNisabMet
                      ? themeColors.success
                      : themeColors.textMuted,
                  },
                ]}
              >
                {calculated.isNisabMet ? t('nisabMetBadge') : t('nisabNotMetBadge')}
              </Text>
            </View>

            <Text
              style={[styles.zakatPayableTitle, { color: themeColors.textSecondary }]}
            >
              {t('zakatPayableLabel')}
            </Text>

            <Text style={[styles.zakatPayableAmount, { color: themeColors.primary }]}>
              PKR {formatPKR(calculated.zakatPayable)}
            </Text>

            <Text
              style={[
                styles.estimateNote,
                { color: themeColors.textMuted },
                isRTL && styles.rtlText,
              ]}
            >
              {ui(
                'Estimate only. Confirm the applicable rate, Nisab basis and religious ruling before payment.',
                'صرف تخمینہ۔ ادائیگی سے پہلے قابلِ اطلاق ریٹ، نصاب کی بنیاد اور شرعی حکم کی تصدیق کریں۔'
              )}
            </Text>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: isSaved
                    ? themeColors.successBg
                    : themeColors.primaryLight,
                },
              ]}
              onPress={handleSaveToHistory}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isSaved ? 'checkmark-circle' : 'bookmark-outline'}
                size={18}
                color={isSaved ? themeColors.success : themeColors.primary}
              />

              <Text
                style={[
                  styles.saveBtnText,
                  { color: isSaved ? themeColors.success : themeColors.primary },
                ]}
              >
                {isSaved
                  ? ui('Saved to Tracker', 'ٹریکر میں محفوظ')
                  : t('saveCalculationBtn')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  pageSub: {
    fontSize: 14,
    lineHeight: 20,
  },
  priceHeaderCard: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  priceHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  priceHeaderText: {
    flex: 1,
  },
  priceHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  priceHeaderSub: {
    fontSize: 12,
    lineHeight: 18,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fxPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  fxText: {
    fontSize: 12,
    fontWeight: '600',
  },
  warningBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  stepBox: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  rtlText: {
    textAlign: 'right',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlInput: {
    textAlign: 'right',
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 18,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  assetCard: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.2,
  },
  assetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assetCardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 14,
    borderWidth: 1.3,
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modeRow: {
    marginTop: 10,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  liveManualLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  readonlyBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 13,
    borderWidth: 1.2,
  },
  manualRateBox: {
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  priceInfo: {
    flex: 1,
  },
  smallLabel: {
    fontSize: 11,
    lineHeight: 16,
  },
  liveRate: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  statusText: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: '700',
  },
  noteText: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 16,
  },
  errorText: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
  },
  calculatedPreview: {
    marginTop: 7,
    fontSize: 12,
    fontWeight: '800',
  },
  infoNote: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 17,
  },
  nisabCard: {
    marginBottom: 18,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  nisabPreview: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '800',
  },
  hawlNote: {
    marginBottom: 18,
    fontSize: 11,
    lineHeight: 17,
  },
  computeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    gap: 10,
    marginBottom: 24,
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  computeBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  resultCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 6,
    gap: 12,
  },
  resultRowLabel: {
    fontSize: 14,
  },
  resultRowVal: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
    marginVertical: 10,
  },
  badgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    marginVertical: 14,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  zakatPayableTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  zakatPayableAmount: {
    fontSize: 34,
    fontWeight: '900',
    marginVertical: 6,
  },
  estimateNote: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 7,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 8,
    marginTop: 10,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});