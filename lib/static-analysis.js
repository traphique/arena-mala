import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';

/**
 * Compute MD5, SHA1, SHA256 hashes of a buffer.
 */
export function computeHashes(buffer) {
  return {
    md5: crypto.createHash('md5').update(buffer).digest('hex'),
    sha1: crypto.createHash('sha1').update(buffer).digest('hex'),
    sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
  };
}

/**
 * Detect file type from magic bytes.
 * Uses dynamic import because file-type is ESM-only.
 */
export async function detectFileType(buffer) {
  try {
    const { fileTypeFromBuffer } = await import('file-type');
    const result = await fileTypeFromBuffer(buffer);
    if (result) return { mime: result.mime, ext: result.ext };
  } catch (_) {}

  const head = buffer.slice(0, 4);
  if (head[0] === 0x4D && head[1] === 0x5A) return { mime: 'application/x-dosexec', ext: 'exe' };
  if (head[0] === 0x7F && head[1] === 0x45 && head[2] === 0x4C && head[3] === 0x46) return { mime: 'application/x-elf', ext: 'elf' };
  if (head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46) return { mime: 'application/pdf', ext: 'pdf' };
  return { mime: 'application/octet-stream', ext: 'bin' };
}

/**
 * Extract printable ASCII strings of minimum length from a buffer.
 */
export function extractStrings(buffer, minLen = 6, maxResults = 500) {
  const results = [];
  let current = '';

  for (let i = 0; i < buffer.length && results.length < maxResults; i++) {
    const byte = buffer[i];
    if (byte >= 0x20 && byte <= 0x7E) {
      current += String.fromCharCode(byte);
    } else {
      if (current.length >= minLen) results.push(current);
      current = '';
    }
  }
  if (current.length >= minLen && results.length < maxResults) results.push(current);

  return results;
}

/**
 * Extract UTF-16LE strings (common in Windows PE files).
 */
export function extractUTF16Strings(buffer, minLen = 6, maxResults = 200) {
  const results = [];
  let current = '';

  for (let i = 0; i + 1 < buffer.length && results.length < maxResults; i += 2) {
    const code = buffer[i] | (buffer[i + 1] << 8);
    if (code >= 0x20 && code <= 0x7E) {
      current += String.fromCharCode(code);
    } else {
      if (current.length >= minLen) results.push(current);
      current = '';
    }
  }
  if (current.length >= minLen && results.length < maxResults) results.push(current);

  return results;
}

/**
 * Calculate Shannon entropy of a buffer.
 * High entropy (>7.0) typically means packed/encrypted content.
 */
export function calcEntropy(buffer) {
  if (!buffer.length) return 0;
  const freq = new Uint32Array(256);
  for (let i = 0; i < buffer.length; i++) freq[buffer[i]]++;
  let entropy = 0;
  const len = buffer.length;
  for (let i = 0; i < 256; i++) {
    if (freq[i] === 0) continue;
    const p = freq[i] / len;
    entropy -= p * Math.log2(p);
  }
  return Math.round(entropy * 1000) / 1000;
}

/**
 * Parse PE (Portable Executable) headers.
 * Returns structured info about a Windows executable.
 */
export async function parsePE(buffer) {
  try {
    const { NtExecutable } = await import('pe-library');
    const exe = NtExecutable.from(buffer);
    const fileHeader = exe.newHeader?.fileHeader;
    const optHeader = exe.newHeader?.optionalHeader;

    const sections = exe.getAllSections().map(s => ({
      name: cleanSectionName(s.info?.name),
      virtualSize: s.info?.virtualSize || 0,
      rawSize: s.info?.sizeOfRawData || 0,
      entropy: s.data ? calcEntropy(Buffer.from(s.data)) : 0,
    }));

    const imports = [];
    try {
      const importDir = exe.getSectionByEntry(1);
      if (importDir?.data) {
        const strs = extractStrings(Buffer.from(importDir.data), 3, 200);
        for (const s of strs) {
          if (s.endsWith('.dll') || s.endsWith('.DLL')) imports.push(s);
        }
      }
    } catch (_) {}

    return {
      isPE: true,
      machine: fileHeader?.machine,
      timestamp: fileHeader?.timeDateStamp ? new Date(fileHeader.timeDateStamp * 1000).toISOString() : null,
      subsystem: optHeader?.subsystem,
      entryPoint: optHeader?.addressOfEntryPoint,
      imageBase: optHeader?.imageBase,
      sections,
      importedDlls: imports,
      numberOfSections: sections.length,
    };
  } catch (_) {
    return { isPE: false };
  }
}

