import { ICONS, type Category } from './tools';

export const CATEGORIES_JA: Category[] = [
    {
        name: "コンテンツ編集",
        icon: "catEdit",
        tools: [
            { id: 'edit-text-pdf', name: 'スマート編集', desc: 'テキストの置換や情報の黒塗りをピクセル精度で。', icon: 'pen', hash: 'edit-text' },
            { id: 'add-text-pdf', name: 'テキスト追加', desc: '注釈やラベルを複数ページに追加。', icon: 'type', hash: 'add-text' },
            { id: 'sign-pdf', name: '電子署名', desc: 'プライベートなサンドボックスで法的に有効な署名を。', icon: 'feather', hash: 'sign' },
            { id: 'add-form-fields-pdf', name: 'フォーム作成', desc: 'インタラクティブな入力可能PDFフォームを作成。', icon: 'fileInput', hash: 'add-form-fields' },
            { id: 'watermark-pdf', name: '透かし追加', desc: '安全なスタンプとコピー防止を追加。', icon: 'stamp', hash: 'watermark' },
            { id: 'flatten-pdf', name: 'PDFフラット化', desc: 'レイヤーを統合し、フォームフィールドをロック。', icon: 'layers', hash: 'flatten' }
        ]
    },
    {
        name: "整理 & 最適化",
        icon: "catOrganize",
        tools: [
            { id: 'merge-pdf', name: 'PDF結合', desc: '複数のドキュメントを1つのファイルに結合。', icon: 'files', hash: 'merge' },
            { id: 'split-pdf', name: 'PDF分割', desc: 'ドキュメントを分割または範囲を抽出。', icon: 'scissors', hash: 'split' },
            { id: 'compress-pdf', name: '圧縮', desc: '品質を落とさずにファイルサイズを削減。', icon: 'minimize', hash: 'compress' },
            { id: 'organize-pdf', name: 'ページ整理', desc: 'ページの並べ替え、回転、管理。', icon: 'layout', hash: 'pages' },
            { id: 'rotate-pdf', name: '回転', desc: '個々のページの向きを修正。', icon: 'rotate', hash: 'rotate' },
            { id: 'delete-pages-pdf', name: 'ページ削除', desc: '不要なページを即座に削除。', icon: 'trash', hash: 'delete-pages' },
            { id: 'extract-pages-pdf', name: 'ページ抽出', desc: '選択したページから新しいPDFを作成。', icon: 'fileStack', hash: 'extract-pages' }
        ]
    },
    {
        name: "データ & 変換",
        icon: "catData",
        tools: [
            { id: 'tables-pdf', name: '表データ変換', desc: 'Excel/CSVを構造化されたPDFの表に変換。', icon: 'table', hash: 'tables' },
            { id: 'ocr-pdf', name: 'スマートOCR', desc: 'Tesseractを使用してスキャンからテキストを抽出。', icon: 'scanText', hash: 'ocr' },
            { id: 'pdf-to-word', name: 'PDFからWord', desc: 'PDFを編集可能なDOCXファイルに変換。', icon: 'fileText', hash: 'pdf-to-word' },
            { id: 'word-to-pdf', name: 'WordからPDF', desc: 'Word文書からPDFを作成。', icon: 'fileOutput', hash: 'word-to-pdf' },
            { id: 'images-to-pdf', name: '画像からPDF', desc: 'JPG/PNGをPDFドキュメントに変換。', icon: 'images', hash: 'images-to-pdf' },
            { id: 'pdf-to-images', name: 'PDFから画像', desc: 'ページを高品質な画像として保存。', icon: 'image', hash: 'pdf-to-images' },
            { id: 'extract-images-pdf', name: '画像抽出', desc: 'PDFファイルからすべての画像を抽出。', icon: 'extract', hash: 'extract-images' }
        ]
    },
    {
        name: "セキュリティ",
        icon: "catSecurity",
        tools: [
            { id: 'protect-pdf', name: 'PDF保護', desc: 'AES-256標準でドキュメントを暗号化。', icon: 'shield', hash: 'protect' }
        ]
    }
];
export const UI_LABELS_JA = {
    freeBadge: "無料サンドボックス Beta",
    launchStudio: "スタジオを起動 🚀",
    keyFeatures: "主な機能",
    howItWorks: "利用手順",
    privacyTitle: "100% プライバシー保護:",
    privacyDesc: "ファイルがデバイス外に送信されることはありません。すべての処理はブラウザの安全なメモリ内で行われます。",
    faqHeader: "よくある質問",
    techHeader: "技術アーキテクチャ: 仕組みについて",
    relatedHeader: "関連するPDFツール",
    viewAll: "すべてのツールを見る →",
    homeLabel: "ホーム",
    toolsLabel: "ツール",
    defaultFaqs: [
        {
            question: "ファイルはサーバーにアップロードされますか？",
            answer: "<strong>いいえ、一度もありません。</strong> すべての処理はブラウザ内で100%ローカルに実行されます。ファイルはデバイス内に留まるため、完全なプライバシーとセキュリティが保証されます。"
        },
        {
            question: "ファイルサイズに制限はありますか？",
            answer: "人為的な制限はありません。唯一の制約は、お使いのデバイスの利用可能なメモリ量です。最近のPCやスマートフォンであれば、大きなPDFファイルも問題なく処理できます。"
        },
        {
            question: "モバイルデバイスでも動作しますか？",
            answer: "はい！LocalPDF Sanctuaryは完全にレスポンシブで、iOS、Android、タブレット上のあらゆる最新Webブラウザで動作します。"
        }
    ],
    defaultTechInfo: [
        {
            title: "ゼロ知識アーキテクチャ",
            description: "データが他人に閲覧されることのないように設計されています。処理はブラウザの安全なメモリ空間内で行われます。"
        },
        {
            title: "WebAssemblyによる高速処理",
            description: "高性能なWebAssemblyモジュールを使用することで、デスクトップアプリ並みのPDF処理速度をブラウザ上で直接実現しています。"
        }
    ]
};
