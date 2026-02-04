import React from "react";

const FilterBar = ({
  employees,
  months,
  selectedEmployee,
  selectedMonth,
  onEmployeeChange,
  onMonthChange,
  filteredCount,
  totalCount,
  t
}) => (
  <div className="filter-bar">
    <div className="filter-group">
      <label htmlFor="employee-filter">{t("adminDashboard.employeeFilter")}</label>
      <select
        id="employee-filter"
        value={selectedEmployee}
        onChange={onEmployeeChange}
      >
        <option value="">{t("adminDashboard.allEmployees")}</option>
        {employees.map((employee) => (
          <option key={employee} value={employee}>
            {employee}
          </option>
        ))}
      </select>
    </div>
    <div className="filter-group">
      <label htmlFor="month-filter">{t("adminDashboard.monthFilter")}</label>
      <select
        id="month-filter"
        value={selectedMonth}
        onChange={onMonthChange}
      >
        <option value="">{t("adminDashboard.allMonths")}</option>
        {months.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>
    </div>
    <div className="filter-summary">
      <span>
        {t("adminDashboard.showingReports", {
          count: filteredCount,
          total: totalCount,
        })}
      </span>
    </div>
  </div>
);

export default FilterBar;
