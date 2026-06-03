/**
 * pdfReport.js — FakeProof Labs
 * Client-side PDF forensic report generator using jsPDF.
 * Includes Grad-CAM score and branding for FakeProof Labs.
 */

import { jsPDF } from 'jspdf';

/* ── Colour palette ── */
const C = {
  bg:     [10,  10,  15],
  card:   [20,  20,  40],
  border: [58,  58,  92],
  white:  [255, 255, 255],
  cyan:   [0,   212, 255],
  green:  [0,   255, 136],
  red:    [255, 51,  102],
  muted:  [136, 136, 187],
  dimmed: [90,  90,  138],
  purple: [124, 58,  237],
};

const setFill   = (doc, arr) => doc.setFillColor(...arr);
const setStroke = (doc, arr) => doc.setDrawColor(...arr);
const setTxt    = (doc, arr) => doc.setTextColor(...arr);

const roundRect = (doc, x, y, w, h, r, fill, stroke) => {
  if (fill)   { setFill(doc, fill);     doc.roundedRect(x, y, w, h, r, r, 'F'); }
  if (stroke) { setStroke(doc, stroke); doc.roundedRect(x, y, w, h, r, r, 'S'); }
};

const divider = (doc, y) => {
  setStroke(doc, C.border);
  doc.setLineWidth(0.3);
  doc.line(14, y, 196, y);
};

