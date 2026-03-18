(function () {
  function isNumericValue(value) {
    return /^-?\d+(?:[.,]\d+)?$/.test(value.trim());
  }

  function parseLocalizedNumber(text) {
    const normalized = text.trim().replace(/\./g, "").replace(",", ".");
    if (!isNumericValue(normalized)) {
      return null;
    }
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  }

  function formatMoney(value) {
    const hasDecimals = Math.abs(value % 1) > Number.EPSILON;
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    }).format(value);
  }

  function formatQuantity(value) {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatPercentage(value) {
    const hasDecimals = Math.abs(value % 1) > Number.EPSILON;
    const formatted = new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    }).format(value);
    return formatted + "%";
  }

  function formatByDataAttributes() {
    document.querySelectorAll("[data-format='money']").forEach((el) => {
      const value = parseLocalizedNumber(el.textContent || "");
      if (value !== null) {
        el.textContent = formatMoney(value);
      }
    });

    document.querySelectorAll("[data-format='qty']").forEach((el) => {
      const value = parseLocalizedNumber(el.textContent || "");
      if (value !== null) {
        el.textContent = formatQuantity(value);
      }
    });

    document.querySelectorAll("[data-format='percent']").forEach((el) => {
      const raw = (el.textContent || "").replace("%", "").trim();
      const value = parseLocalizedNumber(raw);
      if (value !== null) {
        el.textContent = formatPercentage(value);
      }
    });
  }

  function formatCurrencyTokensInTextNodes() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    const currencyRegex = /(\$\s*)(\d+(?:[.,]\d+)?|\d{1,3}(?:\.\d{3})*(?:,\d+)?)(?!\w)|(\d+(?:[.,]\d+)?|\d{1,3}(?:\.\d{3})*(?:,\d+)?)(\s*€)/g;

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!parent) continue;
      if (parent.closest("script, style, input, textarea")) continue;

      const text = node.nodeValue;
      if (!text || (!text.includes("€") && !text.includes("$"))) continue;

      const replaced = text.replace(currencyRegex, (match, dollarPrefix, leftNumber, rightNumber, euroSuffix) => {
        if (leftNumber) {
          const value = parseLocalizedNumber(leftNumber);
          return value === null ? match : dollarPrefix + formatMoney(value);
        }

        if (rightNumber) {
          const value = parseLocalizedNumber(rightNumber);
          return value === null ? match : formatMoney(value) + euroSuffix;
        }

        return match;
      });

      if (replaced !== text) {
        node.nodeValue = replaced;
      }
    }
  }

  function formatPercentTokensInTextNodes() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    const percentRegex = /(\d+(?:[.,]\d+)?)%/g;

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!parent) continue;
      if (parent.closest("script, style, input, textarea")) continue;

      const text = node.nodeValue;
      if (!text || !text.includes("%")) continue;

      const replaced = text.replace(percentRegex, (_, n) => {
        const value = parseLocalizedNumber(n);
        return value === null ? _ : formatPercentage(value);
      });

      if (replaced !== text) {
        node.nodeValue = replaced;
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    formatByDataAttributes();
    formatCurrencyTokensInTextNodes();
    formatPercentTokensInTextNodes();
  });
})();
