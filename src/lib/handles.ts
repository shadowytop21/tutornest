export function normalizeHandleBase(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30);
}

export function createUniqueHandle(value: string, existingHandles: Iterable<string> = [], fallback = "profile") {
  const normalizedExisting = new Set(Array.from(existingHandles, (handle) => handle.trim().toLowerCase()).filter(Boolean));
  const base = normalizeHandleBase(value) || normalizeHandleBase(fallback) || "profile";
  const trimmedBase = base.slice(0, 30);

  if (!normalizedExisting.has(trimmedBase)) {
    return trimmedBase;
  }

  let suffix = 2;
  while (suffix < 1000) {
    const suffixText = `_${suffix}`;
    const nextBase = trimmedBase.slice(0, Math.max(1, 30 - suffixText.length));
    const candidate = `${nextBase}${suffixText}`;
    if (!normalizedExisting.has(candidate)) {
      return candidate;
    }
    suffix += 1;
  }

  return `${trimmedBase.slice(0, 24)}_${Date.now().toString(36).slice(-4)}`;
}

export function formatHandle(handle: string | null | undefined) {
  if (!handle) {
    return "";
  }

  return handle.startsWith("@") ? handle : `@${handle}`;
}