/* Help stays available even when map scripts or data have not loaded. */
(() => {
  'use strict';
  for (const id of ['help', 'about']) {
    const dialog = document.getElementById(id);
    const opener = document.getElementById(id + '-open');
    const closer = document.getElementById(id + '-close');
    opener.addEventListener('click', () => {
      if (!dialog.open) dialog.showModal();
      document.dispatchEvent(new Event('afterlight:dialog-open'));
    });
    closer.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  }
})();
