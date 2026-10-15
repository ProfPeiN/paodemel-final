// O conteúdo essencial é HTML estático: funciona também sem JavaScript.
// produto.json mantém os dados de referência para futuras integrações.
document.querySelectorAll('.section-nav a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.section-nav a').forEach(item => item.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'location');
  });
});

const motionButton = document.getElementById('motion-toggle');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
function setMotionPaused(paused) {
  document.body.classList.toggle('motion-paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = paused ? 'Ativar animações' : 'Pausar animações';
}
setMotionPaused(motionPreference.matches);
motionButton.addEventListener('click', () => {
  // A preferência de acessibilidade do sistema continua sendo respeitada.
  if (motionPreference.matches) {
    motionButton.textContent = 'Movimento reduzido ativado no dispositivo';
    return;
  }
  setMotionPaused(!document.body.classList.contains('motion-paused'));
});
motionPreference.addEventListener('change', event => setMotionPaused(event.matches));
