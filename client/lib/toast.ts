import toast from "react-hot-toast"

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        background: 'var(--bg-main)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-light)',
        borderRadius: '16px',
        fontSize: '14px',
        fontWeight: 'bold',
        padding: '12px 20px',
        boxShadow: 'var(--shadow-lg)',
      },
      iconTheme: {
        primary: 'var(--status-success)',
        secondary: '#fff',
      },
    })
  },
  error: (message: string) => {
    toast.error(message, {
      style: {
        background: 'var(--bg-main)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-light)',
        borderRadius: '16px',
        fontSize: '14px',
        fontWeight: 'bold',
        padding: '12px 20px',
        boxShadow: 'var(--shadow-lg)',
      },
      iconTheme: {
        primary: 'var(--status-error)',
        secondary: '#fff',
      },
    })
  },
}
