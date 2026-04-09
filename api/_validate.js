// api/_validate.js
// Shared integrity checks for resources.js.
// Used by save-resources.js (pre-commit gate) and verify-resources.js (manual check).
// Files starting with _ are not treated as Vercel API endpoints.

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Count resources specifically inside the `export const resources = [...]` array.
 * Returns -1 if the array cannot be located.
 */
function countInResourcesArray(content) {
  const lines = content.split("\n");
  let inside = false;
  let count = 0;
  for (const line of lines) {
    if (!inside) {
      if (/^export\s+const\s+resources\s*=\s*\[/.test(line)) inside = true;
      continue;
    }
    if (line.trim() === "];") break;
    if (/\bid:"[^"]+"/.test(line)) count++;
  }
  return count;
}

/**
 * Return resource IDs that appear BEFORE `export const resources = [`.
 * A non-empty result means resources were inserted into the wrong array (e.g., RESOURCE_TYPES).
 */
function getIdsBeforeResourcesArray(content) {
  const lines = content.split("\n");
  const preamble = [];
  for (const line of lines) {
    if (/^export\s+const\s+resources\s*=\s*\[/.test(line)) break;
    preamble.push(line);
  }
  return [...preamble.join("\n").matchAll(/\bid:"([^"]+)"/g)].map((m) => m[1]);
}

/**
 * Return any IDs that appear more than once anywhere in the file.
 */
function findDuplicateIds(content) {
  const counts = {};
  for (const m of content.matchAll(/\bid:"([^"]+)"/g)) {
    counts[m[1]] = (counts[m[1]] || 0) + 1;
  }
  return Object.entries(counts)
    .filter(([, c]) => c > 1)
    .map(([id]) => id);
}

/**
 * Check for JavaScript syntax errors.
 * Returns null if the file is clean, or an error message string.
 */
function checkSyntax(content) {
  try {
    // Strip ES module export keywords — new Function() doesn't accept them
    const checkable = content
      .replace(/^export\s+const\s+/gm, "var ")
      .replace(/^export\s+function\s+/gm, "function ");
    // eslint-disable-next-line no-new-func
    new Function(checkable);
    return null;
  } catch (e) {
    return e.message;
  }
}

// ── Main validator ────────────────────────────────────────────────────────────

/**
 * Run all four integrity checks against a resources.js file content string.
 *
 * @param {string} content - The file content to validate.
 * @param {object} [opts]
 * @param {object[]} [opts.additions]      - Resources being added (for count check).
 * @param {string[]} [opts.removals]       - IDs being removed (for count check).
 * @param {string}   [opts.originalContent] - Content before changes (enables count check).
 * @returns {{ valid: boolean, errors: string[], count: number, originalCount?: number }}
 */
function validateContent(content, { additions = [], removals = [], originalContent = null } = {}) {
  const errors = [];

  // ── Check 4: JavaScript syntax ─────────────────────────────────────────────
  const syntaxErr = checkSyntax(content);
  if (syntaxErr) {
    // Stop here — other checks are meaningless on broken JS
    return { valid: false, errors: [`Syntax error: ${syntaxErr}`], count: -1 };
  }

  // Verify the resources array can be found at all
  if (!/^export\s+const\s+resources\s*=\s*\[/m.test(content)) {
    return {
      valid: false,
      errors: ['Could not locate "export const resources = [" — file structure is corrupted'],
      count: -1,
    };
  }

  // ── Check 1: No resource IDs outside the resources array ───────────────────
  const wrongIds = getIdsBeforeResourcesArray(content);
  if (wrongIds.length > 0) {
    errors.push(
      `Resource IDs inserted into the wrong array (found before resources[]): ${wrongIds.join(", ")}. ` +
        "This means the closing ]; search hit RESOURCE_TYPES or another array instead of resources."
    );
  }

  // ── Check 2: All IDs are unique ────────────────────────────────────────────
  const dupeIds = findDuplicateIds(content);
  if (dupeIds.length > 0) {
    errors.push(`Duplicate IDs: ${dupeIds.join(", ")}`);
  }

  const newCount = countInResourcesArray(content);

  // ── Check 3: Count change matches what was requested ──────────────────────
  let originalCount = null;
  if (originalContent !== null) {
    originalCount = countInResourcesArray(originalContent);
    const expectedDelta = additions.length - removals.length;
    const actualDelta = newCount - originalCount;

    if (actualDelta !== expectedDelta) {
      errors.push(
        `Resource count mismatch: expected ${originalCount} ` +
          `${expectedDelta >= 0 ? "+" : ""}${expectedDelta} = ${originalCount + expectedDelta}, ` +
          `got ${newCount}. Possible double-write, missed removal, or corrupted insertion.`
      );
    }

    // For additions specifically: verify each added ID is in the resources array
    if (additions.length > 0) {
      const missingFromArray = additions
        .filter((r) => r && r.id)
        .map((r) => r.id)
        .filter((id) => {
          const lines = content.split("\n");
          let inside = false;
          for (const line of lines) {
            if (!inside) {
              if (/^export\s+const\s+resources\s*=\s*\[/.test(line)) inside = true;
              continue;
            }
            if (line.trim() === "];") break;
            if (line.includes(`id:"${id}"`)) return false; // found ✓
          }
          return true; // not found in resources array ✗
        });

      if (missingFromArray.length > 0) {
        errors.push(
          `Added ID(s) not found inside the resources array: ${missingFromArray.join(", ")}. ` +
            "They may have been inserted into RESOURCE_TYPES or silently dropped."
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    count: newCount,
    ...(originalCount !== null ? { originalCount } : {}),
  };
}

module.exports = { validateContent, countInResourcesArray, checkSyntax };
