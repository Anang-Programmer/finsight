import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Rect, Image } from '@react-pdf/renderer';

/**
 * Design tokens — one place to tune the whole document's look.
 * Only built-in PDF standard fonts are used (Helvetica / Times family),
 * so this renders identically everywhere with zero external font risk.
 */
const COLORS = {
  ink: '#0f172a',
  inkSoft: '#334155',
  inkMuted: '#64748b',
  hairline: '#e2e8f0',
  hairlineSoft: '#f1f5f9',
  brand: '#494fdf',
  paper: '#ffffff',
  paperAlt: '#f8fafc',
  income: '#166534',
  expense: '#b91c1c',
  ledgerHeaderBg: '#0f172a',
  ledgerHeaderText: '#f1f5f9',
  footerMuted: '#94a3b8',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.paper,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: COLORS.inkSoft,
  },
  topBar: {
    height: 6,
    backgroundColor: COLORS.brand,
  },
  content: {
    paddingHorizontal: 36,
    paddingTop: 24,
    paddingBottom: 56,
  },

  // Masthead
  masthead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 14,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandMark: { marginRight: 8, marginTop: 3 },
  brandName: {
    fontFamily: 'Times-Bold',
    fontSize: 20,
    color: COLORS.brand,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    color: COLORS.inkMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 3,
  },
  docBlock: { alignItems: 'flex-end' },
  docTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 15,
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  docPeriod: {
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: COLORS.inkMuted,
    marginTop: 4,
  },
  mastheadRule: {
    borderBottomWidth: 1.4,
    borderBottomColor: COLORS.ink,
    marginBottom: 16,
  },

  // Info panel
  infoPanel: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: 3,
    marginBottom: 18,
  },
  infoField: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: COLORS.hairline,
  },
  infoFieldLast: { flex: 1, paddingVertical: 10, paddingHorizontal: 14 },
  infoLabel: {
    fontSize: 7.5,
    color: COLORS.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: COLORS.ink },

  // Summary flow (income − expense = balance)
  summaryFlow: { flexDirection: 'row', alignItems: 'stretch', marginBottom: 22 },
  summaryBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: 3,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  summaryBoxEmphasis: {
    flex: 1,
    backgroundColor: COLORS.ink,
    borderRadius: 3,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  summaryLabel: { fontSize: 7.5, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  summaryValue: { fontSize: 13, fontFamily: 'Helvetica-Bold' },
  connector: { width: 26, alignItems: 'center', justifyContent: 'center' },
  connectorSymbol: { fontFamily: 'Times-Bold', fontSize: 16, color: COLORS.inkMuted },

  // Section headings
  sectionHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 4 },
  sectionHeadingBar: { width: 3, height: 11, backgroundColor: COLORS.brand, marginRight: 6 },
  sectionHeadingText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.ink,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Budget / savings cards
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  card: {
    width: '48.5%',
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderTopWidth: 2.5,
    borderRadius: 3,
    padding: 10,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: COLORS.ink, marginBottom: 8 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  cardLabel: { fontSize: 8, color: COLORS.inkMuted },
  cardValue: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: COLORS.ink },
  progressTrack: {
    height: 3,
    backgroundColor: COLORS.hairlineSoft,
    borderRadius: 1.5,
    marginTop: 7,
    marginBottom: 4,
  },
  progressFill: { height: '100%', borderRadius: 1.5 },
  cardFootRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  cardPct: { fontSize: 7.5, fontFamily: 'Helvetica-Bold' },

  // Transaction ledger table
  table: { width: '100%' },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.ledgerHeaderBg,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.ledgerHeaderText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 0.75,
    borderBottomColor: COLORS.hairline,
  },
  tableRowAlt: { backgroundColor: COLORS.paperAlt },
  tableCell: { fontSize: 8.5, color: COLORS.inkSoft },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.hairlineSoft,
    borderRadius: 2,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  categoryPillText: { fontSize: 7.5, color: COLORS.inkSoft, fontFamily: 'Helvetica-Bold' },
  colDate: { width: '14%' },
  colCategory: { width: '20%' },
  colDesc: { width: '39%' },
  colAmount: { width: '27%', textAlign: 'right' },
  amountText: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  emptyState: { paddingVertical: 24, alignItems: 'center' },
  emptyStateText: { fontSize: 9, color: COLORS.footerMuted, fontFamily: 'Helvetica-Oblique' },

  // AI insight
  insightSection: {
    marginTop: 18,
    padding: 16,
    backgroundColor: COLORS.paperAlt,
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.brand,
  },
  insightTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  insightIconDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.brand, marginRight: 7 },
  insightTitle: { fontFamily: 'Times-Bold', fontSize: 12.5, color: COLORS.ink },
  insightText: { fontSize: 9, color: COLORS.inkSoft, lineHeight: 1.5, marginBottom: 8 },
  insightBullet: { flexDirection: 'row', marginBottom: 6 },
  insightBulletMark: { width: 10, fontSize: 9, color: COLORS.brand, fontFamily: 'Helvetica-Bold' },
  insightBulletText: { flex: 1, fontSize: 9, color: COLORS.inkSoft, lineHeight: 1.4 },

  // Footer
  footer: { position: 'absolute', bottom: 22, left: 36, right: 36 },
  footerRule: { borderBottomWidth: 1, borderBottomColor: COLORS.hairline, marginBottom: 8 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 7, color: COLORS.footerMuted, maxWidth: '75%' },
  footerPage: { fontSize: 7, color: COLORS.footerMuted, fontFamily: 'Helvetica-Bold' },
});

