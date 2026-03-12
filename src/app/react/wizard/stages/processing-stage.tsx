interface ProcessingStageProps {
    progress: number;
    statusMessage?: string;
    onCancel?: () => void;
}

export function ProcessingStage({ progress, statusMessage, onCancel }: ProcessingStageProps) {
    return (
        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem 0' }}>
            <h2 className="stage-title">Processing...</h2>
            <p className="stage-description">
                {statusMessage || 'Analyzing and processing your files locally.'}
            </p>

            <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
                <div
                    style={{
                        height: '8px',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginBottom: '1rem'
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            backgroundColor: 'var(--primary)',
                            width: `${progress}%`,
                            transition: 'width 0.3s ease'
                        }}
                    />
                </div>
                <p style={{ fontWeight: 600, color: 'var(--primary)' }}>{progress}%</p>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', display: 'inline-block' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="spinner" style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(37, 99, 235, 0.2)',
                        borderTopColor: 'var(--primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <span style={{ fontSize: '0.875rem' }}>Worker is executing in private sandbox</span>
                </div>
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

            {onCancel && (
                <div style={{ marginTop: '2rem' }}>
                    <button
                        style={{ background: 'transparent', color: '#ef4444', border: '1px solid #fee2e2' }}
                        onClick={onCancel}
                    >
                        Cancel Task
                    </button>
                </div>
            )}
        </div>
    );
}
