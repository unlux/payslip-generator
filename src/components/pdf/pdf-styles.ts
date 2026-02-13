import { StyleSheet } from "@react-pdf/renderer";

const colors = {
  primary: "#333333",
  secondary: "#666666",
  border: "#d0d0d0",
  lightBg: "#f8f8f8",
};

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.primary,
  },

  // Header — logo+name left, pay period right
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    maxWidth: 50,
    maxHeight: 40,
    objectFit: "contain",
  },
  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  companyDetail: {
    fontSize: 9,
    color: colors.secondary,
    marginTop: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  payPeriodLabel: {
    fontSize: 9,
    color: colors.secondary,
    fontStyle: "italic",
  },
  payPeriodValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },

  // Separator
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 20,
  },

  // Section heading
  sectionHeading: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },

  // Employee details grid
  employeeSection: {
    marginBottom: 28,
  },
  employeeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  employeeField: {
    width: "50%",
    flexDirection: "row",
    marginBottom: 8,
  },
  employeeLabel: {
    fontSize: 9,
    color: colors.secondary,
    width: 100,
  },
  employeeColon: {
    fontSize: 9,
    color: colors.secondary,
    width: 12,
    textAlign: "center",
  },
  employeeValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    flex: 1,
  },

  // Bordered table container
  tablesBorder: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    marginBottom: 20,
  },
  tablesRow: {
    flexDirection: "row",
  },
  tableContainer: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.lightBg,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.secondary,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  tableCellName: {
    fontSize: 10,
    flex: 1,
  },
  tableCellAmount: {
    fontSize: 10,
    textAlign: "right",
    minWidth: 80,
  },
  tableFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.lightBg,
  },
  tableFooterLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  tableFooterAmount: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    minWidth: 80,
  },
  tableDivider: {
    width: 1,
    backgroundColor: colors.border,
  },

  // Net payable box
  netPayableBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  netPayableLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  netPayableSubtext: {
    fontSize: 8,
    color: colors.secondary,
    marginTop: 2,
  },
  netPayableAmount: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },

  // Amount in words
  amountWordsContainer: {
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  amountWordsLabel: {
    fontSize: 9,
    color: colors.secondary,
  },
  amountWordsValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },

  // Signatory
  signatoryContainer: {
    marginBottom: 24,
    alignItems: "flex-end",
  },
  signatoryBlock: {
    width: 200,
    alignItems: "center",
  },
  signatoryImage: {
    maxWidth: 120,
    maxHeight: 50,
    objectFit: "contain",
    marginBottom: 4,
  },
  signatoryLine: {
    borderTopWidth: 0.5,
    borderTopColor: colors.primary,
    width: 200,
    paddingTop: 6,
  },
  signatoryText: {
    fontSize: 9,
    textAlign: "center",
  },
  signatoryName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 2,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: colors.secondary,
    textAlign: "center",
  },
});
