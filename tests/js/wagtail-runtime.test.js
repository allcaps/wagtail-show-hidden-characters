import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const candidates = [
  process.env.PYTHON,
  process.env.VIRTUAL_ENV && path.join(process.env.VIRTUAL_ENV, "bin/python"),
  ".venv/bin/python",
  "python3",
  "python",
].filter(Boolean);

const python = () => {
  for (const candidate of candidates) {
    try {
      execFileSync(candidate, ["-c", "import wagtail"], { stdio: "ignore" });
      return candidate;
    } catch {
      continue;
    }
  }

  throw new Error(
    `None of these can import wagtail: ${candidates.join(", ")}. ` +
      "Install the Python test dependencies before running npm test.",
  );
};

const askPython = (expr) =>
  execFileSync(python(), ["-c", `import wagtail; print(${expr})`], {
    encoding: "utf8",
  }).trim();

const wagtailAdminJsDir = () => {
  const dir = path.join(
    path.dirname(askPython("wagtail.__file__")),
    "admin/static/wagtailadmin/js",
  );

  if (!fs.existsSync(dir)) {
    throw new Error(`No Wagtail admin JavaScript found at ${dir}.`);
  }

  return dir;
};

const readBundle = (name) => {
  const file = path.join(wagtailAdminJsDir(), name);

  if (!fs.existsSync(file)) {
    throw new Error(`Wagtail no longer ships ${name}.`);
  }

  return fs.readFileSync(file, "utf8");
};

const stubAdminConfig = () => {
  const config = document.createElement("script");
  config.id = "wagtail-config";
  config.type = "application/json";
  config.textContent = JSON.stringify({
    ADMIN_URLS: {},
    CSRF_HEADER_NAME: "x-csrftoken",
    CSRF_TOKEN: "test-token",
    I18N_ENABLED: false,
    LOCALES: [],
  });
  document.body.append(config);
};

describe("Wagtail's Draftail runtime", () => {
  it("still exposes the browser APIs this package integrates with", () => {
    stubAdminConfig();
    window.eval(readBundle("vendor.js"));
    window.eval(readBundle("draftail.js"));

    expect(window.React).toBeDefined();
    expect(window.DraftJS).toBeDefined();
    expect(window.draftail).toBeDefined();
    expect(typeof window.draftail.registerPlugin).toBe("function");
  });
});
