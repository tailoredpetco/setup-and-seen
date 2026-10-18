(function () {
  'use strict';
  var wrap = document.querySelector('[data-motion-showcase]');
  if (!wrap) return;
  var section = wrap.closest('.creative-showcase');
  var video = wrap.querySelector('video');
  var button = wrap.querySelector('button');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var desktop = window.matchMedia('(min-width: 901px)');
  var connection = navigator.connection || {};
  var userPaused = false, visible = false, loaded = false;
  function eligible() { return desktop.matches && !reduce.matches && !connection.saveData; }
  function label() { button.textContent = video.paused ? 'Play portfolio animation' : 'Pause portfolio animation'; }
  function pause() { video.pause(); label(); }
  function play() {
    if (!loaded) { var source = video.querySelector('source'); source.src = source.dataset.src; video.load(); loaded = true; }
    video.muted = true;
    var promise = video.play();
    if (promise && promise.catch) promise.catch(function () { label(); });
  }
  function update() {
    var enabled = eligible();
    section.classList.toggle('motion-ready', enabled);
    button.hidden = !enabled;
    if (enabled && visible && !userPaused && !document.hidden) play(); else pause();
  }
  button.addEventListener('click', function () { userPaused = !video.paused; if (userPaused) pause(); else play(); });
  video.addEventListener('play', label);
  video.addEventListener('pause', label);
  video.addEventListener('error', function () { pause(); section.classList.remove('motion-ready'); });
  video.querySelector('source').addEventListener('error', function () { pause(); section.classList.remove('motion-ready'); });
  [reduce, desktop].forEach(function (query) { if (query.addEventListener) query.addEventListener('change', update); else if (query.addListener) query.addListener(update); });
  document.addEventListener('visibilitychange', update);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; update(); }, {threshold:0.15}).observe(section);
  } else { visible = true; }
  update();
})();
