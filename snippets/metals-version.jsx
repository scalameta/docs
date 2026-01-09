export const MetalsVersion = ({ fallback = "2.0.0-M2" }) => {
  const [version, setVersion] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("https://img.shields.io/maven-central/v/org.scalameta/metals_2.13.json")
      .then((res) => res.json())
      .then((data) => {
        if (data.value && data.value !== "unknown") {
          setVersion(data.value);
        }
      })
      .catch(() => {
        // Keep fallback version on error
      })
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(version).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <strong
      onClick={copyToClipboard}
      style={{ cursor: "pointer" }}
      title="Click to copy"
    >
      {loading ? "..." : version}
      {copied && (
        <span style={{ marginLeft: "4px", fontWeight: "normal", opacity: 0.7 }}>
          (copied)
        </span>
      )}
    </strong>
  );
};

export const MetalsVersionBlock = ({ fallback = "2.0.0-M2" }) => {
  const [version, setVersion] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("https://img.shields.io/maven-central/v/org.scalameta/metals_2.13.json")
      .then((res) => res.json())
      .then((data) => {
        if (data.value && data.value !== "unknown") {
          setVersion(data.value);
        }
      })
      .catch(() => {
        // Keep fallback version on error
      })
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(version).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const settingsJson = `{
  "metals.serverVersion": "${version}"
}`;

  return (
    <div style={{ position: "relative" }}>
      <pre
        style={{
          padding: "1rem",
          borderRadius: "8px",
          backgroundColor: "var(--tw-prose-pre-bg, #1e1e1e)",
          color: "var(--tw-prose-pre-code, #e5e5e5)",
          overflow: "auto",
          fontSize: "0.875rem",
          lineHeight: 1.7,
        }}
      >
        <code>{loading ? `{\n  "metals.serverVersion": "..."\n}` : settingsJson}</code>
      </pre>
      <button
        onClick={copyToClipboard}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          padding: "4px 8px",
          fontSize: "0.75rem",
          borderRadius: "4px",
          border: "1px solid rgba(255,255,255,0.2)",
          backgroundColor: "rgba(255,255,255,0.1)",
          color: "inherit",
          cursor: "pointer",
          opacity: 0.7,
          transition: "opacity 0.15s ease",
        }}
        title="Copy to clipboard"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
};
