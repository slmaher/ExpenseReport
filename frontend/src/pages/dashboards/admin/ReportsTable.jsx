import React from "react";
import { formatDate, formatCurrency } from "../../../utils/format";

const ReportsTable = ({
  filteredReports,
  t,
  getStatusText,
  handleFinance,
  openRejectModal,
  openDetailsModal,
}) => (
  <div className="table-container">
    <table className="reports-table">
      <thead>
        <tr>
          <th>{t("adminDashboard.tableHeaders.date")}</th>
          <th>{t("adminDashboard.tableHeaders.user")}</th>
          <th>{t("adminDashboard.tableHeaders.requestTitle")}</th>
          <th>{t("adminDashboard.tableHeaders.amount")}</th>
          <th>{t("adminDashboard.tableHeaders.status")}</th>
          <th>{t("adminDashboard.tableHeaders.details")}</th>
          <th>{t("adminDashboard.tableHeaders.actions")}</th>
        </tr>
      </thead>
      <tbody>
        {filteredReports.map((report) => (
          <tr key={report.id} className={`report-row ${report.status}`}>
            <td>{formatDate(report.date)}</td>
            <td>{report.user}</td>
            <td>{report.requestTitle}</td>
            <td className="amount">{formatCurrency(report.amount)}</td>
            <td className="status-cell">
              <span className={`status-badge ${report.status}`}>
                <span className="status-icon">
                  {report.status === "pending" && "⟳"}
                  {report.status === "financed" && "✓"}
                  {report.status === "rejected" && "✕"}
                </span>
                {getStatusText(report.status)}
              </span>
            </td>
            <td className="details-cell">
              <button
                className="btn btn-details"
                onClick={() => openDetailsModal(report)}
              >
                {t("adminDashboard.buttons.details")}
              </button>
            </td>
            <td className="actions">
              {report.status === "pending" && (
                <>
                  <button
                    className="btn btn-finance"
                    onClick={() => handleFinance(report.id)}
                  >
                    {t("adminDashboard.buttons.finance")}
                  </button>
                  <button
                    className="btn btn-reject"
                    onClick={() => openRejectModal(report.id)}
                  >
                    {t("adminDashboard.buttons.reject")}
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {filteredReports.length === 0 && (
      <div className="no-results">
        <p>{t("adminDashboard.noResults")}</p>
      </div>
    )}
  </div>
);

export default ReportsTable;
