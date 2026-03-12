export interface PdfParsedTextOperator {
  operator: 'Tj' | 'TJ';
  start: number;
  end: number;
  textSegments: string[];
  textMatrixX?: number;
  textMatrixY?: number;
  fontSize?: number;
}

interface Token {
  type: 'literal' | 'hex' | 'number' | 'array' | 'word';
  value: string | number | Token[];
  start: number;
  end: number;
}

function decodePdfHexString(hex: string): string {
  const normalized = hex.length % 2 === 0 ? hex : `${hex}0`;
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    const value = Number.parseInt(normalized.slice(i, i + 2), 16);
    bytes[i / 2] = Number.isFinite(value) ? value : 0x20;
  }
  return new TextDecoder('latin1').decode(bytes);
}

function decodePdfLiteralString(input: string): string {
  return input
    .replace(/\\n/gu, '\n')
    .replace(/\\r/gu, '\r')
    .replace(/\\t/gu, '\t')
    .replace(/\\b/gu, '\b')
    .replace(/\\f/gu, '\f')
    .replace(/\\\(/gu, '(')
    .replace(/\\\)/gu, ')')
    .replace(/\\\\/gu, '\\');
}

function isWhitespace(char: string): boolean {
  return char === ' ' || char === '\n' || char === '\r' || char === '\t' || char === '\f' || char === '\0';
}

function skipWhitespaceAndComments(content: string, cursor: number): number {
  let index = cursor;
  while (index < content.length) {
    const char = content[index];
    if (isWhitespace(char)) {
      index += 1;
      continue;
    }
    if (char === '%') {
      while (index < content.length && content[index] !== '\n' && content[index] !== '\r') {
        index += 1;
      }
      continue;
    }
    break;
  }
  return index;
}

function readLiteralToken(content: string, start: number): Token | null {
  let index = start + 1;
  let depth = 1;
  while (index < content.length) {
    const char = content[index];
    if (char === '\\') {
      index += 2;
      continue;
    }
    if (char === '(') {
      depth += 1;
      index += 1;
      continue;
    }
    if (char === ')') {
      depth -= 1;
      index += 1;
      if (depth === 0) {
        const raw = content.slice(start + 1, index - 1);
        return {
          type: 'literal',
          value: decodePdfLiteralString(raw),
          start,
          end: index,
        };
      }
      continue;
    }
    index += 1;
  }
  return null;
}

function readHexToken(content: string, start: number): Token | null {
  if (content[start + 1] === '<') {
    return null;
  }
  let index = start + 1;
  while (index < content.length && content[index] !== '>') {
    index += 1;
  }
  if (index >= content.length) {
    return null;
  }
  const raw = content.slice(start + 1, index);
  return {
    type: 'hex',
    value: decodePdfHexString(raw),
    start,
    end: index + 1,
  };
}

function readWordToken(content: string, start: number): Token {
  let index = start;
  while (index < content.length) {
    const char = content[index];
    if (isWhitespace(char) || char === '[' || char === ']' || char === '(' || char === ')' || char === '<' || char === '>') {
      break;
    }
    index += 1;
  }
  const raw = content.slice(start, index);
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/u.test(raw)) {
    return {
      type: 'number',
      value: Number.parseFloat(raw),
      start,
      end: index,
    };
  }
  return {
    type: 'word',
    value: raw,
    start,
    end: index,
  };
}

function readNextToken(content: string, cursor: number): Token | null {
  const start = skipWhitespaceAndComments(content, cursor);
  if (start >= content.length) {
    return null;
  }
  const char = content[start];
  if (char === '(') {
    return readLiteralToken(content, start);
  }
  if (char === '<') {
    return readHexToken(content, start);
  }
  if (char === '[') {
    let index = start + 1;
    const children: Token[] = [];
    while (index < content.length) {
      index = skipWhitespaceAndComments(content, index);
      if (index >= content.length) {
        return null;
      }
      if (content[index] === ']') {
        return {
          type: 'array',
          value: children,
          start,
          end: index + 1,
        };
      }
      const child = readNextToken(content, index);
      if (!child) {
        return null;
      }
      children.push(child);
      index = child.end;
    }
    return null;
  }
  if (char === ']') {
    return {
      type: 'word',
      value: ']',
      start,
      end: start + 1,
    };
  }
  return readWordToken(content, start);
}

