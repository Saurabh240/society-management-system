export function resolveDateRange(dateRange) {
  const today = new Date();
  const fmt = (d) => d.toISOString().split("T")[0];

  switch (dateRange) {
    case "THIS_MONTH": {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: fmt(from), to: fmt(today) };
    }
    case "LAST_MONTH": {
      const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const to   = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: fmt(from), to: fmt(to) };
    }
    case "THIS_YEAR": {
      const from = new Date(today.getFullYear(), 0, 1);
      return { from: fmt(from), to: fmt(today) };
    }
    case "LAST_YEAR": {
      const from = new Date(today.getFullYear() - 1, 0, 1);
      const to   = new Date(today.getFullYear() - 1, 11, 31);
      return { from: fmt(from), to: fmt(to) };
    }
    case "LAST_90_DAYS": {
      const from = new Date(today);
      from.setDate(from.getDate() - 90);
      return { from: fmt(from), to: fmt(today) };
    }
    case "LAST_30_DAYS": {
      const from = new Date(today);
      from.setDate(from.getDate() - 30);
      return { from: fmt(from), to: fmt(today) };
    }
    default:
      return {};
  }
}