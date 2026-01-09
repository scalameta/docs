// Fetch and display the latest Metals release version from Maven Central
(function() {
  const FALLBACK_VERSION = "2.0.0-M2";
  let currentVersion = FALLBACK_VERSION;
  let showingFeedback = false;
  
  async function fetchLatestVersion() {
    try {
      const response = await fetch("https://img.shields.io/maven-central/v/org.scalameta/metals_2.13.json");
      const data = await response.json();
      if (data.value && data.value !== "unknown") {
        return data.value;
      }
    } catch (e) {
      console.warn("Failed to fetch Metals version:", e);
    }
    return FALLBACK_VERSION;
  }

  function showCopiedFeedback(element, version) {
    showingFeedback = true;
    element.innerHTML = version + ' <span style="opacity:0.7;font-weight:normal"> ✓ copied</span>';
    setTimeout(() => {
      element.textContent = version;
      showingFeedback = false;
    }, 1500);
  }

  // Use event delegation for reliable click handling
  document.addEventListener("click", function(e) {
    const versionEl = e.target.closest("#metals-version");
    if (versionEl && !showingFeedback) {
      navigator.clipboard.writeText(currentVersion).then(() => {
        showCopiedFeedback(versionEl, currentVersion);
      }).catch((err) => {
        console.error("Failed to copy:", err);
      });
    }
  });

  async function updateVersions() {
    if (showingFeedback) return;
    
    currentVersion = await fetchLatestVersion();
    
    // Update the version display element
    const versionEl = document.getElementById("metals-version");
    if (versionEl) {
      versionEl.textContent = currentVersion;
    }

    // Update code blocks containing metals.serverVersion
    document.querySelectorAll("pre code").forEach((codeEl) => {
      if (codeEl.textContent.includes("metals.serverVersion")) {
        codeEl.textContent = codeEl.textContent.replace(
          /"metals\.serverVersion":\s*"[^"]+"/,
          `"metals.serverVersion": "${currentVersion}"`
        );
      }
    });
  }

  // Run when DOM is ready and also observe for SPA navigation
  function init() {
    updateVersions();
    
    // Re-run on SPA navigation (Mintlify uses client-side routing)
    const observer = new MutationObserver(() => {
      if (showingFeedback) return;
      const versionEl = document.getElementById("metals-version");
      if (versionEl && versionEl.textContent !== currentVersion && !versionEl.textContent.includes("copied")) {
        updateVersions();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