function extractSegmentsFromArray(items: Token[]): string[] {
  const chunks: string[] = [];
  for (const token of items) {
    if (token.type === 'literal' || token.type === 'hex') {
      chunks.push(String(token.value));
    }
  }
  return chunks;
}

function getTrailingNumbers(operands: Token[], count: number): number[] | null {
  if (operands.length < count) {
    return null;
  }
  const tail = operands.slice(operands.length - count);
  if (tail.some((token) => token.type !== 'number')) {
    return null;
  }
  return tail.map((token) => Number(token.value));
}

export function parsePdfTextOperators(content: string): PdfParsedTextOperator[] {
  const operators: PdfParsedTextOperator[] = [];
  const operands: Token[] = [];
  let inTextObject = false;
  let textMatrixX: number | undefined;
  let textMatrixY: number | undefined;
  let textLeading = 0;
  let textFontSize: number | undefined;
  let cursor = 0;

  while (cursor < content.length) {
    const token = readNextToken(content, cursor);
    if (!token) {
      break;
    }

    cursor = token.end;
    if (token.type !== 'word') {
      operands.push(token);
      continue;
    }

    const op = String(token.value);
    if (op === 'BT') {
      inTextObject = true;
      textMatrixX = undefined;
      textMatrixY = undefined;
      textLeading = 0;
      textFontSize = undefined;
      operands.length = 0;
      continue;
    }
    if (op === 'ET') {
      inTextObject = false;
      operands.length = 0;
      continue;
    }
    if (!inTextObject) {
      operands.length = 0;
      continue;
    }

    if (op === 'Tm') {
      const values = getTrailingNumbers(operands, 6);
      if (values) {
        textMatrixX = values[4];
        textMatrixY = values[5];
      }
      operands.length = 0;
      continue;
    }

    if (op === 'Td' || op === 'TD') {
      const values = getTrailingNumbers(operands, 2);
      if (values) {
        const [tx, ty] = values;
        textMatrixX = (textMatrixX ?? 0) + tx;
        textMatrixY = (textMatrixY ?? 0) + ty;
        if (op === 'TD') {
          textLeading = -ty;
        }
      }
      operands.length = 0;
      continue;
    }

    if (op === 'TL') {
      const values = getTrailingNumbers(operands, 1);
      if (values) {
        textLeading = values[0];
      }
      operands.length = 0;
      continue;
    }

    if (op === 'T*') {
      textMatrixY = (textMatrixY ?? 0) - textLeading;
      operands.length = 0;
      continue;
    }

    if (op === 'Tf') {
      const values = getTrailingNumbers(operands, 1);
      if (values) {
        textFontSize = values[0];
      }
      operands.length = 0;
      continue;
    }

    if (op === 'Tj') {
      const last = operands[operands.length - 1];
      if (last && (last.type === 'literal' || last.type === 'hex')) {
        operators.push({
          operator: 'Tj',
          start: last.start,
          end: token.end,
          textSegments: [String(last.value)],
          textMatrixX,
          textMatrixY,
          fontSize: textFontSize,
        });
      }
      operands.length = 0;
      continue;
    }

    if (op === 'TJ') {
      const last = operands[operands.length - 1];
      if (last && last.type === 'array') {
        operators.push({
          operator: 'TJ',
          start: last.start,
          end: token.end,
          textSegments: extractSegmentsFromArray(last.value as Token[]),
          textMatrixX,
          textMatrixY,
          fontSize: textFontSize,
        });
      }
      operands.length = 0;
      continue;
    }

    operands.length = 0;
  }

  return operators;
}

export function extractPdfTextSegments(content: string): string[] {
  return parsePdfTextOperators(content)
    .flatMap((entry) => entry.textSegments)
    .map((part) => part.replace(/\s+/gu, ' ').trim())
    .filter(Boolean);
}
