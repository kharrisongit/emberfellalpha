
window.addEventListener("error", function (e) {
  var m = (e && (e.message || "")) + "";
  var d = (e && e.error && e.error.stack) ? ("\n" + e.error.stack) : "";
  window.__boot = (window.__boot || "") + "\nERROR: " + m + d;
  var el = document.getElementById("bootmsg");
  if (el) el.textContent = m + d;
});
window.addEventListener("unhandledrejection", function (e) {
  window.__boot = (window.__boot || "") + "\nPROMISE: " + (e && e.reason);
});