/* ── Main export ── */
export const generateForensicReport = async (result, imageDataUrl) => {
  const {
    prediction,
    confidence,
    processing_time,
    ai_analysis,
    gemini_powered,
    gradcam_score,
  } = result;

  const isFake    = prediction === 'Fake';
  const accentCol = isFake ? C.red : C.green;
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  /* Background */
  setFill(doc, C.bg);
  doc.rect(0, 0, W, H, 'F');

  /* Grid */
  doc.setLineWidth(0.1);
  setStroke(doc, [20, 20, 40]);
  for (let x = 0; x <= W; x += 10) doc.line(x, 0, x, H);
  for (let y = 0; y <= H; y += 10) doc.line(0, y, W, y);

  /* Top accent bar — dual colour */
  setFill(doc, accentCol);
  doc.rect(0, 0, W * 0.6, 1.5, 'F');
  setFill(doc, C.purple);
  doc.rect(W * 0.6, 0, W * 0.4, 1.5, 'F');

  /* ── Header card ── */
  roundRect(doc, 10, 8, W - 20, 28, 3, C.card, C.border);

  /* Logo pill */
  setFill(doc, C.purple);
  doc.roundedRect(14, 11, 14, 10, 2, 2, 'F');
  setTxt(doc, C.white);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('FPL', 21, 17.5, { align: 'center' });

  /* Brand */
  setTxt(doc, C.white);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('FakeProof Labs', 31, 17);

  setTxt(doc, C.cyan);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('AI FORENSIC MEDIA AUTHENTICITY PLATFORM', 31, 21.5);

  /* Report meta */
  setTxt(doc, C.muted);
  doc.setFontSize(7);
  doc.text('FORENSIC ANALYSIS REPORT', W - 14, 14, { align: 'right' });
  setTxt(doc, C.dimmed);
  doc.setFontSize(6.5);
  doc.text(`Generated: ${timestamp}`, W - 14, 19, { align: 'right' });
  doc.text('Classification: CONFIDENTIAL', W - 14, 23.5, { align: 'right' });

  /* ── Verdict banner ── */
  roundRect(doc, 10, 40, W - 20, 22, 3, [...accentCol, 20], accentCol);
  setTxt(doc, accentCol);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(isFake ? 'DEEPFAKE DETECTED' : 'AUTHENTIC IMAGE', W / 2, 50, { align: 'center' });
  setTxt(doc, C.white);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    isFake
      ? 'This image has been classified as AI-generated synthetic media.'
      : 'This image has been classified as an authentic photograph.',
    W / 2, 57, { align: 'center' },
  );

  /* ── Metrics row (5 cells now — includes Grad-CAM) ── */
  const metrics = [
    { label: 'VERDICT',        value: prediction,                                col: accentCol },
    { label: 'CONFIDENCE',     value: `${confidence}%`,                          col: accentCol },
    { label: 'INFERENCE',      value: processing_time ? `${processing_time}ms` : '—', col: C.cyan },
    { label: 'ATTENTION SCORE',value: gradcam_score != null ? `${gradcam_score}/100` : 'N/A', col: C.cyan },
    { label: 'AI EXPLANATION', value: gemini_powered ? 'Gemini AI' : 'Static',   col: C.purple },
  ];

  const mW = (W - 20 - 12) / 5;
  metrics.forEach(({ label, value, col }, i) => {
    const x = 10 + i * (mW + 3);
    roundRect(doc, x, 66, mW, 18, 2, C.card, C.border);
    setTxt(doc, C.dimmed);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.text(label, x + mW / 2, 71, { align: 'center' });
    setTxt(doc, col);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x + mW / 2, 79, { align: 'center' });
  });

  /* ── Image + AI Analysis ── */
  let y = 90;

  if (imageDataUrl) {
    // Card 1: Original Image
    roundRect(doc, 10, y, 60, 70, 3, C.card, C.border);
    setTxt(doc, C.muted);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('ORIGINAL SCAN', 14, y + 6);
    try {
      doc.addImage(imageDataUrl, 'JPEG', 12, y + 9, 56, 49, undefined, 'FAST');
    } catch {
      setTxt(doc, C.dimmed);
      doc.setFontSize(6);
      doc.text('[Unavailable]', 40, y + 34, { align: 'center' });
    }
    setFill(doc, [...accentCol, 200]);
    doc.roundedRect(14, y + 61, 24, 6, 1.5, 1.5, 'F');
    setTxt(doc, [10, 10, 15]);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'bold');
    doc.text('INPUT', 26, y + 65, { align: 'center' });

    // Card 2: Grad-CAM Overlay
    roundRect(doc, 73, y, 60, 70, 3, C.card, C.border);
    setTxt(doc, C.muted);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('GRAD-CAM OVERLAY', 77, y + 6);
    if (result.overlay_image) {
      try {
        doc.addImage(`data:image/png;base64,${result.overlay_image}`, 'PNG', 75, y + 9, 56, 49, undefined, 'FAST');
      } catch {
        setTxt(doc, C.dimmed);
        doc.setFontSize(6);
        doc.text('[Grad-CAM Error]', 103, y + 34, { align: 'center' });
      }
    } else {
      setTxt(doc, C.dimmed);
      doc.setFontSize(6);
      doc.text('[Unavailable]', 103, y + 34, { align: 'center' });
    }
    setFill(doc, [...C.purple, 200]);
    doc.roundedRect(77, y + 61, 24, 6, 1.5, 1.5, 'F');
    setTxt(doc, [10, 10, 15]);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(prediction.toUpperCase(), 89, y + 65, { align: 'center' });
  }

  const aiX = imageDataUrl ? 136 : 10;
  const aiW = imageDataUrl ? 64 : W - 20;
  roundRect(doc, aiX, y, aiW, 70, 3, C.card, C.border);
  setTxt(doc, C.muted);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('AI FORENSIC ANALYSIS', aiX + 4, y + 6);

  if (gemini_powered) {
    setFill(doc, C.cyan);
    doc.roundedRect(aiX + aiW - 20, y + 2, 16, 5, 1.5, 1.5, 'F');
    setTxt(doc, [10, 10, 15]);
    doc.setFontSize(4.5);
    doc.text('GEMINI AI', aiX + aiW - 12, y + 5.5, { align: 'center' });
  }

  setTxt(doc, C.white);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const analysisLines = doc.splitTextToSize(ai_analysis || 'No analysis available.', aiW - 8);
  doc.text(analysisLines, aiX + 4, y + 14);

  /* ── Confidence bar ── */
  y += 76;
  roundRect(doc, 10, y, W - 20, 22, 3, C.card, C.border);
  setTxt(doc, C.muted);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIDENCE SCORE', 14, y + 6);
  setTxt(doc, accentCol);
  doc.setFontSize(6);
  doc.text(`${confidence}%`, W - 14, y + 6, { align: 'right' });
  setFill(doc, C.border);
  doc.roundedRect(14, y + 9, W - 28, 4, 2, 2, 'F');
  setFill(doc, accentCol);
  doc.roundedRect(14, y + 9, (W - 28) * (confidence / 100), 4, 2, 2, 'F');
  setTxt(doc, C.dimmed);
  doc.setFontSize(5.5);
  doc.text('0%', 14, y + 18);
  doc.text('50%', W / 2, y + 18, { align: 'center' });
  doc.text('100%', W - 14, y + 18, { align: 'right' });

  /* ── Grad-CAM section ── */
  if (gradcam_score != null) {
    y += 28;
    roundRect(doc, 10, y, W - 20, 22, 3, C.card, C.border);
    setTxt(doc, C.muted);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('GRAD-CAM NEURAL ATTENTION', 14, y + 6);
    setTxt(doc, C.cyan);
    doc.text(`Score: ${gradcam_score}/100`, W - 14, y + 6, { align: 'right' });

    /* Attention bar */
    setFill(doc, C.border);
    doc.roundedRect(14, y + 9, W - 28, 4, 2, 2, 'F');
    const attCol = isFake ? C.red : C.green;
    setFill(doc, attCol);
    doc.roundedRect(14, y + 9, (W - 28) * (gradcam_score / 100), 4, 2, 2, 'F');

    setTxt(doc, C.dimmed);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    const attLabel = isFake
      ? (gradcam_score >= 75 ? 'High Synthetic Artifact Focus' : gradcam_score >= 45 ? 'Moderate Manipulation Evidence' : 'Low Manipulation Indicators')
      : (gradcam_score >= 75 ? 'Strong Authenticity Indicators' : gradcam_score >= 45 ? 'Moderate Authenticity Confidence' : 'Diffuse Attention');
    doc.text(attLabel, W / 2, y + 19, { align: 'center' });
  }

  /* ── Technical details ── */
  y += (gradcam_score != null ? 28 : 28);
  roundRect(doc, 10, y, W - 20, 32, 3, C.card, C.border);
  setTxt(doc, C.muted);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('TECHNICAL DETAILS', 14, y + 6);

  const details = [
    ['Platform',           'FakeProof Labs v2.0'],
    ['Model Architecture', 'Convolutional Neural Network (CNN)'],
    ['Framework',          'TensorFlow 2.13 / Keras'],
    ['Input Resolution',   '224 × 224 pixels (RGB)'],
    ['XAI Method',         'Grad-CAM (Selvaraju et al., 2017)'],
    ['Explanation Engine', gemini_powered ? 'Google Gemini 1.5 Flash' : 'Static fallback'],
  ];

  details.forEach(([key, val], i) => {
    const col = i % 2 === 0 ? 14 : W / 2 + 2;
    const row = y + 12 + Math.floor(i / 2) * 7;
    setTxt(doc, C.dimmed);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(`${key}:`, col, row);
    setTxt(doc, C.white);
    doc.setFont('helvetica', 'bold');
    doc.text(val, col + 38, row);
  });

  /* ── Disclaimer ── */
  y += 38;
  if (y + 18 < H - 20) {
    roundRect(doc, 10, y, W - 20, 14, 3, [20, 20, 40], C.border);
    setTxt(doc, C.dimmed);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    const disclaimer =
      'This report is generated by FakeProof Labs AI systems and is for reference purposes only. ' +
      'Results may vary based on image quality and model limitations. ' +
      'Grad-CAM visualizations indicate neural attention, not definitive proof of manipulation. ' +
      'This report does not constitute legal evidence.';
    doc.text(doc.splitTextToSize(disclaimer, W - 28), W / 2, y + 5.5, { align: 'center' });
  }

  /* ── Footer ── */
  divider(doc, H - 12);
  setTxt(doc, C.dimmed);
  doc.setFontSize(6);
  doc.text('FakeProof Labs · AI Forensic Media Authenticity Platform · University Project Expo 2025', W / 2, H - 7, { align: 'center' });
  doc.text('Powered by TensorFlow · FastAPI · Grad-CAM · Google Gemini', W / 2, H - 3.5, { align: 'center' });

  /* ── Save ── */
  const safeTs = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  doc.save(`FakeProofLabs_Report_${prediction}_${safeTs}.pdf`);
};
