# Taskly Design Asset Preservation

## Preservation Status
COMPLETE — All 43 confirmed planned native asset export units permanently preserved

## Preservation Model
Figma native export
→ external staging
→ exact-byte copy
→ SHA-256 validation
→ local manifest

## Figma-Independence Manifest Contract
* **Figma Desktop**: NOT REQUIRED for normal design implementation after preservation.
* **Figma Account**: NOT REQUIRED.
* **Figma MCP**: NOT REQUIRED.
* **Temporary Figma URLs**: NOT REQUIRED / NONE USED.
* **Screen References**: 100% LOCAL (`project-spec/design/screens/` — all 46 canonical screens preserved).
* **Design Tokens**: 100% LOCAL (`project-spec/design/figma-variables.json`, `tokens.md`).
* **Component/Pattern Documentation**: 100% LOCAL (`project-spec/design/figma-components.json`, `figma-components.md`, `figma-inventory.md`).
* **Reusable Visual Assets**: 100% LOCAL (`project-spec/design/assets/files/` — all 43 confirmed physical SVG files preserved).
* **Asset Manifest**: 100% LOCAL (`project-spec/design/assets/manifest.json`, `manifest.md`).
* **Font Dependency**: DOCUMENTED EXTERNAL DEPENDENCY — Inter (loaded via Next.js Google Fonts integration).
* **External `.fig` Backup**: DISASTER RECOVERY ONLY.

## Preservation Policy Clarification
During preservation, native Figma exports are retained as separate physical files unless physical deduplication is explicitly performed and documented. Identical SHA-256 values establish content identity but do not by themselves mean that physical files were merged. Therefore, **physical file count** (43) and **unique hash count** (42) are tracked as separate metrics.

## Global Planning Counts
* Documented references: 38
* Confirmed visual-audit new candidates: 3
* Excluded screenshot-derived candidates: 2
* Minimum physical export units: 43
* Processed export units: 43
* Physical permanent SVG files: 43
* Unique SHA-256 values: 42
* Duplicate logical/content relationships: 1
* Remaining unresolved export units: 0

*(Note: 43 is the complete physical export-unit count across the full design).*

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

## Batch C — Common Actions & Project Management
| ID | Asset Name | Category | Local Path | Size (Bytes) | SHA-256 | Source Screen | Source Frame | Duplicate Note |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| `icon-search` | Search Icon | common-action | `files/svg/icons/icon-search.svg` | 794 | `e46498763004b86d103f0fc2e8cf406a770bc84fc2bc24240685e44b66b12694` | tasks-board-desktop | `58:3524` | None |
| `icon-search-magnifier` | Search Magnifier Icon | common-action | `files/svg/icons/icon-search-magnifier.svg` | 1028 | `cf35e6fb943ff1bbab0b7a71d494960896b5a168e474bfda6f1bb99d474cd51e` | epics-list-desktop | `45:2643` | None |
| `icon-plus` | Plus Icon | common-action | `files/svg/icons/icon-plus.svg` | 174 | `1bd1831807a2ba74bbed1964721e932c3bd799fa5818300f3f8a17d35071f9a0` | epics-list-desktop, projects-list-desktop, tasks-board-desktop | `45:2643, 2:60, 58:3524` | None |
| `icon-user-invite-plus` | User Invite Plus Icon | common-action | `files/svg/icons/icon-user-invite-plus.svg` | 747 | `8c4fc30c56d305c693a079ef61cb8ae00377d02222f71a84a1fdde162aa2e880` | members-list-desktop | `15:912` | None |
| `icon-more-options` | More Options Vertical Dots Icon | common-action | `files/svg/icons/icon-more-options.svg` | 968 | `f3bc0bfb41fef5e45838769e889391246824d972ae54b35de7b9296435f7dbf0` | epics-list-desktop | `45:2643` | None |
| `icon-vertical-actions` | Vertical Actions Dots Icon | common-action | `files/svg/icons/icon-vertical-actions.svg` | 949 | `285534c10a1307430fe5312ebffcd7cdaa63f8f4e6a7987a506a541e3c9deeb1` | members-list-desktop | `15:912` | None |
| `icon-pagination-left` | Pagination Arrow Left Icon | common-action | `files/svg/icons/icon-pagination-left.svg` | 197 | `94541f1ceb2fdc71f4b6d1f9ce3774c96c0aedd0a631d11d7584f2dca4606fe5` | projects-list-desktop | `2:60` | None |
| `icon-pagination-right` | Pagination Arrow Right Icon | common-action | `files/svg/icons/icon-pagination-right.svg` | 207 | `e1493666b770915c9287d7574b9276248189c245b7612472303ee2b09e926b81` | projects-list-desktop | `2:60` | None |
| `icon-list-view` | List View Switcher Icon | common-action | `files/svg/icons/icon-list-view.svg` | 1435 | `30306128e3193439a738ed6c07286c6f3633aa228b22b0cdebcdf2094830e790` | tasks-board-desktop | `58:3524` | None |
| `icon-warning-triangle` | Warning Triangle Icon | common-action | `files/svg/icons/icon-warning-triangle.svg` | 507 | `90458dfa4fb3a79c1c5fabc34ad1ad24118399acc627aa220963248c18b4e1c9` | tasks-board-desktop | `58:3524` | None |
| `icon-clipboard-task` | Clipboard Task Icon | common-action | `files/svg/icons/icon-clipboard-task.svg` | 644 | `105765f5b4eb2caac1a3afa1ec01016a0b5b6b4f3e79541776f753df32985cda` | calendar-analytics-desktop | `6831:873` | None |
| `icon-checkmark` | Checkmark Icon | common-action | `files/svg/icons/icon-checkmark.svg` | 1084 | `0c06ef22c10ac7418c0131e26f955b0bfdc9898c565fb920dfd38170ac4a7a43` | calendar-analytics-desktop | `6831:873` | None |
| `icon-warning-alert` | Warning / Alert Icon | common-action | `files/svg/icons/icon-warning-alert.svg` | 507 | `90458dfa4fb3a79c1c5fabc34ad1ad24118399acc627aa220963248c18b4e1c9` | calendar-analytics-desktop | `6831:873` | Identical content to `icon-warning-triangle` |
| `icon-calendar` | Calendar Icon | common-action | `files/svg/icons/icon-calendar.svg` | 978 | `a7b5b7da4b758476764802ad8337327b7e7a8fc44a9eb41e1736c62baf752b51` | calendar-analytics-desktop, epics-list-desktop, projects-list-desktop, tasks-board-desktop | `6831:873, 45:2643, 2:60, 58:3524` | None |
| `icon-chevron-dropdown` | Chevron Dropdown Icon | common-action | `files/svg/icons/icon-chevron-dropdown.svg` | 183 | `e1276b5cc7396cab5db4871c1c29bf24a781c419ba5613baa4ed1e1065b42676` | calendar-analytics-desktop | `6831:873` | None |

