# Taskly Design Asset Preservation

## Preservation Status
PARTIAL — Batches A and B complete

## Preservation Model
Figma native export
→ external staging
→ exact-byte copy
→ SHA-256 validation
→ local manifest

## Global Planning Counts
* Documented references: 38
* Confirmed visual-audit new candidates: 3
* Excluded screenshot-derived candidates: 1
* Minimum physical export units: 44

*(Note: 44 is the minimum physical export-unit count across the full design, NOT the final unique-file count).*

## Batch A — Brand & Application Shell Assets
| ID | Asset Name | Category | Local Path | Size (Bytes) | SHA-256 | Source Screen | Source Frame |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| `brand-taskly-logomark` | TASKLY Brand Logomark | brand | `files/svg/brand/logo-taskly.svg` | 997 | `95269076abce0afd71feb09969a99a41a6bf6557dbada12efccac6c250c817be` | auth-login-desktop | `1:351` |
| `icon-projects` | Projects Folder Icon | navigation | `files/svg/icons/icon-projects.svg` | 195 | `dabe4e8d4cfa6b8d8bf0d08b8f9f0126268a152b453a92f9adde9b1ec57ad6a6` | layout-desktop-default | `1:986` |
| `icon-epics` | Epics Icon | navigation | `files/svg/icons/icon-epics.svg` | 292 | `7bf14cc1578087570e873c78103922cba619c9f5ab5b5fce6f541ae444fa6c2b` | layout-desktop-default | `1:986` |
| `icon-tasks` | Tasks Icon | navigation | `files/svg/icons/icon-tasks.svg` | 368 | `04631eb0f9450a631161c75ad05861e7e69489c5488622312b4d10e5f8a88835` | layout-desktop-default | `1:986` |
| `icon-members` | Members Icon | navigation | `files/svg/icons/icon-members.svg` | 1979 | `8b9f2b6a7f3692c857dee90fbec6e440bb3ce0b70e704f1345cf08c513f35305` | layout-desktop-default | `1:986` |
| `icon-details` | Details Icon | navigation | `files/svg/icons/icon-details.svg` | 1341 | `fba8a3633254600bbf78f4eae3051fe65de46b86c763af9651e9e44f26e07ba8` | layout-desktop-default | `1:986` |
| `icon-collapse` | Collapse Icon | navigation | `files/svg/icons/icon-collapse.svg` | 254 | `6ae0a90062893ed51f31e8d9980eb058957e9ec21d3f51eea63eabe025a2902a` | layout-desktop-default | `1:986` |
| `icon-logout` | Logout Icon | navigation | `files/svg/icons/icon-logout.svg` | 362 | `cb3b38348d0ed40aee319f40a1fb2b6657eeae422ff59a95bc7146a1aaadc289` | layout-desktop-default | `1:986` |
| `icon-mobile-menu` | Mobile Hamburger Menu Icon | navigation | `files/svg/icons/icon-mobile-menu.svg` | 176 | `fdfce2034804280ce7fcbf8fb29d6c0af87ca4b8285318d1711e1bcd90c5265b` | layout-mobile-closed | `1:401` |

## Batch B — Authentication & Form Controls
| ID | Asset Name | Category | Local Path | Size (Bytes) | SHA-256 | Source Screen | Source Frame |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| `icon-eye` | Eye Icon | form-control | `files/svg/icons/icon-eye.svg` | 1319 | `7cf49e6cf687ac72cc95b752d1adb4171859ea22acd0ae968c6e210a696d23c7` | auth-login-desktop | `1:351` |
| `icon-password-visibility-toggle` | Password Visibility Toggle Icon | form-control | `files/svg/icons/icon-password-visibility-toggle.svg` | 1145 | `99f1d4b512261e1ca41657454a8f67345925b16fa9d0372b5d73ecb37a232e2c` | auth-sign-up-desktop | `1:1219` |
| `icon-checkbox` | Checkbox Icon | form-control | `files/svg/icons/icon-checkbox.svg` | 191 | `3e368c75bc3f1b9be59c8a748ad30c628bccaec777cdb3002ef978e3b795c5e6` | auth-login-desktop | `1:351` |
| `icon-validation-check` | Validation Checkmark Circle Icon | form-control | `files/svg/icons/icon-validation-check.svg` | 1268 | `ab3b1025ed9c4d5d1c5447bc803ee787561af18cdb70fd30c67b9a7a3317f97b` | auth-sign-up-desktop | `1:1219` |
| `icon-validation-neutral` | Validation Neutral / Cross Circle Icon | form-control | `files/svg/icons/icon-validation-neutral.svg` | 1377 | `7e0ffb3aec8d3e4a76076b527a81a6f1db3eb206d66ff3a29508214c236e712e` | auth-sign-up-desktop | `1:1219` |

### Compound Documented References Resolved in Batch B
* **Validation Checklist Icons (`asset-cand-05`)**: Resolved into 2 distinct physical export units:
  1. `icon-validation-check` (`Validation Checkmark Circle Icon`)
  2. `icon-validation-neutral` (`Validation Neutral / Cross Circle Icon`)

## Excluded Visual Candidate
* **Mobile Close Drawer (X) Icon**:
  * Source screen: `layout-mobile-open` (`1:553`)
  * Status: `NOT_CONFIRMED_AFTER_MANUAL_FIGMA_INSPECTION`
  * Rationale: Initially inferred during reference PNG inspection, but direct manual inspection in Figma did not confirm a standalone reusable close icon. No repository file was created.

## Duplicate Findings
* Total processed export units (Batch A + B): 14
* Total unique SHA-256 hashes: 14
* Exact duplicate groups: 0
* **Eye Icon vs Password Visibility Toggle Icon**: SHA-256 hashes differ (`e147b30e...` vs `ebc7e923...`); both preserved as distinct physical files.

## Remaining Asset Batches
* **Batch C**: Common Actions & Project Management (~15 export units)
* **Batch D**: Style Guide Domain Badges (~12 export units)
* **Batch E**: Empty State Illustrations (~2 export units)

## Font Dependency
* **Inter**: Documented external web dependency (loaded via Next.js Google Fonts integration). Font binaries are intentionally not vendored in the repository.

## Limitations
* Exact Figma leaf node IDs were not recoverable through the available Dev Mode MCP server; native frame-layer manual exports were used.
* All assets are preserved with 100% exact bytes matching native Figma SVG exports.
