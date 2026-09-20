

(function () {
  var shown = false;
  function show(title, msg) {
    if (shown) return; shown = true;
    if (!window.__bootBanner) return;
    try {
      var d = document.createElement("div");
      d.setAttribute("style",
        "position:fixed;left:0;top:0;right:0;z-index:2147483647;background:#3a0d0d;" +
        "color:#ffd9d9;font:12px ui-monospace,Menlo,monospace;padding:10px;" +
        "white-space:pre-wrap;word-break:break-word;max-height:70%;overflow:auto");
      d.textContent = title + "\n\n" + msg;
      (document.body || document.documentElement).appendChild(d);
    } catch (e) {}
  }
  window.addEventListener("error", function (e) {
    show("EMBERFELL: SCRIPT ERROR",
         (e.message || "error") + "\n  " + (e.filename || "?") +
         " line " + e.lineno + ":" + e.colno +
         (e.error && e.error.stack ? "\n\n" + e.error.stack : ""));
  }, true);
  window.addEventListener("unhandledrejection", function (e) {
    show("EMBERFELL: PROMISE REJECTED",
         String(e.reason && (e.reason.stack || e.reason.message) || e.reason));
  });
  window.addEventListener("load", function () {
    setTimeout(function () {
      if (window.__firstFrame) return;
      try {
        const c = document.getElementById("cv");
        if (c && c.width && c.height) {
          setTimeout(function () {
            if (window.__firstFrame) return;
            show("EMBERFELL: NEVER DREW A FRAME",
                 "boot trace:\n" + (window.__boot || "(no trace)"));
          }, 5000);
          return;
        }
      } catch (e) {}
      show("EMBERFELL: NEVER DREW A FRAME",
           "boot trace:\n" + (window.__boot || "(the main script never ran at all)"));
    }, 20000);
  });
})();
