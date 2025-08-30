function debounce(func, wait) {
  let timeout = null;
  return function(...args) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
export {
  debounce
};
//# sourceMappingURL=utils.js.map
