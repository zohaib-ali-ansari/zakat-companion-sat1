import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export const CustomAlertModal = ({
  visible = false,
  title = 'Alert',
  message = '',
  type = 'info', // 'success' | 'error' | 'warning' | 'info'
  confirmText = 'OK',
  cancelText = null,
  onConfirm,
  onCancel,
}) => {
  const { themeColors, isRTL } = useLanguage();

  if (!visible) return null;

  const getIconDetails = () => {
    switch (type) {
      case 'success':
        return {
          name: 'checkmark-circle',
          color: themeColors.primary || '#10B981',
          bgColor: themeColors.primaryLight || '#ECFDF5',
          borderColor: themeColors.primaryBorder || '#A7F3D0',
        };
      case 'error':
        return {
          name: 'alert-circle',
          color: '#E11D48',
          bgColor: '#FFE4E6',
          borderColor: '#FECDD3',
        };
      case 'warning':
        return {
          name: 'warning',
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          borderColor: '#FDE68A',
        };
      case 'info':
      default:
        return {
          name: 'information-circle',
          color: '#3B82F6',
          bgColor: '#EFF6FF',
          borderColor: '#BFDBFE',
        };
    }
  };

  const iconInfo = getIconDetails();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => (onCancel ? onCancel() : onConfirm ? onConfirm() : null)}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: themeColors.cardBg || '#FFFFFF', borderColor: themeColors.border || '#E2E8F0' },
          ]}
        >
          {/* Status Icon Header */}
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: iconInfo.bgColor, borderColor: iconInfo.borderColor },
            ]}
          >
            <Ionicons name={iconInfo.name} size={38} color={iconInfo.color} />
          </View>

          {/* Title & Body */}
          <Text style={[styles.title, { color: themeColors.textPrimary || '#0F172A' }, isRTL && styles.rtlText]}>
            {title}
          </Text>

          {message ? (
            <Text style={[styles.message, { color: themeColors.textSecondary || '#475569' }, isRTL && styles.rtlText]}>
              {message}
            </Text>
          ) : null}

          {/* Buttons */}
          <View style={[styles.buttonRow, cancelText ? styles.doubleButtons : styles.singleButton]}>
            {cancelText ? (
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn, { borderColor: themeColors.border || '#CBD5E1' }]}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={[styles.cancelBtnText, { color: themeColors.textSecondary || '#475569' }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                styles.btn,
                styles.confirmBtn,
                { backgroundColor: iconInfo.color },
                cancelText && { flex: 1 },
              ]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  rtlText: {
    textAlign: 'center',
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  singleButton: {
    justifyContent: 'center',
  },
  doubleButtons: {
    justifyContent: 'space-between',
  },
  btn: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  confirmBtn: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
