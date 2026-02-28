export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatTime(unixTs) {
  if (!unixTs) return '—';
  const d = new Date(unixTs * 1000);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return d.toLocaleDateString();
}

export function formatDuration(seconds) {
  if (!seconds) return '—';
  if (seconds < 60) return seconds + 's';
  return Math.floor(seconds / 60) + 'm ' + (seconds % 60) + 's';
}

export function formatTimestamp(t) {
  if (t === undefined || t === null) return '—';
  const secs = Math.floor(t);
  const ms = Math.round((t - secs) * 10);
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}.${ms}`;
}

export function verdictColor(verdict) {
  switch (verdict?.toLowerCase()) {
    case 'malicious':  return 'var(--red)';
    case 'suspicious': return 'var(--orange)';
    case 'clean':      return 'var(--green2)';
    default:           return 'var(--text3)';
  }
}

export function verdictBg(verdict) {
  switch (verdict?.toLowerCase()) {
    case 'malicious':  return 'var(--red-dim)';
    case 'suspicious': return 'var(--orange-dim)';
    case 'clean':      return 'var(--green-dim)';
    default:           return 'rgba(200,170,120,0.06)';
  }
}

export function severityColor(sev) {
  switch (sev?.toLowerCase()) {
    case 'critical': return 'var(--red)';
    case 'high':     return 'var(--orange)';
    case 'medium':   return 'var(--yellow)';
    case 'low':      return 'var(--green2)';
    default:         return 'var(--text3)';
  }
}

export function severityBg(sev) {
  switch (sev?.toLowerCase()) {
    case 'critical': return 'var(--red-dim)';
    case 'high':     return 'var(--orange-dim)';
    case 'medium':   return 'var(--yellow-dim)';
    case 'low':      return 'var(--green-dim)';
    default:         return 'rgba(200,170,120,0.06)';
  }
}

export function fileIcon(filename = '', fileType = '') {
  const ext = filename.split('.').pop()?.toLowerCase();
  const type = fileType?.toLowerCase();
  if (['exe', 'dll', 'sys', 'ocx'].includes(ext) || type?.includes('pe')) return '⚙';
  if (['pdf'].includes(ext) || type?.includes('pdf')) return '📄';
  if (['doc', 'docx', 'docm'].includes(ext)) return '📝';
  if (['xls', 'xlsx', 'xlsm'].includes(ext)) return '📊';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
  if (['apk'].includes(ext) || type?.includes('android')) return '📱';
  if (['jar'].includes(ext)) return '☕';
  if (['ps1', 'vbs', 'js', 'wsf'].includes(ext)) return '📜';
  if (['sh', 'py'].includes(ext)) return '🐍';
  return '📁';
}

export function iocIcon(type) {
  switch (type?.toLowerCase()) {
    case 'ip':       return '🌐';
    case 'domain':   return '🔗';
    case 'url':      return '🔗';
    case 'sha256':
    case 'sha1':
    case 'md5':      return '🔑';
    case 'filepath': return '📁';
    case 'registry': return '🗃';
    case 'email':    return '✉';
    default:         return '📍';
  }
}

export function scoreGrade(score) {
  if (score >= 80) return { label: 'CRITICAL', color: 'var(--red)' };
  if (score >= 60) return { label: 'HIGH',     color: 'var(--orange)' };
  if (score >= 30) return { label: 'MEDIUM',   color: 'var(--yellow)' };
  if (score >= 5)  return { label: 'LOW',      color: 'var(--green2)' };
  return { label: 'CLEAN', color: 'var(--green2)' };
}

export function truncateHash(hash, len = 16) {
  if (!hash) return '—';
  return hash.slice(0, len) + '...';
}

export function protocolColor(protocol) {
  switch (protocol?.toUpperCase()) {
    case 'DNS':   return 'var(--purple)';
    case 'HTTP':  return 'var(--accent)';
    case 'HTTPS': return 'var(--green2)';
    case 'TLS':   return 'var(--green2)';
    case 'TCP':   return 'var(--yellow)';
    case 'UDP':   return 'var(--orange)';
    default:      return 'var(--text3)';
  }
}

export function protocolBg(protocol) {
  switch (protocol?.toUpperCase()) {
    case 'DNS':   return 'var(--purple-dim)';
    case 'HTTP':  return 'var(--accent-dim)';
    case 'HTTPS': return 'var(--green-dim)';
    case 'TLS':   return 'var(--green-dim)';
    case 'TCP':   return 'var(--yellow-dim)';
    case 'UDP':   return 'var(--orange-dim)';
    default:      return 'rgba(200,170,120,0.06)';
  }
}
