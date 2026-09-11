export const INNER_SCROLL_SELECTOR = [
  '.aqua-content',
  '.aqua-browser__page',
  '.aqua-browser__toc',
  '.aqua-design-lightbox',
  '.aqua-ipod-lcd',
].join(', ');

const canAbsorbDelta = (node, dx, dy) => {
  if (!(node instanceof Element)) return false;
  const style = window.getComputedStyle(node);
  const overflowY = style.overflowY;
  const overflowX = style.overflowX;
  const yScrollable = (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay')
    && node.scrollHeight - node.clientHeight > 1;
  const xScrollable = (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'overlay')
    && node.scrollWidth - node.clientWidth > 1;

  if (dy && yScrollable) {
    if (dy < 0 && node.scrollTop > 0) return true;
    if (dy > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1) return true;
  }
  if (dx && xScrollable) {
    if (dx < 0 && node.scrollLeft > 0) return true;
    if (dx > 0 && node.scrollLeft + node.clientWidth < node.scrollWidth - 1) return true;
  }
  return false;
};

export const shouldAllowInnerScroll = (event, touchDelta) => {
  const target = event.target;
  if (!(target instanceof Element)) return false;
  const root = target.closest(INNER_SCROLL_SELECTOR);
  if (!root) return false;

  const dx = touchDelta?.x ?? event.deltaX ?? 0;
  const dy = touchDelta?.y ?? event.deltaY ?? 0;
  let node = target;
  while (node && root.contains(node)) {
    if (canAbsorbDelta(node, dx, dy)) return true;
    node = node.parentElement;
  }
  return canAbsorbDelta(root, dx, dy);
};

export const createPageScrollGuard = (options = {}) => {
  let lastTouchX = 0;
  let lastTouchY = 0;

  const onTouchStart = (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    lastTouchX = touch.clientX;
    lastTouchY = touch.clientY;
  };

  const prevent = (event) => {
    const touch = event.touches?.[0];
    const touchDelta = touch
      ? { x: lastTouchX - touch.clientX, y: lastTouchY - touch.clientY }
      : null;
    if (touch) {
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
    }
    if (shouldAllowInnerScroll(event, touchDelta)) return;
    event.preventDefault();
    options.onBlock?.(event);
  };

  const onKey = (event) => {
    if (!['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) return;
    if (
      event.target instanceof Element
      && event.target.closest(`input, textarea, [contenteditable="true"], ${INNER_SCROLL_SELECTOR}`)
    ) {
      return;
    }
    event.preventDefault();
  };

  const attach = () => {
    window.addEventListener('wheel', prevent, { passive: false, capture: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
    window.addEventListener('touchmove', prevent, { passive: false, capture: true });
    window.addEventListener('keydown', onKey);
  };

  const detach = () => {
    window.removeEventListener('wheel', prevent, { capture: true });
    window.removeEventListener('touchstart', onTouchStart, { capture: true });
    window.removeEventListener('touchmove', prevent, { capture: true });
    window.removeEventListener('keydown', onKey);
  };

  return { attach, detach };
};
