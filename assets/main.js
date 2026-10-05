// Overkey site — motion. Everything here is decoration: with scripts off the page still reads.
// QA switches (freeze a state for a screenshot): ?step=7  ?reel=2  ?tab=clips
(() => {
  const d = document;
  const q = (s, r = d) => r.querySelector(s);
  const qa = (s, r = d) => [...r.querySelectorAll(s)];
  const P = new URLSearchParams(location.search);
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  d.documentElement.classList.add("js");
  if (P.has("still")) d.documentElement.classList.add("qa");

  // sections slide in as they enter the screen
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { threshold: 0.12 },
  );
  qa(".rv").forEach((el) => io.observe(el));

  // numbers count up once
  const count = (el) => {
    const to = +el.dataset.count, t0 = performance.now(), ms = 1300;
    if (still || !to) { el.textContent = to; return; }
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const co = new IntersectionObserver(
    (es) => es.forEach((e) => { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } }),
    { threshold: 0.6 },
  );
  qa("[data-count]").forEach((el) => co.observe(el));

  // hero: one claim, from the transcript to the screen, on a loop
  const scene = q("#scene");
  if (scene) {
    const hold = [900, 1100, 1000, 1100, 1900, 1500, 450, 4600]; // how long each step stays
    const set = (n) => { for (let i = 1; i <= 7; i++) scene.classList.toggle("s" + i, i <= n); };
    const frozen = P.get("step");
    if (frozen !== null || still) set(frozen !== null ? +frozen : 7);
    else {
      let i = 0;
      const run = () => { set(i); setTimeout(() => { i = i >= 7 ? 0 : i + 1; run(); }, hold[i]); };
      run();
    }
  }

  // the graphics reel
  const reel = q("#reel");
  if (reel) {
    const gs = qa(".g", reel), bs = qa(".reel-nav button");
    let cur = 0, timer;
    const show = (i) => {
      cur = i;
      gs.forEach((g, k) => g.classList.toggle("on", k === i));
      bs.forEach((b, k) => b.classList.toggle("on", k === i));
    };
    const cycle = () => { clearTimeout(timer); if (!still) timer = setTimeout(() => { show((cur + 1) % gs.length); cycle(); }, 5000); };
    bs.forEach((b, k) => b.addEventListener("click", () => { show(k); cycle(); }));
    const frozen = P.get("reel");
    show(frozen !== null ? +frozen : 0);
    if (frozen === null) cycle();
  }

  // the interface: one screen per module
  const tabs = qa(".tabs button"), panels = qa(".panel"), bar = q("#win-title");
  if (tabs.length) {
    let auto;
    const pick = (name) => {
      tabs.forEach((b) => { const on = b.dataset.tab === name; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); if (on && bar) bar.textContent = b.textContent; });
      panels.forEach((p) => p.classList.toggle("on", p.dataset.tab === name));
    };
    const names = tabs.map((b) => b.dataset.tab);
    const stop = () => clearInterval(auto);
    tabs.forEach((b) => b.addEventListener("click", () => { stop(); pick(b.dataset.tab); }));
    const frozen = P.get("tab");
    pick(frozen || names[0]);
    // turns the pages by itself until the visitor touches it
    if (!frozen && !still) {
      const win = q(".win");
      let i = 0, seen = false;
      new IntersectionObserver((es) => { seen = es[0].isIntersecting; }, { threshold: 0.4 }).observe(win);
      auto = setInterval(() => { if (seen) { i = (i + 1) % names.length; pick(names[i]); } }, 7000);
      win.addEventListener("pointerenter", stop, { once: true });
    }
  }

  // the visitor's own Take
  const mini = q("#mini"), take = q("#take");
  if (mini && take) {
    const label = q("#take-note");
    take.addEventListener("click", () => {
      const on = mini.classList.toggle("aired");
      take.textContent = on ? "Clear" : "Take";
      take.classList.toggle("pulse-btn", !on);
      if (label) label.textContent = on ? "On air. That was the only way it could get there." : "Press it. Nothing reaches the screen any other way.";
    });
  }
})();
