/**
 * Combine static and dynamic analysis signals into a final verdict.
 *
 * @param {object} staticReport - from analyzeStatic()
 * @param {object|null} dynamicResult - from sandbox normalizeReport(), null if sandbox unavailable
 * @returns {{ verdict, threat_score, malware_family, signatures }}
 */
export function computeVerdict(staticReport, dynamicResult) {
  let score = 0;
  const signals = [];
  let family = null;

  // ── Static signals ──────────────────────────

  if (staticReport) {
    // High entropy suggests packing/encryption
    if (staticReport.entropy > 7.2) {
      score += 20;
      signals.push('high_entropy');
    } else if (staticReport.entropy > 6.8) {
      score += 10;
      signals.push('elevated_entropy');
    }

    // Suspicious indicators from string/PE analysis
    for (const ind of (staticReport.indicators || [])) {
      if (ind.severity === 'high') score += 12;
      else if (ind.severity === 'medium') score += 5;
      else score += 2;
      signals.push(ind.type + ':' + ind.value);
    }

    // PE-specific checks
    if (staticReport.pe?.isPE) {
      const pe = staticReport.pe;

      // Suspicious section names
      const packerSections = (pe.sections || []).filter(s =>
        ['.upx', 'upx0', 'upx1', '.aspack', '.themida', '.nsp'].some(p =>
          s.name.toLowerCase().startsWith(p)
        )
      );
      if (packerSections.length) {
        score += 15;
        signals.push('packer_detected');
      }

      // Suspicious DLL imports
      const dangerousDlls = ['urlmon.dll', 'wininet.dll', 'ws2_32.dll', 'crypt32.dll', 'advapi32.dll'];
      const importedLower = (pe.importedDlls || []).map(d => d.toLowerCase());
      const dangerousImports = dangerousDlls.filter(d => importedLower.includes(d));
      if (dangerousImports.length >= 3) {
        score += 10;
        signals.push('suspicious_imports');
      }

      // Very old timestamp might indicate tampering
      if (pe.timestamp) {
        const ts = new Date(pe.timestamp).getTime();
        if (ts < new Date('2000-01-01').getTime() || ts > Date.now() + 86400000 * 365) {
          score += 8;
          signals.push('anomalous_pe_timestamp');
        }
      }
    }
  }

  // ── Dynamic signals (from CAPE) ─────────────

  if (dynamicResult) {
    score = Math.max(score, dynamicResult.threatScore || 0);

    if (dynamicResult.malwareFamily) {
      family = dynamicResult.malwareFamily;
    }

    for (const sig of (dynamicResult.signatures || [])) {
      if (!signals.includes(sig)) signals.push(sig);
    }
  }

  // ── Final verdict ───────────────────────────

  score = Math.min(100, score);

  let verdict;
  if (score >= 70) verdict = 'malicious';
  else if (score >= 30) verdict = 'suspicious';
  else verdict = 'clean';

  return {
    verdict,
    threat_score: score,
    malware_family: family,
    signatures: signals,
  };
}