### Compound Documented References Resolved in Batch C
* **Pagination Arrow Icons (`asset-cand-35`)**: Resolved into 2 distinct physical export units:
  1. `icon-pagination-left` (`Pagination Arrow Left Icon`)
  2. `icon-pagination-right` (`Pagination Arrow Right Icon`)
* **Board View Switcher Icon (`asset-cand-37`)**: Resolved as 1 confirmed physical export unit (`icon-list-view`, `List View Switcher Icon`). The previously inferred Kanban board toggle icon was not confirmed in Figma manual inspection and is excluded.

## Batch D — Style Guide Domain Icons
| ID | Asset Name | Category | Local Path | Size (Bytes) | SHA-256 | Source Screen | Source Frame | Duplicate Note |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| `icon-dashboard` | Dashboard Icon | domain-badge | `files/svg/domain/icon-dashboard.svg` | 260 | `66d330207444dd0539b7e9b7cb5e59a55e162685458935a2526dfe88538afbe0` | design-style-guide | `76:1757` | None |
| `icon-monitoring` | Monitoring Icon | domain-badge | `files/svg/domain/icon-monitoring.svg` | 490 | `0b63434b2913f0d60fd5818b34d66c44b6b02497b2018d7427f44969e00360a4` | design-style-guide | `76:1757` | None |
| `icon-inventory` | Inventory Icon | domain-badge | `files/svg/domain/icon-inventory.svg` | 632 | `c2ceb502505b8351556680bd39af822123c35cca29cdf522f7e5141ef1c6b6c9` | design-style-guide | `76:1757` | None |
| `icon-groups` | Groups Icon | domain-badge | `files/svg/domain/icon-groups.svg` | 2264 | `241c6e5d7d0a3a6ae2cf0f7e7aaa07141f047775cf4db7b0db2caf5666bebc96` | design-style-guide | `76:1757` | None |
| `icon-description` | Description Icon | domain-badge | `files/svg/domain/icon-description.svg` | 431 | `c4a3a5dbf305a79853fd472f0b5c7798ee853f35cc39e868cc1884846220a9ad` | design-style-guide | `76:1757` | None |
| `icon-mail` | Mail Icon | domain-badge | `files/svg/domain/icon-mail.svg` | 482 | `8c8fca06ad002e5e5403bb6cc6ce5a79e3f29350b91e43cd63e183dda3551260` | design-style-guide | `76:1757` | None |
| `icon-event` | Event Icon | domain-badge | `files/svg/domain/icon-event.svg` | 764 | `59538c706b28fdcf3b67bde115075d33d579cbb25a484e09c5df585870593d5d` | design-style-guide | `76:1757` | None |
| `icon-settings` | Settings Icon | domain-badge | `files/svg/domain/icon-settings.svg` | 2167 | `516ebc8c4abb883e61feadc191e8b7ed52593c91e4feea1263506d478bf2ff24` | design-style-guide | `76:1757` | None |
| `icon-shield` | Shield Icon | domain-badge | `files/svg/domain/icon-shield.svg` | 484 | `2bb9bac5843a356e4e4997d3258477f3f13e93d4c5cfcdfe4381bdc2aa965b36` | design-style-guide | `76:1757` | None |
| `icon-hub` | Hub Icon | domain-badge | `files/svg/domain/icon-hub.svg` | 4222 | `e5179b460083bb8d36bcd15f857d1b8e950d66ea1aa69fa047c0c3776681f9ae` | design-style-guide | `76:1757` | None |
| `icon-rocket` | Rocket Icon | domain-badge | `files/svg/domain/icon-rocket.svg` | 2346 | `91b464b768d27bfee262d472aa01b682d000c18456e8ed2710bd3872bd17e032` | design-style-guide | `76:1757` | None |
| `icon-architecture` | Architecture Icon | domain-badge | `files/svg/domain/icon-architecture.svg` | 996 | `74e90a34be6a86d083f59126b8cb9c53c19acf9f5cfb4a99ac5da6bfdad369ac` | design-style-guide | `76:1757` | None |

