import type { SVGProps } from 'react';
import {
  Upload,
  Play,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Merge,
  Split,
  Shrink,
  Unlock,
  FileMinus,
  ScanText,
  Image,
  FileText,
  Lock,
  RotateCcw,
  Table,
  Wrench,
  MousePointer2,
  Type,
  Edit2,
  Shapes,
  Eraser,
  Check,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Minus,
  Menu,
  Maximize,
  MoveHorizontal,
  MoveVertical,
  PenTool,
  Highlighter,
  FileSignature,
  Copy,
  Stamp
} from 'lucide-react';

export type LinearIconName =
  | 'upload'
  | 'play'
  | 'download'
  | 'chevron-up'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'refresh'
  | 'x'
  | 'merge'
  | 'split'
  | 'compress'
  | 'unlock'
  | 'delete-pages'
  | 'ocr'
  | 'image'
  | 'word'
  | 'lock'
  | 'rotate'
  | 'excel'
  | 'tool'
  | 'cursor'
  | 'text'
  | 'edit'
  | 'shape'
  | 'eraser'
  | 'check'
  | 'bold'
  | 'italic'
  | 'align-left'
  | 'align-center'
  | 'align-right'
  | 'plus'
  | 'minus'
  | 'menu'
  | 'maximize'
  | 'move-horizontal'
  | 'move-vertical'
  | 'signature'
  | 'highlighter'
  | 'pen-tool'
  | 'file-input'
  | 'feather'
  | 'stamp'
  | 'copy';

interface LinearIconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  name: LinearIconName;
  size?: number | string;
}

const iconMap: Record<LinearIconName, React.FC<any>> = {
  upload: Upload,
  play: Play,
  download: Download,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  refresh: RefreshCw,
  x: X,
  merge: Merge,
  split: Split,
  compress: Shrink,
  unlock: Unlock,
  'delete-pages': FileMinus,
  ocr: ScanText,
  image: Image,
  word: FileText,
  lock: Lock,
  rotate: RotateCcw,
  excel: Table,
  tool: Wrench,
  cursor: MousePointer2,
  text: Type,
  edit: Edit2,
  shape: Shapes,
  eraser: Eraser,
  check: Check,
  bold: Bold,
  italic: Italic,
  'align-left': AlignLeft,
  'align-center': AlignCenter,
  'align-right': AlignRight,
  plus: Plus,
  minus: Minus,
  menu: Menu,
  maximize: Maximize,
  'move-horizontal': MoveHorizontal,
  'move-vertical': MoveVertical,
  signature: FileSignature,
  highlighter: Highlighter,
  'pen-tool': PenTool,
  'file-input': FileText, // Alias
  feather: PenTool, // Alias
  stamp: Stamp,
  copy: Copy
};

export function LinearIcon({ name, size, ...props }: LinearIconProps): JSX.Element {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    return <></>;
  }

  const width = size ?? props.width ?? 24;
  const height = size ?? props.height ?? 24;

  return (
    <IconComponent
      aria-hidden="true"
      {...props}
      size={Math.max(Number(width), Number(height))}
    />
  );
}
