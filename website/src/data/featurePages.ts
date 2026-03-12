export interface FeaturePageData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  socialImage?: string;
  intro: string;
  appHash: string;
  eyebrow: string;
  capabilities: string[];
  whyLocal: string[];
  howItWorks: string[];
  useCases: string[];
  proofTitle: string;
  proofBody: string;
  objectionTitle: string;
  objectionBody: string;
  ctaNote: string;
  quickAnswers: Array<{
    question: string;
    answer: string;
  }>;
  blogLinks?: Array<{
    href: string;
    title: string;
  }>;
}

export const featurePages: FeaturePageData[] = [
  {
    slug: 'edit-pdf',
    title: 'Edit PDF locally without handing the file to a cloud tool',
    metaTitle: 'Edit PDF Locally Without Uploading Files | LocalPDF',
    metaDescription: 'Edit PDF text, overlays, and sensitive sections locally with LocalPDF. Change PDFs without sending the document through an upload-first editor.',
    socialImage: 'https://localpdf.online/og/edit-pdf.svg',
    intro: 'Use LocalPDF when you need to change a PDF directly without sending a sensitive file through an upload-first editor.',
    appHash: 'edit-text',
    eyebrow: 'Edit PDF',
    capabilities: [
      'Replace or cover existing text in a PDF',
      'Add labels, notes, and lightweight overlays',
      'Work on sensitive documents without pushing files to a remote editor',
    ],
    whyLocal: [
      'Contracts, invoices, and internal PDFs often are better kept out of cloud editors.',
      'Starting locally removes upload delay and narrows exposure for sensitive files.',
      'The workflow feels closer to an app than a disposable browser utility.',
    ],
    howItWorks: [
      'Open the editor from LocalPDF.',
      'Select the PDF from your device.',
      'Adjust text or overlays, preview the result, then export the updated file.',
    ],
    useCases: [
      'Fix a typo in a signed internal document copy',
      'Cover sensitive fields before sharing a PDF externally',
      'Add internal review notes to a draft document',
    ],
    proofTitle: 'Edit sensitive PDFs with more control',
    proofBody: 'When a document contains names, addresses, pricing, or legal text, local editing is easier to justify and easier to trust than an upload-first editor.',
    objectionTitle: 'Why users choose local editing',
    objectionBody: 'People want a direct way to change the PDF itself without sending the file through extra tools or an upload-first handoff.',
    ctaNote: 'Open the editor when the job is to change the PDF itself, not to re-route the document into another stack.',
    quickAnswers: [
      {
        question: 'When is this page the right fit?',
        answer: 'When the document already exists as a PDF and the job is to change, cover, or annotate parts of that file directly.',
      },
      {
        question: 'Why does local editing matter more here?',
        answer: 'Editing often touches names, pricing, addresses, signatures, and legal text. That is exactly where users question upload-first tools.',
      },
      {
        question: 'What should the page avoid promising?',
        answer: 'A clear editing workflow for changing, covering, or annotating a PDF directly.',
      },
    ],
    blogLinks: [
      { href: '/blog/edit-text-in-pdf-guide', title: 'How to Edit Text in PDF Files' },
      { href: '/blog/pdf-security-best-practices', title: 'PDF Security Best Practices' },
    ],
  },
  {
    slug: 'merge-pdf',
    title: 'Merge PDF files locally and keep ordering work fast',
    metaTitle: 'Merge PDF Files Locally and Keep Order Under Control | LocalPDF',
    metaDescription: 'Merge PDF files locally with LocalPDF. Combine documents quickly without upload-first processing or scattered browser tools.',
    socialImage: 'https://localpdf.online/og/merge-pdf.svg',
    intro: 'Merge is one of the highest-usage PDF jobs. It should be immediate, not gated by upload time and queueing.',
    appHash: 'merge',
    eyebrow: 'Merge PDF',
    capabilities: [
      'Combine multiple PDF files into one output',
      'Reorder before export',
      'Keep the merge flow inside the LocalPDF workspace',
    ],
    whyLocal: [
      'Large attachments waste time when every merge starts with upload and wait states.',
      'Teams often merge sensitive pages like contracts, invoices, and scans.',
      'A local merge flow is easier to trust and easier to repeat.',
    ],
    howItWorks: [
      'Open Merge PDF.',
      'Add the source files from your device.',
      'Review the order and export the merged PDF.',
    ],
    useCases: [
      'Bundle a contract with appendices',
      'Assemble a client handoff packet',
      'Merge batch scans into a single review file',
    ],
    proofTitle: 'Merge files quickly without extra waiting',
    proofBody: 'This is a core utility flow. The operation starts from your device and stays under your control.',
    objectionTitle: 'Why users choose LocalPDF for merge',
    objectionBody: 'People want merge to feel immediate, dependable, and easy to repeat inside one app workflow.',
    ctaNote: 'Open Merge PDF when the task is bundling source files quickly without wasting time on upload delay and queueing.',
    quickAnswers: [
      {
        question: 'What is the actual job here?',
        answer: 'Combine several PDFs into one clean output without breaking momentum or re-uploading files into a queue-shaped web flow.',
      },
      {
        question: 'Why is merge still a trust page?',
        answer: 'Merge often involves contracts, scanned records, internal packets, or invoices. The documents may be routine, but they are rarely disposable.',
      },
      {
        question: 'What should make this page convert?',
        answer: 'A fast path from source files to one clean output with clear ordering and export.',
      },
    ],
    blogLinks: [
      { href: '/blog/how-to-merge-pdf-files', title: 'How to Merge PDF Files' },
      { href: '/blog/smart-merge-ai-pdf-sorting', title: 'Smart Merge: AI-Powered PDF Sorting' },
    ],
  },
  {
    slug: 'ocr-pdf',
    title: 'Run OCR on PDF documents locally for searchable text',
    metaTitle: 'OCR PDF Locally for Searchable Scanned Documents | LocalPDF',
    metaDescription: 'Run OCR on PDF files locally with LocalPDF and turn scans into searchable documents without sending them away first.',
    socialImage: 'https://localpdf.online/og/ocr-pdf.svg',
    intro: 'OCR is a trust-heavy workflow because scanned PDFs often contain legal, medical, or financial information.',
    appHash: 'ocr',
    eyebrow: 'OCR PDF',
    capabilities: [
      'Extract text from scanned PDFs',
      'Produce searchable document output',
      'Keep OCR work close to the original file source',
    ],
    whyLocal: [
      'Scanned records are often the documents users least want to upload.',
      'OCR already takes time; upload overhead makes the flow worse.',
      'A local-first OCR workflow is easier to trust when scanned files contain sensitive information.',
    ],
    howItWorks: [
      'Open OCR PDF in LocalPDF.',
      'Load a scanned PDF.',
      'Run OCR and export the searchable result.',
    ],
    useCases: [
      'Make a scanned agreement searchable',
      'Extract text from archive documents',
      'Prepare image-heavy PDFs for internal search and reuse',
    ],
    proofTitle: 'Turn scans into searchable PDFs with less exposure',
    proofBody: 'OCR is a trust-heavy workflow because scanned documents often contain sensitive information. Users need a clear path from scan to searchable output.',
    objectionTitle: 'What users are worried about',
    objectionBody: 'Scanned PDFs are often the files users most hesitate to upload. That concern needs a direct answer, without decorative language.',
    ctaNote: 'Open OCR PDF when a scanned document needs to become usable, searchable, and easier to work with.',
    quickAnswers: [
      {
        question: 'Why is OCR a high-trust workflow?',
        answer: 'Scanned contracts, records, forms, and archive files are often the last documents users want to send away before they even know the result quality.',
      },
      {
        question: 'What should the user understand fast?',
        answer: 'That OCR here is a practical step to make a scanned PDF searchable and usable.',
      },
      {
        question: 'What should this page emphasize?',
        answer: 'Searchable output, local workflow, and the fact that scanned documents are often sensitive by default.',
      },
    ],
    blogLinks: [
      { href: '/blog/ocr-pdf-extract-text', title: 'OCR PDF: Extract Text from Scanned Documents' },
      { href: '/blog/pdf-security-best-practices', title: 'PDF Security Best Practices' },
    ],
  },
  {
    slug: 'compress-pdf',
    title: 'Compress PDF files locally before sending or archiving them',
    metaTitle: 'Compress PDF Files Locally Before Sending or Uploading | LocalPDF',
    metaDescription: 'Compress PDF files locally with LocalPDF before sharing, uploading, or archiving large documents.',
    socialImage: 'https://localpdf.online/og/compress-pdf.svg',
    intro: 'Compression is a practical workflow. It should be fast, predictable, and not require an upload loop before you can send a file.',
    appHash: 'compress',
    eyebrow: 'Compress PDF',
    capabilities: [
      'Reduce PDF size before sharing',
      'Handle bulky documents in a local workflow',
      'Prepare PDFs for email, form portals, and archives',
    ],
    whyLocal: [
      'A lot of compression jobs happen right before a user needs to send the file somewhere else.',
      'If the source document is sensitive, upload-first compression adds friction and risk.',
      'Compression is easier to trust when the product explains its limits honestly.',
    ],
    howItWorks: [
      'Open Compress PDF.',
      'Load the source document.',
      'Run compression and export the smaller version.',
    ],
    useCases: [
      'Reduce attachment size for email',
      'Prepare documents for strict upload portals',
      'Trim archive copies before storing them internally',
    ],
    proofTitle: 'Make PDFs smaller before the next handoff',
    proofBody: 'Users care about a smaller file that is easier to send, upload, or archive without adding another waiting loop.',
    objectionTitle: 'Why users open Compress PDF',
    objectionBody: 'The value is practical: reduce file size, keep the workflow moving, and prepare the document for the next step.',
    ctaNote: 'Open Compress PDF when the document is ready but still too heavy for the next step in the workflow.',
    quickAnswers: [
      {
        question: 'What is the outcome users care about?',
        answer: 'A smaller file that is easier to send, upload, or archive without turning compression into a separate waiting loop.',
      },
      {
        question: 'Why keep this page simple?',
        answer: 'Compression converts poorly when the messaging is vague. Users want to know the next handoff becomes easier.',
      },
      {
        question: 'What should this route avoid?',
        answer: 'Overclaiming around image quality, AI, or impossible size reduction promises.',
      },
    ],
    blogLinks: [
      { href: '/blog/compress-pdf-without-losing-quality', title: 'How to Compress PDF Files Without Losing Quality' },
      { href: '/blog/how-to-merge-pdf-files', title: 'How to Merge PDF Files' },
    ],
  },
  {
    slug: 'split-pdf',
    title: 'Split PDF files locally when one document needs to become several',
    metaTitle: 'Split PDF Files Locally by Pages or Ranges | LocalPDF',
    metaDescription: 'Split PDF files locally with LocalPDF for cleaner handoffs, extraction, and document reuse.',
    socialImage: 'https://localpdf.online/og/split-pdf.svg',
    intro: 'Split workflows are common in operations and document review. They should feel direct and controlled.',
    appHash: 'split',
    eyebrow: 'Split PDF',
    capabilities: [
      'Break a PDF into smaller outputs',
      'Extract sections for sharing or filing',
      'Keep structural document work inside the LocalPDF app',
    ],
    whyLocal: [
      'Users often split documents specifically to share less, not more.',
      'A local split flow reinforces that selective sharing can start before any upload.',
      'The job is operational and should feel low-friction.',
    ],
    howItWorks: [
      'Open Split PDF.',
      'Choose the pages or ranges you need.',
      'Export the new files.',
    ],
    useCases: [
      'Separate a signed page from a contract package',
      'Break a long report into sections',
      'Extract only the pages needed for external review',
    ],
    proofTitle: 'Split pages before you share them',
    proofBody: 'Splitting is often about control: separate what needs to be sent, keep the rest private, and export only the pages that matter.',
    objectionTitle: 'Why users choose local splitting',
    objectionBody: 'Users often split documents to share less information, not more. That makes control and clarity more important than flashy messaging.',
    ctaNote: 'Open Split PDF when one large document needs to become several smaller outputs under your control.',
    quickAnswers: [
      {
        question: 'What is the user trying to control?',
        answer: 'Which pages leave the original file, which pages stay private, and how the output is shared afterwards.',
      },
      {
        question: 'Why does local-first help here?',
        answer: 'The split often happens specifically to reduce exposure before any later upload or external handoff.',
      },
      {
        question: 'What should the page make clear?',
        answer: 'That the job is selective extraction and cleaner sharing, not just mechanical page separation.',
      },
    ],
    blogLinks: [
      { href: '/blog/how-to-split-pdf-files', title: 'How to Split PDF Files' },
      { href: '/blog/smart-organize-ai-page-analysis', title: 'Smart Organize: AI-Powered PDF Page Analysis' },
    ],
  },
  {
    slug: 'sign-pdf',
    title: 'Sign PDF documents locally and keep approval flows simple',
    metaTitle: 'Sign PDF Documents Locally for Faster Approvals | LocalPDF',
    metaDescription: 'Sign PDF documents locally with LocalPDF for quick approvals and lightweight document workflows.',
    socialImage: 'https://localpdf.online/og/sign-pdf.svg',
    intro: 'Signing is a trust-sensitive workflow because signatures are personal, reusable, and easy to mishandle in weak tools.',
    appHash: 'sign',
    eyebrow: 'Sign PDF',
    capabilities: [
      'Place a signature into a PDF workflow',
      'Handle quick approvals without bouncing between tools',
      'Keep signature placement inside the LocalPDF app',
    ],
    whyLocal: [
      'Users are cautious with signatures even when the document itself is routine.',
      'A local flow is easier to explain than a service that asks for upload first.',
      'Signing should be fast, narrow, and under user control.',
    ],
    howItWorks: [
      'Open Sign PDF.',
      'Choose the source file and place the signature.',
      'Export the signed version.',
    ],
    useCases: [
      'Sign a vendor form quickly',
      'Approve a simple internal document',
      'Complete a PDF workflow without printing and rescanning',
    ],
    proofTitle: 'Sign PDFs with a shorter path to approval',
    proofBody: 'Signing works best when the workflow stays simple: open the document, place the signature, and export the result without bouncing between tools.',
    objectionTitle: 'Why users choose LocalPDF for signing',
    objectionBody: 'The value is a simple signing flow that stays close to the document and removes unnecessary steps between review and completion.',
    ctaNote: 'Open Sign PDF when the job is quick approval, lightweight signature placement, and a shorter path from document to completion.',
    quickAnswers: [
      {
        question: 'What is the page really selling?',
        answer: 'A simpler path from document to signed output when the user needs a lightweight approval step.',
      },
      {
        question: 'Why stay careful with the copy?',
        answer: 'Signature workflows can easily drift into legal overclaiming. Keep the page grounded in product behavior, not legal theater.',
      },
      {
        question: 'What should make users trust it?',
        answer: 'A direct local flow, clear limits, and less bouncing between unrelated PDF utilities.',
      },
    ],
    blogLinks: [
      { href: '/blog/how-to-sign-pdf-digitally', title: 'How to Sign PDF Documents Digitally' },
      { href: '/blog/pdf-security-best-practices', title: 'PDF Security Best Practices' },
    ],
  },
  {
    slug: 'convert-pdf',
    title: 'Convert PDFs and related document formats in one local workflow',
    metaTitle: 'Convert PDF and Document Formats in One Local Workflow | LocalPDF',
    metaDescription: 'Convert PDFs and related document formats in one LocalPDF workflow instead of jumping between separate one-off tools.',
    socialImage: 'https://localpdf.online/og/convert-pdf.svg',
    intro: 'Use Convert PDF when you need to move a document into the right format without leaving the main workflow.',
    appHash: 'pdf-to-word',
    eyebrow: 'Convert PDF',
    capabilities: [
      'Handle common PDF conversion workflows in one place',
      'Move between formats without leaving the product workflow',
      'Start conversion from one clear entry point inside the app',
    ],
    whyLocal: [
      'Conversion is often part of a larger document workflow, not a one-off task.',
      'A clear conversion entry point helps users choose the right next step faster.',
      'The product should feel like one workspace, not a maze of separate tools.',
    ],
    howItWorks: [
      'Open Convert PDF.',
      'Choose the source format and target output path inside the app flow.',
      'Review and export the converted result.',
    ],
    useCases: [
      'Prepare a PDF for editable reuse',
      'Generate a PDF from a document source',
      'Move between document and image-based workflows',
    ],
    proofTitle: 'Choose the right format and keep moving',
    proofBody: 'Conversion works best when users can pick the right path quickly and continue the broader document workflow without starting over.',
    objectionTitle: 'Why users open Convert PDF',
    objectionBody: 'Users want one clear place to start when the next step depends on changing the document format.',
    ctaNote: 'Open Convert PDF when the workflow is about moving between document formats without leaving the main LocalPDF product path.',
    quickAnswers: [
      {
        question: 'Why unify conversion into one page?',
        answer: 'Because users are choosing the right workflow for the job, not browsing a directory of lookalike conversion pages.',
      },
      {
        question: 'What does this help explain?',
        answer: 'That LocalPDF handles conversion as part of a wider document workflow rather than as an isolated task.',
      },
      {
        question: 'What should the page make easy?',
        answer: 'Choosing the right conversion path and moving straight into the app without second-guessing where to start.',
      },
    ],
    blogLinks: [
      { href: '/blog/convert-word-pdf-guide', title: 'How to Convert Word to PDF and PDF to Word' },
      { href: '/blog/convert-pdf-to-images-guide', title: 'How to Convert PDF to Images' },
    ],
  },
];

export function getFeaturePage(slug: string) {
  return featurePages.find((page) => page.slug === slug);
}
