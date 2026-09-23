import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useZakat } from '../context/ZakatContext';

const formatPkr = (val) => `PKR ${Number(val || 0).toLocaleString('en-US')}`;

export default function DisasterReliefScreen({ onBack, onNavigateAddPayment, onNavigateOrgPortal }) {
  const { t, isRTL, themeColors } = useLanguage();
  const { campaigns } = useZakat();
  const insets = useSafeAreaInsets();

  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const handleContribute = (campaign) => {
    setSelectedCampaign(null);
    onNavigateAddPayment?.({
      recipient: `${campaign.orgName} - ${campaign.title}`,
      notes: `Zakat Contribution for ${campaign.title}`,
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

      <View style={[styles.topHeader, { paddingTop: 10, paddingBottom: 10 }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
          onPress={() => onBack?.()}
          activeOpacity={0.7}
        >
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={20} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={[styles.topHeaderTitle, { color: themeColors.textPrimary }]}>
          {t('disasterReliefTitle')}
        </Text>
        <TouchableOpacity
          style={[styles.orgButton, { backgroundColor: themeColors.primaryLight }]}
          onPress={() => onNavigateOrgPortal?.()}
          activeOpacity={0.8}
        >
          <Ionicons name="business" size={18} color={themeColors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
            {t('disasterReliefTitle')}
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
            Verified emergency Zakat needs & partner non-profit campaigns
          </Text>
        </View>

        {/* Campaign List */}
        {campaigns.map((camp) => {
          const percent = Math.min(100, Math.round((camp.raisedAmount / camp.goalAmount) * 100));

          return (
            <TouchableOpacity
              key={camp.id}
              style={[
                styles.campaignCard,
                { backgroundColor: themeColors.cardBg, borderColor: themeColors.border },
              ]}
              onPress={() => setSelectedCampaign(camp)}
              activeOpacity={0.85}
            >
              <View style={[styles.cardHeader, isRTL && styles.rtlRow]}>
                <View style={[styles.iconBox, { backgroundColor: themeColors.primaryLight }]}>
                  <Ionicons name={camp.icon || 'sparkles-outline'} size={24} color={themeColors.primary} />
                </View>

                <View style={styles.headerTitleGroup}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.orgBadge, { color: themeColors.primary }]}>{camp.orgName}</Text>
                    {camp.isVerified !== false && (
                      <Ionicons name="checkmark-circle" size={14} color="#166534" />
                    )}
                  </View>
                  <Text style={[styles.campTitle, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
                    {camp.title}
                  </Text>
                </View>

                {camp.isUrgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>{t('urgentBadge')}</Text>
                  </View>
                )}
              </View>

              {/* Location & Posted Date */}
              <View style={styles.metaRow}>
                {camp.location ? (
                  <View style={styles.metaTag}>
                    <Ionicons name="location-outline" size={12} color={themeColors.textSecondary} />
                    <Text style={[styles.metaTagText, { color: themeColors.textSecondary }]}>{camp.location}</Text>
                  </View>
                ) : null}
                {camp.datePosted ? (
                  <View style={styles.metaTag}>
                    <Ionicons name="calendar-outline" size={12} color={themeColors.textMuted} />
                    <Text style={[styles.metaTagText, { color: themeColors.textMuted }]}>Posted: {camp.datePosted}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={[styles.desc, { color: themeColors.textSecondary }, isRTL && styles.rtlText]} numberOfLines={2}>
                {camp.description}
              </Text>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressBarTrack, { backgroundColor: themeColors.border }]}>
                  <View style={[styles.progressBarFill, { backgroundColor: themeColors.primary, width: `${percent}%` }]} />
                </View>
                <View style={[styles.progressInfoRow, isRTL && styles.rtlRow]}>
                  <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
                    {formatPkr(camp.raisedAmount)} raised of {formatPkr(camp.goalAmount)}
                  </Text>
                  <Text style={[styles.percentText, { color: themeColors.primary }]}>{percent}%</Text>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[styles.contributeBtn, { backgroundColor: themeColors.primary }]}
                onPress={() => handleContribute(camp)}
                activeOpacity={0.85}
              >
                <Ionicons name="heart" size={18} color="#FFFFFF" />
                <Text style={styles.contributeBtnText}>{t('contributeZakatBtn')}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <Modal visible animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: themeColors.cardBg }]}>
              <View style={[styles.modalHeader, isRTL && styles.rtlRow]}>
                <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>{t('campaignDetails')}</Text>
                <TouchableOpacity onPress={() => setSelectedCampaign(null)}>
                  <Ionicons name="close" size={24} color={themeColors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                <Text style={[styles.modalCampTitle, { color: themeColors.textPrimary }, isRTL && styles.rtlText]}>
                  {selectedCampaign.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Ionicons name="business" size={16} color={themeColors.primary} />
                  <Text style={[styles.modalOrg, { color: themeColors.primary }]}>{selectedCampaign.orgName}</Text>
                  {selectedCampaign.isVerified !== false && (
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#166534' }}>✓ Verified Partner NGO</Text>
                  )}
                </View>

                <Text style={[styles.modalDesc, { color: themeColors.textSecondary }, isRTL && styles.rtlText]}>
                  {selectedCampaign.description}
                </Text>

                {/* Contact & Location Details */}
                <View style={[styles.detailBox, { backgroundColor: themeColors.cardBgAlt, borderColor: themeColors.border }]}>
                  {selectedCampaign.location && (
                    <View style={styles.infoRow}>
                      <Ionicons name="location" size={16} color={themeColors.primary} />
                      <Text style={[styles.infoText, { color: themeColors.textPrimary }]}>{selectedCampaign.location}</Text>
                    </View>
                  )}
                  {selectedCampaign.phone && (
                    <View style={styles.infoRow}>
                      <Ionicons name="call" size={16} color={themeColors.primary} />
                      <Text style={[styles.infoText, { color: themeColors.textPrimary }]}>{selectedCampaign.phone}</Text>
                    </View>
                  )}
                  {selectedCampaign.email && (
                    <View style={styles.infoRow}>
                      <Ionicons name="mail" size={16} color={themeColors.primary} />
                      <Text style={[styles.infoText, { color: themeColors.textPrimary }]}>{selectedCampaign.email}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[styles.modalContributeBtn, { backgroundColor: themeColors.primary }]}
                onPress={() => handleContribute(selectedCampaign)}
              >
                <Ionicons name="heart" size={20} color="#FFFFFF" />
                <Text style={styles.contributeBtnText}>{t('contributeZakatBtn')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
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
  orgButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginBottom: 20,
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
  rtlText: { textAlign: 'right' },
  rtlRow: { flexDirection: 'row-reverse' },
  campaignCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleGroup: { flex: 1 },
  orgBadge: { fontSize: 12, fontWeight: '800' },
  campTitle: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  urgentBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgentBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  metaTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTagText: { fontSize: 11, fontWeight: '600' },
  desc: { fontSize: 13, lineHeight: 18, marginBottom: 14 },
  progressContainer: { marginBottom: 14 },
  progressBarTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressInfoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { fontSize: 12, fontWeight: '600' },
  percentText: { fontSize: 12, fontWeight: '800' },
  contributeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    gap: 8,
  },
  contributeBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalCampTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  modalOrg: { fontSize: 13, fontWeight: '700' },
  modalDesc: { fontSize: 14, lineHeight: 22, marginBottom: 14 },
  detailBox: { padding: 14, borderRadius: 14, borderWidth: 1, gap: 8, marginVertical: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 13, fontWeight: '600' },
  modalContributeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    gap: 8,
    marginTop: 16,
  },
});
