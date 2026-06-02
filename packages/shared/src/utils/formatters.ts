export function truncate(text: string, maxLength: number, ellipsis = '…'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - ellipsis.length).trimEnd() + ellipsis;
}

export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function titleCase(text: string): string {
  return text
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function pluralize(count: number, singular: string, plural?: string): string {
  const pluralForm = plural ?? `${singular}s`;
  return count === 1 ? `${count} ${singular}` : `${count} ${pluralForm}`;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.length > 2 ? local.slice(0, 2) : local.slice(0, 1);
  const masked = '*'.repeat(Math.max(0, local.length - visible.length));
  return `${visible}${masked}@${domain}`;
}

export function formatOrderId(id: string): string {
  return `#${id.slice(-8).toUpperCase()}`;
}

export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}