export interface EStatementProps {
  user: {
    name: string;
    email: string;
  };
  period: string;
  summary: {
    income: number;
    expense: number;
    balance: number;
  };
  budgets: {
    category: string;
    limit: number;
    spent: number;
  }[];
  savings: {
    title: string;
    target: number;
    current: number;
  }[];
  transactions: {
    date: string;
    category: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
  }[];
  insight?: {
    summary: string;
    highlights: string[];
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

/** Small ascending-bars mark — the one signature brand element, kept quiet everywhere else. */
const BrandMark: React.FC = () => (
  <Image src="/logo.png" style={{ width: 22, height: 22, marginRight: 8, marginTop: 2 }} />
);

const Masthead: React.FC<{ docTitle: string; docSubtitle: string; period: string }> = ({
  docTitle,
  docSubtitle,
  period,
}) => (
  <View>
    <View style={styles.masthead}>
      <View style={styles.brandRow}>
        <BrandMark />
        <View>
          <Text style={styles.brandName}>FINSIGHT</Text>
          <Text style={styles.brandTagline}>{docSubtitle}</Text>
        </View>
      </View>
      <View style={styles.docBlock}>
        <Text style={styles.docTitle}>{docTitle}</Text>
        <Text style={styles.docPeriod}>Periode: {period}</Text>
      </View>
    </View>
    <View style={styles.mastheadRule} />
  </View>
);

const DocFooter: React.FC = () => (
  <View style={styles.footer} fixed>
    <View style={styles.footerRule} />
    <View style={styles.footerRow}>
      <Text style={styles.footerText}>
        Dokumen ini sah dihasilkan secara otomatis oleh Finsight Wealth Management System.
      </Text>
      <Text
        style={styles.footerPage}
        render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`}
      />
    </View>
  </View>
);

export const EStatementPDF: React.FC<EStatementProps> = ({
  user,
  period,
  summary,
  budgets,
  savings,
  transactions,
  insight,
}) => {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} fixed />
        <View style={styles.content}>
          <Masthead docTitle="E-STATEMENT" docSubtitle="Wealth Management Report" period={period} />

          {/* User Info */}
          <View style={styles.infoPanel}>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Nama Nasabah</Text>
              <Text style={styles.infoValue}>{user.name || 'Pengguna Finsight'}</Text>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={[styles.infoValue, { fontSize: 8 }]}>{user.email}</Text>
            </View>
            <View style={styles.infoFieldLast}>
              <Text style={styles.infoLabel}>Tanggal Cetak</Text>
              <Text style={styles.infoValue}>{currentDate}</Text>
            </View>
          </View>

          {/* Summary flow: income − expense = balance */}
          <View style={styles.summaryFlow}>
            <View style={styles.summaryBox}>
              <Text style={[styles.summaryLabel, { color: COLORS.inkMuted }]}>Total Pemasukan</Text>
              <Text style={[styles.summaryValue, { color: COLORS.income }]}>
                {formatCurrency(summary.income)}
              </Text>
            </View>
            <View style={styles.connector}>
              <Text style={styles.connectorSymbol}>−</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={[styles.summaryLabel, { color: COLORS.inkMuted }]}>Total Pengeluaran</Text>
              <Text style={[styles.summaryValue, { color: COLORS.expense }]}>
                {formatCurrency(summary.expense)}
              </Text>
            </View>
            <View style={styles.connector}>
              <Text style={styles.connectorSymbol}>=</Text>
            </View>
            <View style={styles.summaryBoxEmphasis}>
              <Text style={[styles.summaryLabel, { color: '#cbd5e1' }]}>Saldo Bersih</Text>
              <Text style={[styles.summaryValue, { color: '#ffffff' }]}>
                {formatCurrency(summary.balance)}
              </Text>
            </View>
          </View>

          {/* Budget Performance Section */}
          {budgets && budgets.length > 0 && (
            <View wrap={false}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionHeadingBar} />
                <Text style={styles.sectionHeadingText}>Performa Anggaran (Budgets)</Text>
              </View>
              <View style={styles.grid}>
                {budgets.map((b, idx) => {
                  const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
                  const isOver = b.spent > b.limit;
                  const barColor = isOver ? COLORS.expense : COLORS.income;
                  return (
                    <View key={idx} style={[styles.card, { borderTopColor: barColor }]}>
                      <Text style={styles.cardTitle}>{b.category}</Text>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardLabel}>Terpakai</Text>
                        <Text style={[styles.cardValue, isOver ? { color: COLORS.expense } : {}]}>
                          {formatCurrency(b.spent)}
                        </Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardLabel}>Batas Anggaran</Text>
                        <Text style={styles.cardValue}>{formatCurrency(b.limit)}</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                      </View>
                      <View style={styles.cardFootRow}>
                        <Text style={[styles.cardPct, { color: barColor }]}>{pct}%</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Savings Goals Section */}
          {savings && savings.length > 0 && (
            <View wrap={false}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionHeadingBar} />
                <Text style={styles.sectionHeadingText}>Status Tabungan (Goals)</Text>
              </View>
              <View style={styles.grid}>
                {savings.map((s, idx) => {
                  const pct = Math.min(100, Math.round((s.current / s.target) * 100));
                  return (
                    <View key={idx} style={[styles.card, { borderTopColor: COLORS.brand }]}>
                      <Text style={styles.cardTitle}>{s.title}</Text>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardLabel}>Terkumpul</Text>
                        <Text style={styles.cardValue}>{formatCurrency(s.current)}</Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardLabel}>Target</Text>
                        <Text style={styles.cardValue}>{formatCurrency(s.target)}</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: COLORS.brand }]} />
                      </View>
                      <View style={styles.cardFootRow}>
                        <Text style={[styles.cardPct, { color: COLORS.brand }]}>{pct}%</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        <DocFooter />
      </Page>

      {/* Transactions Table on New Page to keep it clean */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} fixed />
        <View style={styles.content}>
          <Masthead docTitle="MUTASI REKENING" docSubtitle="Rincian Transaksi" period={period} />

          <View style={styles.table}>
            <View style={styles.tableHeaderRow} fixed>
              <Text style={[styles.tableHeaderCell, styles.colDate]}>Tanggal</Text>
              <Text style={[styles.tableHeaderCell, styles.colCategory]}>Kategori</Text>
              <Text style={[styles.tableHeaderCell, styles.colDesc]}>Deskripsi</Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>Mutasi</Text>
            </View>

            {transactions.map((tx, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
                <Text style={[styles.tableCell, styles.colDate]}>{tx.date}</Text>
                <View style={styles.colCategory}>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>{tx.category}</Text>
                  </View>
                </View>
                <Text style={[styles.tableCell, styles.colDesc]}>{tx.description}</Text>
                <Text
                  style={[
                    styles.colAmount,
                    styles.amountText,
                    { color: tx.type === 'income' ? COLORS.income : COLORS.expense },
                  ]}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </Text>
              </View>
            ))}

            {transactions.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Tidak ada transaksi pada periode ini.</Text>
              </View>
            )}
          </View>

          {/* AI Insight Section */}
          {insight && insight.summary && (
            <View style={styles.insightSection} wrap={false}>
              <View style={styles.insightTitleRow}>
                <View style={styles.insightIconDot} />
                <Text style={styles.insightTitle}>AI Financial Insight &amp; Recommendation</Text>
              </View>
              <Text style={styles.insightText}>{insight.summary}</Text>
              {insight.highlights &&
                insight.highlights.map((h, idx) => (
                  <View key={idx} style={styles.insightBullet}>
                    <Text style={styles.insightBulletMark}>—</Text>
                    <Text style={styles.insightBulletText}>{h}</Text>
                  </View>
                ))}
            </View>
          )}
        </View>

        <DocFooter />
      </Page>
    </Document>
  );
};

export default EStatementPDF;