function cleanSectionName(raw) {
  if (!raw) return '';
  const buf = typeof raw === 'string' ? raw : String(raw);
  return buf.replace(/\0/g, '').trim();
}

/**
 * Detect suspicious static indicators.
 */
export function detectSuspiciousIndicators(strings, peInfo) {
  const indicators = [];
  const suspicious_apis = [
    'VirtualAlloc', 'VirtualProtect', 'WriteProcessMemory', 'CreateRemoteThread',
    'NtUnmapViewOfSection', 'IsDebuggerPresent', 'CheckRemoteDebuggerPresent',
    'GetProcAddress', 'LoadLibraryA', 'LoadLibraryW', 'URLDownloadToFile',
    'ShellExecute', 'WinExec', 'CreateProcess', 'RegSetValue', 'InternetOpen',
    'HttpSendRequest', 'CryptEncrypt', 'CryptDecrypt',
  ];

  const lowerStrings = strings.map(s => s.toLowerCase());

  for (const api of suspicious_apis) {
    if (strings.includes(api)) {
      indicators.push({ type: 'suspicious_api', value: api, severity: 'medium' });
    }
  }

  const urlPattern = /https?:\/\/[^\s"']+/gi;
  const ipPattern = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;

  for (const s of strings) {
    const urls = s.match(urlPattern);
    if (urls) {
      for (const url of urls) indicators.push({ type: 'embedded_url', value: url, severity: 'high' });
    }
    const ips = s.match(ipPattern);
    if (ips) {
      for (const ip of ips) {
        if (!ip.startsWith('0.') && !ip.startsWith('127.') && !ip.startsWith('255.'))
          indicators.push({ type: 'embedded_ip', value: ip, severity: 'medium' });
      }
    }
  }

  if (peInfo?.isPE) {
    const highEntropySections = (peInfo.sections || []).filter(s => s.entropy > 7.0);
    if (highEntropySections.length > 0) {
      indicators.push({ type: 'packed_section', value: highEntropySections.map(s => s.name).join(', '), severity: 'high' });
    }
    const knownPackerSections = ['.upx', 'UPX0', 'UPX1', '.aspack', '.adata', '.nsp0', '.nsp1', 'pec', '.themida'];
    for (const sec of peInfo.sections || []) {
      if (knownPackerSections.some(p => sec.name.toLowerCase().startsWith(p.toLowerCase()))) {
        indicators.push({ type: 'packer_detected', value: sec.name, severity: 'high' });
      }
    }
  }

  return indicators;
}

/**
 * Run full static analysis on a file buffer.
 */
export async function analyzeStatic(buffer) {
  const hashes = computeHashes(buffer);
  const fileType = await detectFileType(buffer);
  const entropy = calcEntropy(buffer);
  const strings = extractStrings(buffer, 6, 500);
  const utf16Strings = extractUTF16Strings(buffer, 6, 200);
  const allStrings = [...new Set([...strings, ...utf16Strings])];
  const peInfo = await parsePE(buffer);
  const indicators = detectSuspiciousIndicators(allStrings, peInfo);

  return {
    hashes,
    fileType,
    entropy,
    strings: allStrings.slice(0, 300),
    pe: peInfo,
    indicators,
    size: buffer.length,
  };
}
