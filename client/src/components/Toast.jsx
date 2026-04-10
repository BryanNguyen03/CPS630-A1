function Toast({ message, type = 'success', onClose }) {
  if (!message) {
    return null;
  }

  const toastClassName = type === 'error' ? 'toast toast-error' : 'toast toast-success';

  return (
    <div className="toast-shell" role="status" aria-live="polite" aria-atomic="true">
      <div className={toastClassName}>
        <p>{message}</p>
        <button className="toast-close" onClick={onClose} aria-label="Close notification">
          Close
        </button>
      </div>
    </div>
  );
}

export default Toast;
