import { StyleSheet } from "@react-pdf/renderer";

const colors = {
  purple: "#9531a0",
  blueBg: "#e8f4fd",
  primary: "#333333",
  secondary: "#666666",
  lightBg: "#f5f5f5",
  white: "#ffffff",
  border: "#dddddd",
};

export const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: colors.primary,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: "contain",
  },
  companyName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.purple,
    marginBottom: 2,
  },
  companyDetail: {
    fontSize: 8,
    color: colors.secondary,
  },
  headerRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  payslipLabel: {
    fontSize: 8,
    color: colors.secondary,
    marginBottom: 2,
  },
  payslipPeriod: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.purple,
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 8,
    color: colors.secondary,
  },

  // Employee Details
  employeeSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: colors.lightBg,
    borderRadius: 4,
  },
  employeeSectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.purple,
    marginBottom: 8,
  },
  employeeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  employeeField: {
    width: "50%",
    flexDirection: "row",
    marginBottom: 5,
  },
  employeeFieldLabel: {
    fontSize: 8,
    color: colors.secondary,
    width: 100,
  },
  employeeFieldValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    flex: 1,
  },

  // Tables
  tablesRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  tableContainer: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.purple,
    padding: 6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  tableRowAlt: {
    backgroundColor: colors.lightBg,
  },
  tableCellName: {
    fontSize: 8,
    color: colors.primary,
    flex: 1,
  },
  tableCellAmount: {
    fontSize: 8,
    color: colors.primary,
    textAlign: "right",
    minWidth: 70,
  },
  tableFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 6,
    backgroundColor: colors.lightBg,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tableFooterLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  tableFooterAmount: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    textAlign: "right",
    minWidth: 70,
  },

  // Summary
  summaryBox: {
    backgroundColor: colors.blueBg,
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.purple,
  },
  netPayableLabel: {
    fontSize: 8,
    color: colors.secondary,
    marginBottom: 4,
  },
  netPayableAmount: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.purple,
    marginBottom: 6,
  },
  amountInWords: {
    fontSize: 8,
    color: colors.secondary,
    fontStyle: "italic",
  },
});
