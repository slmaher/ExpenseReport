import React, { useState, useEffect } from "react";
import { getMonthOptions } from "../../../utils/dateUtils";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./AdminDashboard.css";
import RejectModal from "./RejectModal";
import ReportDetails from "./ReportDetails";
import FilterBar from "./FilterBar";
import ReportsTable from "./ReportsTable";


const AdminDashboard = () => {
  const { t, i18n } = useTranslation();

  // States management
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [detailsModal, setDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingReportId, setRejectingReportId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [aggregatedReports, setAggregatedReports] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch users
  useEffect(() => {
    axios.get(`${API_URL}/users`)
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  }, [API_URL]);

  // Fetch reports with filters and pagination
  useEffect(() => {
    let params = { page, limit };
    if (selectedEmployee) params.name = selectedEmployee;
    if (selectedMonth) params.date = selectedMonth;
    axios.get(`${API_URL}/reports`, { params })
      .then(res => {
        setReports(res.data.reports || []);
        setFilteredReports(res.data.reports || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => {
        setReports([]);
        setFilteredReports([]);
        setTotalPages(1);
      });
  }, [API_URL, page, limit, selectedEmployee, selectedMonth]);

  // Fetch aggregated reports by month
  useEffect(() => {
    if (selectedMonth) {
      axios.get(`${API_URL}/reports/aggregate`, { params: { month: selectedMonth } })
        .then(res => setAggregatedReports(res.data))
        .catch(() => setAggregatedReports([]));
    }
  }, [API_URL, selectedMonth]);

  // Get unique employees for filter dropdown
  const employees = users.map(user => user.name);
  const months = getMonthOptions(reports, i18n.language);

  // Apply filters
  useEffect(() => {
    let filtered = [...reports];

    if (selectedEmployee) {
      filtered = filtered.filter((report) => report.user === selectedEmployee);
    }

    if (selectedMonth) {
      filtered = filtered.filter((report) =>
        report.date.startsWith(selectedMonth)
      );
    }

    setFilteredReports(filtered);
  }, [selectedEmployee, selectedMonth, reports]);

  // Handle actions
  const handleFinance = async (reportId) => {
    try {
      await axios.post(`${API_URL}/reports/${reportId}/finance`);
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId ? { ...report, status: "financed" } : report
        )
      );
      alert(t("adminDashboard.messages.reportFinanced"));
    } catch {
      alert(t("adminDashboard.messages.financeFailed"));
    }
  };

  const handleReject = async (reportId) => {
    if (!rejectReason.trim()) {
      alert(t("adminDashboard.messages.rejectionReasonRequired"));
      return;
    }

    try {
      await axios.post(`${API_URL}/reports/${reportId}/reject`, { reason: rejectReason });
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? { ...report, status: "rejected", rejectReason }
            : report
        )
      );
      setRejectModal(false);
      setRejectReason("");
      setRejectingReportId(null);
      alert(t("adminDashboard.messages.reportRejected"));
    } catch {
      alert(t("adminDashboard.messages.rejectFailed"));
    }
  };

  const openRejectModal = (reportId) => {
    console.log("Opening reject modal for report:", reportId);
    setRejectingReportId(reportId);
    setRejectModal(true);
    console.log("Modal state set to true");
  };

  const openDetailsModal = (report) => {
    setSelectedReport(report);
    setDetailsModal(true);
  };



  const getStatusText = (status) => {
    return t(`adminDashboard.statuses.${status}`);
  };

  // Debug logging
  console.log("AdminDashboard render:", {
    reports: reports.length,
    filteredReports: filteredReports.length,
  });

  return (
    <div className="admin-dashboard">
      <div className="main-content">
        <div className="content-header flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <h1 className="page-title text-3xl font-bold">
            {t("adminDashboard.pageTitle")} {" "}
            <span className="highlight text-blue-600">
              {t("adminDashboard.pageTitleHighlight")}
            </span>
          </h1>
          <button
            className="btn btn-primary mt-4 md:mt-0"
            onClick={() => window.location.assign('/dashboards/admin/manage-users')}
          >
            {t("adminDashboard.buttons.manageUsers")}
          </button>
        </div>
        <FilterBar
          employees={employees}
          months={months}
          selectedEmployee={selectedEmployee}
          selectedMonth={selectedMonth}
          onEmployeeChange={(e) => setSelectedEmployee(e.target.value)}
          onMonthChange={(e) => setSelectedMonth(e.target.value)}
          filteredCount={filteredReports.length}
          totalCount={reports.length}
          t={t}
        />
        <ReportsTable
          filteredReports={filteredReports}
          t={t}
          getStatusText={getStatusText}
          handleFinance={handleFinance}
          openRejectModal={openRejectModal}
          openDetailsModal={openDetailsModal}
        />
        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-6">
          <button
            className="btn btn-secondary mx-2"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            {t("adminDashboard.pagination.prev")}
          </button>
          <span className="mx-2">{t("adminDashboard.pagination.page", { page, totalPages })}</span>
          <button
            className="btn btn-secondary mx-2"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            {t("adminDashboard.pagination.next")}
          </button>
        </div>
        {/* Aggregated Reports by Month */}
        {aggregatedReports.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">{t("adminDashboard.aggregatedReportsTitle")}</h2>
            <ul className="list-disc pl-6">
              {aggregatedReports.map((item, idx) => (
                <li key={idx}>
                  {t("adminDashboard.aggregatedReport", item)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <ReportDetails
        isOpen={detailsModal}
        onClose={() => setDetailsModal(false)}
        report={selectedReport}
      />
      <RejectModal
        isOpen={rejectModal}
        onClose={() => setRejectModal(false)}
        onSubmit={() => handleReject(rejectingReportId)}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        reportTitle={
          rejectingReportId
            ? reports.find((r) => r.id === rejectingReportId)?.requestTitle
            : ""
        }
      />
    </div>
  );
};

export default AdminDashboard;
