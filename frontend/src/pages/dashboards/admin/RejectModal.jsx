import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const RejectModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  rejectReason, 
  setRejectReason, 
  reportTitle 
}) => {
  const { t } = useTranslation();
  const textareaRef = useRef(null);
  
  // Debug logging
  console.log('RejectModal render:', { isOpen, reportTitle });

  // Focus management and keyboard navigation
  useEffect(() => {
    if (isOpen) {
      // Focus the textarea when modal opens
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);

      // Handle escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  // Early return after all hooks
  if (!isOpen) return null;

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (rejectReason.trim()) {
      onSubmit();
    }
  };

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-modal-title"
    >
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="reject-modal-title">{t('modals.rejectModal.title')}</h2>
          <button 
            className="modal-close"
            onClick={onClose}
            aria-label={t('modals.rejectModal.close')}
            type="button"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p>{t('modals.rejectModal.description')}</p>
            <div className="report-title">
              <strong>{t('modals.rejectModal.reportLabel')}</strong> 
              <span>{reportTitle}</span>
            </div>
            <label htmlFor="reject-reason" className="sr-only">
              {t('modals.rejectModal.reasonLabel')}
            </label>
            <textarea
              id="reject-reason"
              ref={textareaRef}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t('modals.rejectModal.placeholder')}
              rows="4"
              className="reject-reason-input"
              maxLength="500"
              aria-describedby="reject-reason-help"
            />
            <div id="reject-reason-help" className="input-help">
              {rejectReason.length}/500 characters
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              {t('modals.rejectModal.cancel')}
            </button>
            <button 
              type="submit"
              className="btn btn-reject"
              disabled={!rejectReason.trim()}
            >
              {t('modals.rejectModal.rejectReport')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectModal;
