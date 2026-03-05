# Deployment Tracking - Cyber Bunker Security Dashboard

## Version History

### v3.0 - 2026-03-05 (Current)
**Status:** ✅ DEPLOYED | Tests: 14/14 passing | TypeScript: 0 errors

#### New Modules
- IncidentResponse - full incident lifecycle management (open → investigating → contained → resolved → closed)
- ThreatIndicators - IOC, TTP, vulnerability, risk_factor, anomaly tracking
- PasswordEvaluator - local password/key strength analysis (no external API)
- NetworkExposure - network exposure analysis and port risk assessment

#### Database Changes
- NEW TABLE: incidents (severity, status, category, timeline, affected_devices)
- NEW TABLE: activity_log (action, module, severity, ip_address)
- NEW TABLE: threat_indicators (type, severity, status, source, mitigation)
- ALTERED: devices - added os, purpose, notes, riskLevel, isVerified, verifiedAt
- ALTERED: opsec_items - added isDefault, notes, dueDate

#### Backend Changes
- New tRPC routers: incidents, threats, activityLog, stats
- Idempotent seed check for protocols
- Auto-seed on first login

#### UI/UX Improvements
- SecurityLayout: mobile hamburger menu, grouped navigation, incident badge
- SecuritySkeleton: skeleton loading component
- Dashboard: Activity Log, incident statistics, quick actions
- OpsecChecklist: bulk actions, CSV export, per-category stats
- QRTransfer: SHA-256 hash, countdown timer, chunked QR
- DeviceRegistry: risk score, search, export, verification flow
- ProtocolLibrary: search, export, comparison view
- AuditSchedule: completion dialog, timeline, report export
- SmartHome: device groups, security scenarios, kill-switch, energy monitor
- PhysicalSecurity: implementation checklist, BIOS lock, Tamper detection
- TransferCalculator: 7 methods, Recharts visualization, scenario guide
- ConfigExport: real AES-256-GCM via Web Crypto API, SHA-256 checksum

### v2.0 - 2026-03-04
**Status:** ✅ DEPLOYED | Tests: 14/14 passing

#### Changes
- Fix: .dark CSS override synced with :root security theme
- Fix: seed import (removed .ts extension)
- New: SecureNotes page (CRUD, tags, copy, show/hide)
- New: Auto-seed OPSEC checklist on first login
- New: Idempotent protocol seed check

### v1.0 - 2026-03-04
**Status:** ✅ DEPLOYED | Tests: 14/14 passing

#### Initial Release
- 10 security modules
- Dark security theme (OKLCH, JetBrains Mono)
- Full tRPC backend with MySQL database
- Manus OAuth authentication

## Database Schema Summary (v3)

| Table | Rows (typical) | Purpose |
|-------|---------------|---------|
| users | 1-10 | OAuth user accounts |
| devices | 5-50 | Offline device registry |
| opsec_items | 29+ | Security checklist items |
| audit_schedule | 10-100 | Security audit calendar |
| transfer_sessions | 10-500 | QR transfer history |
| smart_home_devices | 5-50 | Zigbee/Z-Wave devices |
| security_protocols | 6+ | Protocol library |
| secure_notes | 0-100 | Encrypted notes |
| incidents | 0-100 | Security incidents |
| activity_log | 0-10000 | Audit trail |
| threat_indicators | 0-100 | IOC/TTP tracking |

## GitHub Repository
URL: https://github.com/szachmacik/cyber-bunker-security
Visibility: Private
Last Push: 2026-03-05

## Google Drive Tracking Document
URL: https://docs.google.com/document/d/1pCERoGjCvVVp-arfKTEBalbDJfWy0b9uzr_DD2eTmC4/edit
