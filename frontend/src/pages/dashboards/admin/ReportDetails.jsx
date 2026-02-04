import React from 'react';
import { useTranslation } from 'react-i18next';

const ReportDetails = ({ 
  isOpen, 
  onClose, 
  report 
}) => {
  const { t, i18n } = useTranslation();
  
  if (!isOpen || !report) return null;

  const formatDate = (dateString) => {
    const currentLang = i18n.language;
    const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    return new Date(dateString).toLocaleDateString(locale, options);
  };

  const formatCurrency = (amount) => {
    const currentLang = i18n.language;
    const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';
    const currency = currentLang === 'ar' ? 'SAR' : 'USD';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    const currentLang = i18n.language;
    const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';
    
    return new Date(dateString).toLocaleString(locale);
  };

  const getStatusText = (status) => {
    return t(`adminDashboard.statuses.${status}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('modals.reportDetails.title')}</h2>
          <button 
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-row">
            <label>{t('modals.reportDetails.date')}</label>
            <span>{formatDate(report.date)}</span>
          </div>
          <div className="detail-row">
            <label>{t('modals.reportDetails.user')}</label>
            <span>{report.user}</span>
          </div>
          <div className="detail-row">
            <label>{t('modals.reportDetails.requestTitle')}</label>
            <span>{report.requestTitle}</span>
          </div>
          <div className="detail-row">
            <label>{t('modals.reportDetails.amount')}</label>
            <span className="amount">{formatCurrency(report.amount)}</span>
          </div>
          <div className="detail-row">
            <label>{t('modals.reportDetails.category')}</label>
            <span>{report.category}</span>
          </div>
          <div className="detail-row">
            <label>{t('modals.reportDetails.description')}</label>
            <span>{report.description}</span>
          </div>
          <div className="detail-row">
            <label>{t('modals.reportDetails.status')}</label>
            <span className={`status-badge ${report.status}`}>
              {getStatusText(report.status)}
            </span>
          </div>
          <div className="detail-row">
            <label>{t('modals.reportDetails.submitted')}</label>
            <span>{formatDateTime(report.submittedAt)}</span>
          </div>
          <div className="detail-row">
            <label>{t('modals.reportDetails.receiptFile')}</label>
            <span>
              <a 
                href={report.receiptUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="receipt-link"
              >
                {t('modals.reportDetails.viewReceipt')}
              </a>
            </span>
          </div>
          {report.rejectReason && (
            <div className="detail-row">
              <label>{t('modals.reportDetails.rejectionReason')}</label>
              <span className="rejection-reason">{report.rejectReason}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
