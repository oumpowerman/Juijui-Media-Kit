/**
 * Generator for valid standalone PDF files
 * Creates real PDF binaries with valid headers, streams, xref tables and trailer
 */

function escapePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export interface SampleDoc {
  id: string;
  title: string;
  titleTh: string;
  category: string;
  categoryTh: string;
  filename: string;
  descriptionTh: string;
  pagesCount: number;
  tags: string[];
  suggestedQuestions: string[];
  pdfBase64: string;
}

function createSimplePdf(pages: { title: string; lines: string[] }[]): string {
  // Construct minimal valid PDF-1.4
  let objects: string[] = [];
  let pageObjectIds: number[] = [];

  // obj 1: Catalog (will point to obj 2 Pages)
  // obj 2: Pages
  // obj 3: Font
  // Then for each page: Page obj, Content obj

  let fontObjId = 3;
  let currentObjId = 4;

  let pageObjsData: { pageId: number; contentId: number; title: string; lines: string[] }[] = [];

  for (let i = 0; i < pages.length; i++) {
    const pageId = currentObjId++;
    const contentId = currentObjId++;
    pageObjectIds.push(pageId);
    pageObjsData.push({
      pageId,
      contentId,
      title: pages[i].title,
      lines: pages[i].lines,
    });
  }

  // Generate Catalog
  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`;
  // Generate Pages
  const kidsStr = pageObjectIds.map((id) => `${id} 0 R`).join(' ');
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [${kidsStr}] /Count ${pages.length} >>\nendobj`;
  // Generate Font
  const obj3 = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`;
  const objFontBody = `${currentObjId++} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`;
  const bodyFontId = currentObjId - 1;

  objects.push(obj1, obj2, obj3, objFontBody);

  for (const p of pageObjsData) {
    // Generate text stream for content
    let streamLines = [
      'BT',
      `/F1 18 Tf`,
      `50 740 Td`,
      `(${escapePdfText(p.title)}) Tj`,
      `0 -25 Td`,
      `/F2 11 Tf`,
    ];

    let currentYOffset = -18;
    for (const line of p.lines) {
      if (line.startsWith('## ')) {
        streamLines.push(`0 ${currentYOffset - 8} Td`);
        streamLines.push(`/F1 13 Tf`);
        streamLines.push(`(${escapePdfText(line.replace('## ', ''))}) Tj`);
        streamLines.push(`/F2 11 Tf`);
        streamLines.push(`0 -16 Td`);
      } else if (line.trim() === '') {
        streamLines.push(`0 -10 Td`);
      } else {
        streamLines.push(`(${escapePdfText(line)}) Tj`);
        streamLines.push(`0 -14 Td`);
      }
    }
    streamLines.push('ET');

    const streamContent = streamLines.join('\n');
    const contentObj = `${p.contentId} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj`;

    const pageObj = `${p.pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${p.contentId} 0 R /Resources << /Font << /F1 3 0 R /F2 ${bodyFontId} 0 R >> >> >>\nendobj`;

    objects.push(pageObj, contentObj);
  }

  // Build full PDF string with xref
  let pdf = `%PDF-1.4\n`;
  let offsets: number[] = [0];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += objects[i] + '\n';
  }

  const startxref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i <= objects.length; i++) {
    const off = offsets[i].toString().padStart(10, '0');
    pdf += `${off} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  // Encode to base64
  return btoa(unescape(encodeURIComponent(pdf)));
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'contract-sla',
    title: 'Enterprise Cloud SLA & Master Service Agreement',
    titleTh: 'สัญญาจ้างบริการคลาวด์และข้อตกลงระดับการให้บริการ (SLA)',
    category: 'Legal & Contract',
    categoryTh: 'สัญญาและกฎหมาย',
    filename: 'Master_Service_Agreement_SLA_2026.pdf',
    descriptionTh: 'สัญญาว่าจ้างบริการ Cloud Infrastructure กำหนด SLA 99.95%, เบี้ยปรับ, เงื่อนไขการชำระเงิน และการยกเลิกสัญญา',
    pagesCount: 2,
    tags: ['สัญญาจ้าง', 'SLA 99.95%', 'ค่าปรับ', 'ความลับ NDA'],
    suggestedQuestions: [
      'สัญญานี้มีข้อกำหนด SLA ความพร้อมใช้งานกี่เปอร์เซ็นต์?',
      'หากระบบล่มต่ำกว่าเกณฑ์ มีอัตราการจ่ายเงินชดเชย (Service Credit) อย่างไร?',
      'ระยะเวลาบอกเลิกสัญญาล่วงหน้าต้องทำก่อนกี่วัน?',
      'ค่าปรับกรณีผิดนัดชำระเงินคิดในอัตราเท่าไหร่?',
    ],
    pdfBase64: createSimplePdf([
      {
        title: 'MASTER SERVICE AGREEMENT & CLOUD SLA (PAGE 1/2)',
        lines: [
          'Effective Date: January 1, 2026 | Document ID: MSA-CLOUD-2026-889',
          'Between: ApexCloud Global Solutions Co., Ltd. (Provider)',
          'And: CyberTech Enterprise Public Co., Ltd. (Customer)',
          '',
          '## 1. SCOPE OF SERVICES & COMMITTED AVAILABILITY',
          '- Provider shall deliver High-Availability Managed Enterprise Cloud Infrastructure.',
          '- Monthly Guaranteed System Uptime: 99.95% measured 24x7x365 excluding maintenance.',
          '- Planned Scheduled Maintenance: Maximum 4 hours/month with 5 days advance notice.',
          '- Support Severity 1 (Critical Outage): Initial response within 15 minutes, 24/7.',
          '- Support Severity 2 (Major Degrade): Initial response within 60 minutes.',
          '',
          '## 2. SERVICE LEVEL CREDITS & PENALTIES',
          '- Uptime between 99.00% and 99.94%: 10% monthly service fee credit refunded.',
          '- Uptime between 95.00% and 98.99%: 25% monthly service fee credit refunded.',
          '- Uptime below 95.00%: 50% monthly service fee credit plus right to immediate termination.',
          '- Maximum cumulative credit per billing cycle is capped at 100% of the monthly recurring fee.',
          '',
          '## 3. PAYMENT TERMS & OVERDUE INTEREST',
          '- Total Monthly Recurring Charge (MRC): $45,000 USD billed in advance.',
          '- Payment due within 30 days from invoice date (Net 30 days).',
          '- Late payment penalty: Interest rate of 1.5% per month on overdue balances.',
          '- Provider may suspend non-critical services if payment is overdue beyond 45 days.',
        ],
      },
      {
        title: 'MASTER SERVICE AGREEMENT & CLOUD SLA (PAGE 2/2)',
        lines: [
          '## 4. DATA SECURITY, COMPLIANCE & CONFIDENTIALITY (NDA)',
          '- Provider warrants ISO 27001, SOC 2 Type II, and PDPA / GDPR compliance.',
          '- All Customer Data is encrypted at rest using AES-256 and in transit via TLS 1.3.',
          '- Confidentiality obligations shall survive termination for a period of five (5) years.',
          '- Security breach notification: Must notify Customer in writing within 24 hours of discovery.',
          '',
          '## 5. TERM AND TERMINATION CLAUSES',
          '- Initial Contract Term: Twenty-four (24) consecutive months.',
          '- Automatic Renewal: Renewed for 1-year terms unless 60 days advance written notice is served.',
          '- Termination for Convenience: Permitted with ninety (90) days prior written notice.',
          '- Termination for Cause: Immediately upon written notice if breach is not cured within 14 days.',
          '',
          '## 6. LIMITATION OF LIABILITY',
          '- Neither party shall be liable for indirect, incidental, or consequential damages.',
          '- Total aggregate liability capped at the total fees paid by Customer during past 12 months.',
          '- Signatures executed by authorized representatives on January 1, 2026.',
        ],
      },
    ]),
  },
  {
    id: 'financial-report',
    title: 'Apex Dynamics Q3 2026 Financial & AI Growth Report',
    titleTh: 'รายงานผลประกอบการไตรมาส 3/2026 และกลยุทธ์ AI',
    category: 'Finance & Strategy',
    categoryTh: 'การเงินและธุรกิจ',
    filename: 'ApexDynamics_Q3_2026_Earnings_Report.pdf',
    descriptionTh: 'รายงานผลการดำเนินงาน การเติบโตของรายได้ 38% สัดส่วนรายได้แยกตามกลุ่มผลิตภัณฑ์ และการลงทุนใน Generative AI',
    pagesCount: 2,
    tags: ['รายได้ 128 ล้านเหรียญ', 'กำไรสุทธิ', 'การเติบโต +38%', 'งบลงทุน AI'],
    suggestedQuestions: [
      'รายได้รวมใน Q3 2026 อยู่ที่เท่าไหร่ และเติบโตขึ้นกี่เปอร์เซ็นต์ YoY?',
      'กลุ่มธุรกิจใดสร้างสัดส่วนรายได้สูงสุด?',
      'EBITDA Margin ในไตรมาสนี้มีตัวเลขเท่าไหร่?',
      'บริษัทจัดสรรงบประมาณ R&D สำหรับเทคโนโลยี AI ไว้เท่าไหร่?',
    ],
    pdfBase64: createSimplePdf([
      {
        title: 'APEX DYNAMICS CORP. - Q3 2026 EARNINGS (PAGE 1/2)',
        lines: [
          'Published: October 15, 2026 | Ticker: APEX (Global Exchange)',
          'Investor Relations Quarterly Performance Summary',
          '',
          '## 1. FINANCIAL HIGHLIGHTS & KEY METRICS',
          '- Total Consolidated Revenue: $128.4 Million (+38.2% YoY growth from $92.9M).',
          '- Gross Profit: $87.3 Million (Gross Margin of 68.0% compared to 64.5% in Q3 2025).',
          '- Adjusted EBITDA: $37.2 Million (EBITDA Margin: 29.0%, an increase of 450 bps YoY).',
          '- GAAP Net Income: $24.8 Million, resulting in Diluted EPS of $0.62 per share.',
          '- Free Cash Flow (FCF): $31.5 Million with 127% cash conversion rate.',
          '',
          '## 2. REVENUE BREAKDOWN BY BUSINESS UNIT',
          '- Enterprise AI Platform & Agents: $54.2 Million (42.2% of total, +64% YoY).',
          '- Cloud Infrastructure & Data Lake: $41.0 Million (31.9% of total, +25% YoY).',
          '- Cybersecurity & Managed Services: $21.6 Million (16.8% of total, +18% YoY).',
          '- Professional Consulting & Integration: $11.6 Million (9.1% of total, +11% YoY).',
          '',
          '## 3. CUSTOMER ADOPTION & EXPANSION',
          '- Total Active Enterprise Customers: 1,420 companies (+210 net new in Q3).',
          '- Net Dollar Retention Rate (NDR): 132% driven by GenAI agent expansions.',
          '- Customers generating >$100k ARR increased by 44% YoY to 345 accounts.',
        ],
      },
      {
        title: 'APEX DYNAMICS CORP. - STRATEGY & GUIDANCE (PAGE 2/2)',
        lines: [
          '## 4. CAPITAL ALLOCATION & GENAI R&D ROADMAP',
          '- Dedicated R&D Expenditure: $28.5 Million (22.2% of Q3 revenue).',
          '- 65% of R&D capital invested directly into Autonomous Multimodal Agents.',
          '- Expansion of Asian Cloud Datacenter hub in Bangkok and Singapore ($18M CapEx).',
          '- Cash and marketable securities standing at $310 Million with zero debt.',
          '',
          '## 5. FULL YEAR 2026 REVISED OUTLOOK & GUIDANCE',
          '- Full Year FY2026 Projected Revenue: $495M - $505M (raised from previous $470M).',
          '- Full Year Projected EBITDA: $140M - $145M representing 28.5% margin.',
          '- Targeted ARR by end of FY2026: $540 Million with over 1,600 enterprise clients.',
          '- Dividend announcement: Special dividend of $0.15/share approved by Board.',
          '',
          'Prepared by: Office of Chief Financial Officer (CFO) and VP Investor Relations',
        ],
      },
    ]),
  },
  {
    id: 'research-ai-medicine',
    title: 'Multimodal AI in Oncology Diagnostics: A Multi-Center Study',
    titleTh: 'งานวิจัย: การประยุกต์ใช้ Multimodal AI ในการตรวจวินิจฉัยมะเร็งปอด',
    category: 'Healthcare & Science',
    categoryTh: 'การแพทย์และวิจัย',
    filename: 'Multimodal_AI_Oncology_Diagnostics_2026.pdf',
    descriptionTh: 'รายงานการวิจัยทดลองทางคลินิก เปรียบเทียบความแม่นยำของ AI กับรังสีแพทย์ผู้เชี่ยวชาญจาก 12 สถาบันการแพทย์',
    pagesCount: 2,
    tags: ['ความแม่นยำ 98.4%', 'CT Scans 45,000 ภาพ', 'Sensitivity 97.2%', 'Clinical Trial'],
    suggestedQuestions: [
      'ความแม่นยำ (Accuracy) และ AUC ของโมเดล AI ในงานวิจัยนี้มีค่าเท่าใด?',
      'จำนวนภาพ CT Scan และกลุ่มตัวอย่างผู้ป่วยที่ใช้ในการทดลองมีกี่เคส?',
      'AI ช่วยลดเวลาในการวินิจฉัย (Turnaround Time) ได้กี่เปอร์เซ็นต์?',
      'ข้อจำกัดของงานวิจัยชิ้นนี้มีอะไรบ้าง?',
    ],
    pdfBase64: createSimplePdf([
      {
        title: 'MULTIMODAL AI IN ONCOLOGY DIAGNOSTICS (PAGE 1/2)',
        lines: [
          'Journal of Clinical AI & Diagnostic Informatics | Vol. 14, October 2026',
          'Authors: Dr. Emily Vance, MD, PhD; Prof. Somchai Prasert, PhD; Dr. H. Zhang, MD',
          '',
          '## ABSTRACT & STUDY OBJECTIVE',
          '- Investigating deep multimodal foundation models combining CT imaging and genomic markers.',
          '- Objective: Early detection of Stage I/II non-small cell lung carcinoma (NSCLC).',
          '- Multi-center cohort study conducted across 12 university hospitals (2024-2026).',
          '- Dataset: 45,200 chest computed tomography (CT) scans from 18,450 diverse patients.',
          '',
          '## DIAGNOSTIC PERFORMANCE & BENCHMARKS',
          '- Overall AI Model Accuracy: 98.4% (95% CI: 97.8% - 98.9%).',
          '- Area Under Receiver Operating Characteristic Curve (ROC-AUC): 0.992.',
          '- Diagnostic Sensitivity: 97.2% compared to 88.5% for general board-certified radiologists.',
          '- Diagnostic Specificity: 98.1% compared to 92.3% for standard dual-radiologist consensus.',
          '- False Positive Rate reduced by 64% when radiologists were assisted by the AI co-pilot.',
          '',
          '## CLINICAL EFFICIENCY & TIME REDUCTION',
          '- Median scan interpretation time decreased from 14.2 minutes to 3.8 minutes (-73%).',
          '- Critical findings flagged within 45 seconds for emergent oncology triage.',
        ],
      },
      {
        title: 'MULTIMODAL AI IN ONCOLOGY DIAGNOSTICS (PAGE 2/2)',
        lines: [
          '## METHODOLOGY & MODEL ARCHITECTURE',
          '- 3D Vision-Language Transformer trained with supervised fine-tuning and contrastive loss.',
          '- Preprocessing: Slice normalization, automated lung parenchyma segmentation at 1mm.',
          '- Zero-shot capability evaluated on external independent test set of 3,200 unlabelled scans.',
          '',
          '## STUDY LIMITATIONS & ETHICAL CONSIDERATIONS',
          '- Limitation 1: Reduced sensitivity observed in patients with severe pulmonary fibrosis.',
          '- Limitation 2: Computational requirement necessitates on-premises GPU cluster or edge server.',
          '- Algorithmic bias analysis demonstrated parity across male (49.8%) and female (50.2%) cohorts.',
          '',
          '## CONCLUSION & RECOMMENDATIONS',
          '- Multimodal AI significantly enhances early cancer detection rates with minimal false alarms.',
          '- Recommended for Phase III prospective integration into national screening programs.',
          '- Funding received from Global Health AI Consortium and Department of Medical Sciences.',
        ],
      },
    ]),
  },
  {
    id: 'cybersecurity-policy',
    title: 'Enterprise Cyber Defense & AI Governance Policy 2026',
    titleTh: 'นโยบายความมั่นคงปลอดภัยไซเบอร์และการกำกับดูแล AI องค์กร',
    category: 'Security & Policy',
    categoryTh: 'ความปลอดภัยไซเบอร์',
    filename: 'Cybersecurity_and_AI_Governance_Policy.pdf',
    descriptionTh: 'กฎระเบียบความปลอดภัย การใช้งานรหัสผ่าน MFA การป้องกันข้อมูลรั่วไหล และกรอบการใช้งาน Generative AI ภายในบริษัท',
    pagesCount: 2,
    tags: ['นโยบายไซเบอร์', 'MFA บังคับใช้', 'ห้ามป้อนข้อมูลลับ', 'แจ้งเหตุ 2 ชม.'],
    suggestedQuestions: [
      'ข้อกำหนดความยาวและความซับซ้อนของรหัสผ่านตามนโยบายนี้คืออะไร?',
      'นโยบายอนุญาตให้ใช้ Public AI Tools ในกรณีใดบ้าง และมีข้อห้ามอะไร?',
      'เมื่อตรวจพบเหตุการณ์ข้อมูลรั่วไหล (Data Breach) พนักงานต้องรายงานภายในกี่ชั่วโมง?',
      'อุปกรณ์ส่วนตัว (BYOD) ต้องติดตั้งโปรแกรมใดก่อนเข้าถึงเครือข่ายบริษัท?',
    ],
    pdfBase64: createSimplePdf([
      {
        title: 'ENTERPRISE CYBER DEFENSE & AI GOVERNANCE (PAGE 1/2)',
        lines: [
          'Security Policy Directive 2026-V4 | Approved by Chief Information Security Officer (CISO)',
          'Applicability: All full-time employees, contractors, third-party vendors, and interns.',
          '',
          '## 1. IDENTITY ACCESS MANAGEMENT (IAM) & PASSWORDS',
          '- Multi-Factor Authentication (MFA) is strictly mandatory on all accounts without exception.',
          '- Hardware security keys (FIDO2 / WebAuthn) required for administrators and cloud operators.',
          '- Password Policy: Minimum 16 characters comprising upper, lower, numbers, and symbols.',
          '- Password rotation is not required unless compromise is suspected or detected.',
          '- Session timeout: Inactive work sessions shall automatically lock after 15 minutes.',
          '',
          '## 2. GENERATIVE AI & LLM ACCEPTABLE USE DIRECTIVE',
          '- PROHIBITED: Uploading Source Code, Customer PII, Financials, or Trade Secrets to public LLMs.',
          '- ALLOWED: Only corporate-approved AI gateways with zero-retention enterprise agreements.',
          '- All AI-generated customer-facing code or content must undergo human-in-the-loop review.',
          '- Prompt injections and unauthorized scraping through company systems are subject to dismissal.',
          '',
          '## 3. DEVICE & ENDPOINT SECURITY (BYOD / REMOTE)',
          '- Company-managed Mobile Device Management (MDM) profile must be installed on all BYOD.',
          '- Full disk encryption (FileVault / BitLocker) required on all mobile workstations.',
          '- Direct connections to public unsecured Wi-Fi prohibited without active Enterprise VPN.',
        ],
      },
      {
        title: 'ENTERPRISE CYBER DEFENSE & AI GOVERNANCE (PAGE 2/2)',
        lines: [
          '## 4. DATA CLASSIFICATION & TRANSMISSION',
          '- Level 1: Public | Level 2: Internal Business | Level 3: Confidential | Level 4: Restricted.',
          '- Level 3 and 4 data requires end-to-end encryption and watermarking upon export.',
          '- External USB storage devices are blocked via endpoint DLP agent.',
          '',
          '## 5. INCIDENT RESPONSE & MANDATORY REPORTING',
          '- Suspected Phishing / Malware: Report immediately via the internal Security Alert button.',
          '- Confirmed Data Breach: Mandatory notification to SOC team within TWO (2) hours.',
          '- SOC Hotline: 24/7 internal ext. 9911 or secure email security-incident@company.local.',
          '- Non-retaliation policy for good-faith reporting of operational errors or misconfigurations.',
          '',
          '## 6. SANCTIONS & DISCIPLINARY ACTIONS',
          '- Willful violation of Level 4 data policies results in immediate suspension and legal prosecution.',
          '- Annual security refresher course completion required by November 30 each calendar year.',
        ],
      },
    ]),
  },
];
