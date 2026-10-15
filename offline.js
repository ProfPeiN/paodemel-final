(() => {
  const status = document.getElementById('offline-status');
  let ready = false;
  function render() {
    status.textContent = ready
      ? (navigator.onLine ? '✓ Pronto para abrir sem internet neste dispositivo.' : '✓ Sem conexão. A versão salva está disponível neste dispositivo.')
      : (navigator.onLine ? 'Preparando acesso sem internet…' : 'Sem conexão. Conecte à internet para preparar o acesso offline.');
  }
  if (location.protocol === 'file:') {
    status.textContent = 'Versão local · mantenha a pasta completa neste dispositivo.';
    return;
  }
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    status.textContent = 'Para usar sem internet, baixe e extraia a pasta completa do projeto.';
    return;
  }
  render();
  window.addEventListener('online', render);
  window.addEventListener('offline', render);
  navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'})
    .then(() => navigator.serviceWorker.ready)
    .then(() => { ready = true; render(); })
    .catch(() => {
      status.textContent = 'Não foi possível preparar o modo offline. Recarregue com internet para tentar novamente.';
    });
})();
