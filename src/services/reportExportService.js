import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const formatPkr = (val) => `PKR ${Number(val || 0).toLocaleString('en-US')}`;

const escapeHtml = (unsafe) => {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const getPrintSafeHtml = ({
  year = '2024',
  userName = 'Zakat Payer',
  userEmail = '',
  snapshot = {},
  totalDue = 0,
  totalPaid = 0,
  remaining = 0,
  records = [],
  generatedAt = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
}) => {
  const assets = snapshot.totalEligibleAssets || snapshot.totalAssets || 0;
  const debts = snapshot.deductibleDebts || snapshot.liabilitiesVal || 0;
  const netWealth = snapshot.netZakatableWealth || Math.max(0, assets - debts);
  const completionRate = totalDue > 0 ? Math.min(100, Math.round((totalPaid / totalDue) * 100)) : 100;

  const transactionRows = records.length > 0
    ? records.map((r, i) => `
      <tr style="background-color: ${i % 2 === 0 ? '#F8FAFC' : '#FFFFFF'};">
        <td style="padding: 9px 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px; color: #334155;">${escapeHtml(r.date || 'N/A')}</td>
        <td style="padding: 9px 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px; font-weight: bold; color: #0F172A;">${escapeHtml(r.recipient || 'Beneficiary')}</td>
        <td style="padding: 9px 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px; color: #475569;">${escapeHtml(r.category || 'Zakat')}</td>
        <td style="padding: 9px 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px; color: #64748B;">${escapeHtml(r.notes || '-')}</td>
        <td style="padding: 9px 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px; font-weight: bold; text-align: right; color: #047857;">${formatPkr(r.amount)}</td>
      </tr>
    `).join('')
    : `
      <tr>
        <td colspan="5" style="text-align: center; color: #94A3B8; padding: 20px; font-size: 12px; font-style: italic;">No payment transactions recorded for this period.</td>
      </tr>
    `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Zakat Annual Report - ${escapeHtml(year)}</title>
  <style>
    body {
      font-family: Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      color: #0F172A;
      background-color: #FFFFFF;
      font-size: 12px;
      line-height: 1.4;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    .header-table {
      margin-bottom: 20px;
      border-bottom: 2px solid #059669;
      padding-bottom: 14px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: bold;
      color: #064E3B;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748B;
      margin-top: 2px;
    }
    .badge {
      display: inline-block;
      background-color: #ECFDF5;
      color: #047857;
      border: 1px solid #A7F3D0;
      padding: 4px 10px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 11px;
    }
    .user-box {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 16px;
    }
    .quote-box {
      background-color: #F0FDF4;
      border-left: 3px solid #10B981;
      padding: 8px 12px;
      margin-bottom: 18px;
      font-style: italic;
      color: #166534;
      font-size: 11px;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #1E293B;
      margin-top: 14px;
      margin-bottom: 8px;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 4px;
    }
    .kpi-table {
      margin-bottom: 18px;
    }
    .kpi-cell {
      width: 33.33%;
      padding: 6px;
      vertical-align: top;
    }
    .kpi-inner {
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 10px;
      background-color: #FFFFFF;
    }
    .kpi-inner-highlight {
      border: 1px solid #A7F3D0;
      border-radius: 6px;
      padding: 10px;
      background-color: #ECFDF5;
    }
    .kpi-inner-warning {
      border: 1px solid #FDE68A;
      border-radius: 6px;
      padding: 10px;
      background-color: #FFFBEB;
    }
    .kpi-label {
      font-size: 10px;
      font-weight: bold;
      color: #64748B;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .kpi-val {
      font-size: 15px;
      font-weight: bold;
      color: #0F172A;
    }
    .th-style {
      background-color: #F1F5F9;
      color: #475569;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      padding: 8px 10px;
      border-bottom: 2px solid #CBD5E1;
      text-align: left;
    }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #E2E8F0;
      color: #94A3B8;
      font-size: 10px;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <table class="header-table">
    <tr>
      <td style="vertical-align: middle;">
        <div class="brand-title">Zakat Companion</div>
        <div class="brand-sub">Annual Islamic Wealth &amp; Zakat Summary</div>
      </td>
      <td style="text-align: right; vertical-align: middle;">
        <span class="badge">Zakat Cycle ${escapeHtml(year)}</span>
        <div style="color: #64748B; font-size: 10px; margin-top: 4px;">Date: ${escapeHtml(generatedAt)}</div>
      </td>
    </tr>
  </table>

  <!-- User Details -->
  <div class="user-box">
    <table style="width: 100%;">
      <tr>
        <td>
          <div style="font-size: 14px; font-weight: bold; color: #0F172A;">${escapeHtml(userName)}</div>
          <div style="font-size: 11px; color: #64748B;">${escapeHtml(userEmail || 'Account Verified')}</div>
        </td>
        <td style="text-align: right;">
          <div style="font-size: 10px; font-weight: bold; color: #64748B; text-transform: uppercase;">Status</div>
          <div style="font-size: 14px; font-weight: bold; color: ${completionRate >= 100 ? '#047857' : '#B45309'};">
            ${completionRate}% Completed
          </div>
        </td>
      </tr>
    </table>
  </div>

  <div class="quote-box">
    "Take from their wealth a charity by which you purify them and cause them increase..." [Surah At-Tawbah 9:103]
  </div>

  <!-- Financial Breakdown -->
  <div class="section-title">Wealth &amp; Zakat Assessment</div>
  <table class="kpi-table">
    <tr>
      <td class="kpi-cell">
        <div class="kpi-inner">
          <div class="kpi-label">Total Assets</div>
          <div class="kpi-val">${formatPkr(assets)}</div>
        </div>
      </td>
      <td class="kpi-cell">
        <div class="kpi-inner">
          <div class="kpi-label">Liabilities / Debts</div>
          <div class="kpi-val">${formatPkr(debts)}</div>
        </div>
      </td>
      <td class="kpi-cell">
        <div class="kpi-inner">
          <div class="kpi-label">Net Zakatable Wealth</div>
          <div class="kpi-val">${formatPkr(netWealth)}</div>
        </div>
      </td>
    </tr>
    <tr>
      <td class="kpi-cell">
        <div class="kpi-inner-highlight">
          <div class="kpi-label" style="color: #047857;">Total Zakat Due (2.5%)</div>
          <div class="kpi-val" style="color: #047857;">${formatPkr(totalDue)}</div>
        </div>
      </td>
      <td class="kpi-cell">
        <div class="kpi-inner-highlight">
          <div class="kpi-label" style="color: #047857;">Total Distributed</div>
          <div class="kpi-val" style="color: #047857;">${formatPkr(totalPaid)}</div>
        </div>
      </td>
      <td class="kpi-cell">
        <div class="${remaining > 0 ? 'kpi-inner-warning' : 'kpi-inner-highlight'}">
          <div class="kpi-label" style="color: ${remaining > 0 ? '#B45309' : '#047857'};">Remaining Balance</div>
          <div class="kpi-val" style="color: ${remaining > 0 ? '#B45309' : '#047857'};">${formatPkr(remaining)}</div>
        </div>
      </td>
    </tr>
  </table>

  <!-- Transactions Table -->
  <div class="section-title">Payment Distributions (${records.length})</div>
  <table style="border: 1px solid #E2E8F0; border-radius: 6px; overflow: hidden; margin-bottom: 20px;">
    <thead>
      <tr>
        <th class="th-style">Date</th>
        <th class="th-style">Recipient / Charity</th>
        <th class="th-style">Category</th>
        <th class="th-style">Notes</th>
        <th class="th-style" style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${transactionRows}
    </tbody>
  </table>

  <!-- Footer -->
  <table class="footer">
    <tr>
      <td>Zakat Companion &bull; Confidential Financial Record</td>
      <td style="text-align: right;">Calculated &amp; Generated via App</td>
    </tr>
  </table>

</body>
</html>
  `;
};

/**
 * Generate PDF and trigger native sharing/saving or web print.
 */
export const generateAndSharePdfReport = async ({
  year = '2024',
  currentUser = null,
  snapshot = {},
  totalDue = 0,
  totalPaid = 0,
  remaining = 0,
  records = [],
}) => {
  const userName = currentUser?.name || 'Zakat Payer';
  const userEmail = currentUser?.email || '';

  const html = getPrintSafeHtml({
    year,
    userName,
    userEmail,
    snapshot,
    totalDue,
    totalPaid,
    remaining,
    records,
  });

  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return { success: true, method: 'web-print' };
  }

  // Generate local PDF file with base64 data
  const printResult = await Print.printToFileAsync({
    html,
    base64: true,
  });

  if (!printResult || (!printResult.uri && !printResult.base64)) {
    throw new Error('Could not generate PDF file.');
  }

  const cleanYear = String(year || '2024').replace(/[^a-zA-Z0-9]/g, '_');
  const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  const pdfFilePath = `${cacheDir}Zakat_Report_${cleanYear}.pdf`;

  if (printResult.base64) {
    await FileSystem.writeAsStringAsync(pdfFilePath, printResult.base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } else if (printResult.uri) {
    await FileSystem.copyAsync({
      from: printResult.uri,
      to: pdfFilePath,
    });
  }

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(pdfFilePath, {
      mimeType: 'application/pdf',
      dialogTitle: `Zakat Annual Report ${year}`,
      UTI: 'com.adobe.pdf',
    });
  }

  return { success: true, uri: pdfFilePath };
};

/**
 * Generate CSV and share/download.
 */
export const generateAndExportCsvReport = async ({
  year = '2024',
  currentUser = null,
  snapshot = {},
  totalDue = 0,
  totalPaid = 0,
  remaining = 0,
  records = [],
}) => {
  const userName = currentUser?.name || 'Zakat Payer';
  const assets = snapshot.totalEligibleAssets || snapshot.totalAssets || 0;
  const debts = snapshot.deductibleDebts || snapshot.liabilitiesVal || 0;
  const netWealth = snapshot.netZakatableWealth || Math.max(0, assets - debts);

  const lines = [
    `Zakat Annual Report - ${year}`,
    `User: ${userName} (${currentUser?.email || ''})`,
    `Generated: ${new Date().toLocaleString()}`,
    ``,
    `FINANCIAL SUMMARY`,
    `Total Zakatable Assets,PKR ${assets}`,
    `Deductible Liabilities,PKR ${debts}`,
    `Net Zakatable Wealth,PKR ${netWealth}`,
    `Total Zakat Due,PKR ${totalDue}`,
    `Total Distributed,PKR ${totalPaid}`,
    `Remaining Balance,PKR ${remaining}`,
    ``,
    `PAYMENT TRANSACTIONS`,
    `Date,Recipient,Category,Notes,Amount (PKR)`,
  ];

  if (records.length > 0) {
    records.forEach((r) => {
      const sanitizedRecipient = `"${(r.recipient || '').replace(/"/g, '""')}"`;
      const sanitizedNotes = `"${(r.notes || '').replace(/"/g, '""')}"`;
      lines.push(`${r.date || ''},${sanitizedRecipient},${r.category || 'Zakat'},${sanitizedNotes},${r.amount || 0}`);
    });
  } else {
    lines.push(`No transactions recorded`);
  }

  const csvContent = lines.join('\n');

  if (Platform.OS === 'web') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Zakat_Report_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { success: true };
  }

  const baseDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  const cleanFileName = `Zakat_Report_${year.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`;
  const filename = `${baseDir}${cleanFileName}`;

  await FileSystem.writeAsStringAsync(filename, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(filename, {
      mimeType: 'text/csv',
      dialogTitle: `Export Zakat Data ${year}`,
      UTI: 'public.comma-separated-values-text',
    });
  }

  return { success: true, uri: filename };
};