## Batch E — Empty-State Illustrations
| ID | Asset Name | Category | Local Path | Size (Bytes) | SHA-256 | Source Screen | Source Frame | Duplicate Note |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| `illustration-empty-projects` | Empty Projects Blueprint Illustration | empty-state | `files/svg/illustrations/illustration-empty-projects.svg` | 757 | `7648c4ddd5fbfedc4cd34c8dad0a524fc5da0b300f342bf71ad80a35f803e7e6` | projects-empty-desktop | `15:545` | None |
| `illustration-empty-epics` | Empty Epics Blueprint Illustration | empty-state | `files/svg/illustrations/illustration-empty-epics.svg` | 394 | `3df59e5bfbe6de42de3500267bd3e685a23660c717ccb2c7d22b8d34f203bf80` | epics-empty-desktop | `51:357` | None |

## Excluded Visual Candidates (False Positives)
1. **Mobile Close Drawer (X) Icon**:
   * Source screen: `layout-mobile-open` (`1:553`)
   * Status: `NOT_CONFIRMED_AFTER_MANUAL_FIGMA_INSPECTION`
   * Rationale: Inferred from screenshot visual inspection, but direct manual inspection in Figma did not confirm a standalone reusable close icon.
2. **Board / Kanban View Icon**:
   * Source screen: `tasks-board-desktop` (`58:3524`)
   * Status: `NOT_CONFIRMED_AFTER_MANUAL_FIGMA_INSPECTION`
   * Rationale: Inferred from screenshot view switcher container, but direct manual inspection in Figma did not confirm a standalone Kanban icon.

## Duplicate Findings & Storage Model
* **Processed export units (All Batches A through E)**: 43
* **Physical permanent SVG files**: 43
* **Unique SHA-256 values**: 42
* **Duplicate content relationships**: 1
* **Warning Triangle Icon (`icon-warning-triangle`) vs Warning / Alert Icon (`icon-warning-alert`)**:
  * Exported from different design contexts as two separate native files (`unit-26-warning-triangle.svg` from Tasks Board vs `unit-29-warning-alert.svg` from Calendar & Analytics).
  * Their exported bytes are identical (`90458dfa4fb3a79c1c5fabc34ad1ad24118399acc627aa220963248c18b4e1c9`).
  * Both physical files (`icon-warning-triangle.svg` and `icon-warning-alert.svg`) are intentionally retained as separate files during preservation.
  * No physical deduplication was applied.

## Font Dependency
* **Inter**: Documented external web dependency (loaded via Next.js Google Fonts integration). Font binaries are intentionally not vendored in the repository.

## Limitations
* Exact Figma leaf node IDs were not recoverable through the available Dev Mode MCP server; native frame-layer manual exports were used.
* All assets are preserved with 100% exact bytes matching native Figma SVG exports.
