/* Touch input adapter for the existing Emscripten SDL keyboard/mouse handlers.
   No generated engine files or game rules are changed. */
(function () {
  'use strict';
  window.LymphoTouch = function (screen, canvas) {
    // SDL also requests pointer lock directly; touch gestures need absolute coordinates.
    canvas.requestPointerLock = function () {};
    var active = false, paused = false, keys = new Set(), pointers = new Map();
    var stick = document.getElementById('joystick'), knob = stick.firstElementChild;
    var fire = document.getElementById('touch-fire');
    var moveId = null, lookId = null, fireId = null, turn = 0, mouseX = 0, frame = 0;
    var nextUse = 0, releaseUse = 0;
    var ui = document.getElementById('touch-ui');
    // Pointer Events drive gameplay. Suppress native touch gestures and compatibility
    // clicks separately: repeated fire taps must never become Safari double-tap zoom.
    ['touchstart', 'touchmove', 'touchend', 'gesturestart', 'gesturechange', 'gestureend'].forEach(function (type) {
      ui.addEventListener(type, function (e) { e.preventDefault(); }, {passive: false});
    });
    var codes = {w: 87, s: 83, a: 65, d: 68, e: 69};
    function key(name, down) {
      if (keys.has(name) === down) return;
      if (down) keys.add(name); else keys.delete(name);
      canvas.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', {
        key: name, code: 'Key' + name.toUpperCase(),
        keyCode: codes[name], which: codes[name], bubbles: true, cancelable: true
      }));
    }
    function mouse(type, dx) {
      var rect = canvas.getBoundingClientRect();
      if (type === 'mousemove') mouseX += dx || 0;
      canvas.dispatchEvent(new MouseEvent(type, {bubbles: true, cancelable: true,
        button: 0, buttons: type === 'mouseup' ? 0 : (fire.classList.contains('held') ? 1 : 0),
        clientX: rect.left + mouseX, clientY: rect.top + rect.height / 2,
        movementX: dx || 0, movementY: 0}));
    }
    function reset() {
      Array.from(keys).forEach(function (k) { key(k, false); });
      if (fire.classList.contains('held')) mouse('mouseup');
      document.querySelectorAll('.touch-button').forEach(function (b) { b.classList.remove('held'); });
      pointers.clear(); moveId = lookId = fireId = null; turn = 0;
      nextUse = releaseUse = 0;
      knob.style.transform = ''; stick.style.left = ''; stick.style.top = '';
    }
    function setPaused(value) {
      if (!active || paused === value) return;
      reset(); paused = value;
      if (paused) Module.pauseMainLoop(); else Module.resumeMainLoop();
      document.body.classList.toggle('paused', paused);
    }
    function animate(now) {
      if (!active) return;
      if (!paused && turn) {
        // Without pointer lock SDL derives relative movement from absolute coordinates.
        // Keep an unbounded virtual cursor so repeated swipes never hit a screen edge.
        mouse('mousemove', turn * 1.5); turn = 0;
      }
      // Doom requires a fresh use press for gates, switches and respawning.
      // Approach while moving, or press fire after dying; no extra touch button.
      if (!paused) {
        if (releaseUse && now >= releaseUse) { key('e', false); releaseUse = 0; }
        if (now >= nextUse && !releaseUse && ['w', 's', 'a', 'd'].some(function (k) { return keys.has(k); })) {
          key('e', true); releaseUse = now + 90; nextUse = now + 500;
        }
      }
      frame = requestAnimationFrame(animate);
    }
    function bind(id, role) {
      var el = document.getElementById(id);
      el.addEventListener('pointerdown', function (e) {
        if (!active || paused || e.pointerType === 'mouse') return;
        e.preventDefault(); e.stopPropagation();
        if ((role === 'move' && moveId !== null) || (role === 'look' && lookId !== null) || (role === 'fire' && fireId !== null)) return;
        try { el.setPointerCapture(e.pointerId); } catch (_) { /* Document listeners also handle browsers without capture. */ }
        pointers.set(e.pointerId, {owner: el, role: role, x: e.clientX, y: e.clientY, lastX: e.clientX});
        if (role === 'move') {
          moveId = e.pointerId;
          var r = el.getBoundingClientRect();
          stick.style.left = (e.clientX - r.left) + 'px'; stick.style.top = (e.clientY - r.top) + 'px';
        } else if (role === 'look' || role === 'fire') {
          if (role === 'look') lookId = e.pointerId;
          if (role === 'fire') {
            fireId = e.pointerId; fire.classList.add('held'); mouse('mousedown');
            key('e', true); releaseUse = performance.now() + 90;
          }
        }
        else if (role === 'weapon') {
          canvas.dispatchEvent(new WheelEvent('wheel', {deltaY: 100, deltaMode: 0, bubbles: true, cancelable: true}));
        }
      });
      document.addEventListener('pointermove', function (e) {
        var p = pointers.get(e.pointerId); if (!p || p.owner !== el || paused) return;
        e.preventDefault();
        if (p.role === 'move') {
          var x = e.clientX - p.x, y = e.clientY - p.y, radius = 42;
          var length = Math.hypot(x, y), scale = length > radius ? radius / length : 1;
          x *= scale; y *= scale;
          knob.style.transform = 'translate(' + x + 'px,' + y + 'px)';
          key('w', y < -12); key('s', y > 12); key('a', x < -12); key('d', x > 12);
        } else if (p.role === 'look' || p.role === 'fire') {
          turn += e.clientX - p.lastX; p.lastX = e.clientX;
        }
      });
      function release(e) {
        var p = pointers.get(e.pointerId); if (!p || p.owner !== el) return;
        pointers.delete(e.pointerId);
        if (p.role === 'move') {
          moveId = null; ['w', 's', 'a', 'd'].forEach(function (k) { key(k, false); });
          knob.style.transform = '';
        } else if (p.role === 'look' || p.role === 'fire') {
          if (p.role === 'look') lookId = null;
          if (p.role === 'fire') { fireId = null; mouse('mouseup'); fire.classList.remove('held'); }
        }
      }
      document.addEventListener('pointerup', release);
      el.addEventListener('lostpointercapture', release);
      el.addEventListener('pointercancel', function () { setPaused(true); });
    }
    bind('move-zone', 'move'); bind('look-zone', 'look'); bind('touch-fire', 'fire');
    bind('touch-weapon', 'weapon');
    document.getElementById('touch-resume').addEventListener('click', function () { canvas.focus({preventScroll: true}); setPaused(false); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) setPaused(true); });
    window.addEventListener('blur', function () { setPaused(true); });
    window.addEventListener('resize', reset);
    this.start = function () {
      active = true; document.body.classList.add('playing'); screen.scrollTop = 0; window.scrollTo(0, 0); mouse('mousemove', 0); frame = requestAnimationFrame(animate);
    };
    this.stop = function () {
      reset(); active = false; paused = false; cancelAnimationFrame(frame);
      document.body.classList.remove('playing', 'paused');
    };
  };
})();
