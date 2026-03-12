import { usePlatform } from '../../platform-context';
import { downloadOutputFiles } from '../../../platform/download-output-files';

interface ResultStageProps {
    outputIds: string[];
    baseName?: string;
    onRestart: () => void;
}

export function ResultStage({ outputIds, baseName = 'result', onRestart }: ResultStageProps) {
    const { runtime } = usePlatform();

    const handleDownload = async () => {
        await downloadOutputFiles(runtime, outputIds, { baseName });
    };

    return (
        <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✨</div>
            <h2 className="stage-title">All Done!</h2>
            <p className="stage-description">
                Your file has been successfully processed and is ready for download.
            </p>

            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <p style={{ marginBottom: '1.5rem', fontWeight: 500 }}>
                    {outputIds.length} file{outputIds.length > 1 ? 's' : ''} generated
                </p>
                <button className="primary" onClick={handleDownload} style={{ fontSize: '1.125rem', padding: '1rem 2.5rem' }}>
                    Download Now
                </button>
            </div>

            <button
                style={{ background: 'transparent', color: 'var(--text-muted)' }}
                onClick={onRestart}
            >
                ← Start Over
            </button>
        </div>
    );
}
