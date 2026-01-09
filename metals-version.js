// Fetch and display the latest Metals release version from Maven Central
(function() {
  const FALLBACK_VERSION = "2.0.0-M2";
  let currentVersion = FALLBACK_VERSION;
  let currentReleaseDate = null;
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

  async function fetchReleaseDate(version) {
    const cacheKey = `metals-release-date-${version}`;
    
    // Check localStorage cache first
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return new Date(cached);
      }
    } catch (e) {
      // localStorage might be unavailable
    }
    
    try {
      // Convert version to tag name (e.g., "v2.0.0-M2" from "2.0.0-M2")
      const tagName = version.startsWith("v") ? version : `v${version}`;
      
      // Get tag ref to find the commit SHA
      const refResponse = await fetch(`https://api.github.com/repos/scalameta/metals/git/refs/tags/${tagName}`);
      if (!refResponse.ok) return null;
      const refData = await refResponse.json();
      
      // Get commit details for the date
      const commitResponse = await fetch(refData.object.url);
      if (!commitResponse.ok) return null;
      const commitData = await commitResponse.json();
      
      const date = commitData.committer.date;
      
      // Cache the result
      try {
        localStorage.setItem(cacheKey, date);
      } catch (e) {
        // localStorage might be full or unavailable
      }
      
      return new Date(date);
    } catch (e) {
      console.warn("Failed to fetch release date:", e);
      return null;
    }
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
    currentReleaseDate = await fetchReleaseDate(currentVersion);
    
    // Update the version display element
    const versionEl = document.getElementById("metals-version");
    if (versionEl) {
      versionEl.textContent = currentVersion;
    }

    // Update the release date element (only show if successfully fetched)
    const dateEl = document.getElementById("metals-release-date");
    const dateWrapper = document.getElementById("metals-release-date-wrapper");
    if (dateEl && dateWrapper && currentReleaseDate) {
      dateEl.textContent = formatDate(currentReleaseDate);
      dateWrapper.style.display = "inline";
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
