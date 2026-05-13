# Supabase Security Implementation Guide

## Executive Summary

This guide explains all security measures implemented in the UOK (You OK?) application to protect user bonds, emergency contacts, and check-in data.

---

## 1. ROW LEVEL SECURITY (RLS) - Data Isolation

### What it does

RLS ensures users can only access their own data, even if they bypass the app.

### Policies Implemented

#### Policy 1: View Own Bonds (Outgoing)

```sql
Users can view bonds THEY created
Example: Abby can see that she bonded with "Mom"
```

#### Policy 2: View Incoming Bonds

```sql
Users can view bonds created BY them
Example: Mom can see that Abby bonded with her
```

#### Policy 3: Create Bonds (Authenticated Only)

```sql
Only logged-in users can create bonds
The email must match auth.users.email
```

#### Policy 4: Update Bonds (Owner Only)

```sql
Only the bond creator can update their bonds
Status changes (active/inactive/revoked) only by creator
```

#### Policy 5: Delete Bonds (Owner Only)

```sql
Only the bond creator can delete their bonds
Deleted bonds are still audited in the audit log
```

### How to Verify RLS is Working

1. Open Supabase Dashboard
2. Go to **Authentication** → **Policies**
3. Confirm policies exist for `bond_relationships`
4. Test: Try accessing another user's bonds - should fail with 403 Forbidden

---

## 2. AUDIT LOGGING - Compliance & Forensics

### What it does

Every INSERT, UPDATE, DELETE operation is logged for security compliance.

### Audit Table Structure

```
bond_relationships_audit
├── id: Unique audit record ID
├── bond_id: Which bond changed
├── action: INSERT/UPDATE/DELETE
├── old_data: Previous values (JSONB)
├── new_data: New values (JSONB)
├── changed_by: Which user made the change
├── created_at: When change happened
├── ip_address: Where request came from
└── user_agent: Browser/device info
```

### Example: Audit Trail for Revoked Bond

```
2024-02-09 10:00:00 | INSERT | Abby bonds with Mom | changed_by: abby@example.com
2024-02-09 10:30:00 | UPDATE | status: active      | changed_by: abby@example.com
2024-02-10 15:45:00 | UPDATE | status: revoked     | changed_by: abby@example.com
```

### How to View Audit Logs

1. Supabase Dashboard → SQL Editor
2. Run: `SELECT * FROM bond_relationships_audit ORDER BY created_at DESC LIMIT 50;`
3. Or programmatically via dashboard code

---

## 3. INPUT VALIDATION - Prevent Injection Attacks

### Constraints Implemented

#### Email Validation

```sql
Email must match pattern: user@domain.com
Prevents: SQL injection via email fields
Example Invalid: 'admin'; DROP TABLE bonds;--
```

#### Name Validation

```sql
Names must be 2-255 characters, alphanumeric + spaces
Pattern: ^[a-zA-Z0-9\s_-]{2,}$
Prevents: Control characters, scripts, injections
```

#### Bond Code Validation

```sql
Bond code must match: BOND-XXXXXX (6 alphanumeric)
Pattern: ^BOND-[A-Z0-9]{6}$
Prevents: Malformed bond codes being stored
```

#### Status Validation

```sql
Status must be one of: active, inactive, pending, revoked
Prevents: Invalid status values being set
```

### Where Validation Happens

1. **Database Level** (strongest): Constraints above prevent bad data
2. **Application Level** (backup): SetupContacts.tsx validates before sending
3. **API Level** (Supabase): Secondary validation on insert

---

## 4. RATE LIMITING - Abuse Prevention

### Current Implementation

- Max 10 bonds per user per hour (configurable)
- Tracked in `bond_rate_limits` table
- Checked via `check_bond_rate_limit()` function

### How to Use in App

```typescript
// In SetupContacts.tsx handleContinue()
const canCreate = await supabase.rpc("check_bond_rate_limit", {
  user_email: userEmail,
});

if (!canCreate) {
  alert("You've reached the maximum bonds per hour. Try again later.");
  return;
}
```

### Configuration

To change the limit:

1. Edit `check_bond_rate_limit()` function in SQL
2. Change `< 10` to desired number
3. Change `INTERVAL '1 hour'` to desired time window

---

## 5. ENCRYPTION AT REST & IN TRANSIT

### At Rest (Supabase Default)

- ✅ All data encrypted in PostgreSQL
- ✅ Automatic backups encrypted
- ✅ No plaintext passwords stored

### In Transit

- ✅ HTTPS only (enforced by Supabase)
- ✅ TLS 1.2+ for all connections
- ✅ JWT tokens in Authorization header

### How to Verify

1. Check browser DevTools → Network tab
2. All requests should show `https://`
3. No unencrypted data transmitted

---

## 6. AUTHENTICATION & JWT

### How JWT Token Security Works

```
User logs in → Supabase generates JWT token
   ↓
Token contains:
  - user ID
  - email
  - expiration time (1 hour)
  - encrypted signature
   ↓
Token sent with every request
   ↓
Supabase verifies signature on backend
   ↓
RLS policies use JWT to enforce row access
```

### Token Expiration

- Default: 1 hour (Supabase auth)
- Refresh tokens auto-refresh
- No manual token management needed

### Security Implications

- ✅ Tokens auto-expire (no infinite access)
- ✅ Signature prevents token tampering
- ✅ Email in JWT allows RLS policy enforcement

---

## 7. WHAT'S PROTECTED

### User Identity

- ✅ Email addresses encrypted in transit/at rest
- ✅ Passwords never stored (Supabase handles auth)
- ✅ Usernames cannot be enumerated

### Bond Data

- ✅ Only creator can view/modify bonds
- ✅ Contact cannot delete bonds
- ✅ All changes audited with timestamps
- ✅ IP address logged for forensics

### Check-in Data

- ✅ Only bonded users see check-ins
- ✅ Check-ins tagged with who they're from
- ✅ Audit trail shows who checked in when

---

## 8. WHAT'S NOT PROTECTED (Design Decisions)

### Intentionally Public

- ✅ Visitor counter (aggregated, anonymous)
- ✅ Featured ads (public content)
- ✅ Landing page info (public)

### Not Encrypted (Trade-offs)

- Contact name: Encrypted in transit, needed for notifications
- Bond code: Visible in QR code (by design for sharing)
- Status field: Needed for RLS queries

---

## 9. IMPLEMENTATION STEPS

### Step 1: Create Tables in Supabase

1. Go to https://supabase.com → Your Project
2. Open SQL Editor
3. Copy entire `SUPABASE_SECURE_SETUP.sql`
4. Run the script
5. Verify: All tables created without errors

### Step 2: Enable Realtime (Optional but Recommended)

1. Go to Settings → Replication
2. Toggle ON for `bond_relationships` table
3. This enables real-time notifications

### Step 3: Test RLS Policies

```sql
-- As user abby@example.com, run:
SELECT * FROM bond_relationships;
-- Should only see YOUR bonds

-- Then switch to user mom@example.com, run same query
-- Should only see HER bonds
```

### Step 4: Monitor Audit Logs

```sql
-- View all changes in past 24 hours
SELECT * FROM bond_relationships_audit
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Step 5: Set Up Alerts (Optional)

In Supabase Dashboard:

1. Functions → Create new Edge Function
2. Monitor for suspicious audit patterns
3. Alert on multiple failed authentication attempts

---

## 10. SECURITY CHECKLIST

Before deploying to production, verify:

- [ ] All tables created from `SUPABASE_SECURE_SETUP.sql`
- [ ] RLS is enabled on `bond_relationships` table
- [ ] All 5 RLS policies exist and active
- [ ] Audit table has at least 1 record
- [ ] Audit trigger is firing on INSERT/UPDATE/DELETE
- [ ] Test that User A cannot see User B's bonds
- [ ] Rate limiting function exists
- [ ] HTTPS is enforced (Supabase default)
- [ ] JWT tokens are being used (check Network tab)
- [ ] Backup is running (Supabase default: daily)

---

## 11. INCIDENT RESPONSE

### If Security is Breached

#### Immediate Actions

1. Revoke user's JWT token: User must re-login
2. Check audit logs: `SELECT * FROM bond_relationships_audit WHERE changed_by = 'attacker@example.com'`
3. Disable user account: Supabase Auth → Users → Disable user
4. Notify affected users: Send alert about revoked bonds

#### Investigation

```sql
-- Find all changes by suspicious user
SELECT * FROM bond_relationships_audit
WHERE changed_by = 'attacker@example.com'
ORDER BY created_at DESC;

-- Find all bonds created by suspicious user
SELECT * FROM bond_relationships
WHERE bonding_user_email = 'attacker@example.com'
AND created_at > '2024-02-08'; -- After incident start

-- Find which IP addresses accessed the data
SELECT DISTINCT ip_address, COUNT(*)
FROM bond_relationships_audit
WHERE changed_by = 'attacker@example.com'
GROUP BY ip_address;
```

#### Remediation

1. Delete malicious bonds: `DELETE FROM bond_relationships WHERE id = XXX;` (triggers audit)
2. Restore from backup if needed
3. Update security policies if vulnerability found
4. Deploy app fix if code vulnerability discovered

---

## 12. COMPLIANCE STANDARDS MET

### OWASP Top 10

- ✅ A1: Broken Access Control → RLS policies
- ✅ A2: Cryptographic Failures → HTTPS + encryption
- ✅ A3: Injection → Input validation constraints
- ✅ A4: Insecure Design → Audit logging
- ✅ A5: Security Misconfiguration → Supabase defaults secure
- ✅ A6: Vulnerable Components → Supabase auto-updates
- ✅ A7: Authentication Failures → JWT + session management
- ✅ A8: Software/Data Integrity → Signed JWTs

### GDPR Compliance

- ✅ Data Minimization: Only store necessary fields
- ✅ Access Control: RLS enforces user data isolation
- ✅ Audit Trail: Full audit log for compliance
- ✅ Encryption: Data protected in transit & at rest
- ✅ Deletion: Users can delete their bonds (audited)

### HIPAA Considerations

- ⚠️ Not HIPAA-certified (not a medical app)
- ✅ Has controls similar to HIPAA
- ✅ Audit logging comparable to HIPAA requirements

---

## 13. MONITORING & MAINTENANCE

### Daily Tasks

```sql
-- Check for errors
SELECT COUNT(*) as error_count
FROM bond_relationships_audit
WHERE action = 'ERROR'
AND created_at > NOW() - INTERVAL '1 day';
```

### Weekly Tasks

```sql
-- Review new bonds created
SELECT COUNT(*) as new_bonds
FROM bond_relationships
WHERE created_at > NOW() - INTERVAL '7 days'
AND status = 'active';

-- Check for rate limit violations
SELECT user_email, COUNT(*) as attempts
FROM bond_rate_limits
WHERE window_start > NOW() - INTERVAL '7 days'
GROUP BY user_email
HAVING COUNT(*) > 10;
```

### Monthly Tasks

1. Review all audit logs for anomalies
2. Check backup integrity
3. Update security policies if needed
4. Rotate any API keys
5. Review access logs for unauthorized attempts

---

## 14. CONTACT FOR SECURITY ISSUES

If you discover a security vulnerability:

1. **DO NOT** post it publicly
2. Email: security@youok.fit
3. Include: Description, steps to reproduce, impact
4. We will respond within 24 hours

---

## Quick Reference

| Security Layer   | Implementation  | Status           |
| ---------------- | --------------- | ---------------- |
| Authentication   | Supabase JWT    | ✅ Active        |
| Authorization    | RLS Policies    | ✅ 5 Policies    |
| Data Encryption  | HTTPS + At-Rest | ✅ Active        |
| Input Validation | SQL Constraints | ✅ 4 Constraints |
| Audit Logging    | Trigger + Table | ✅ Logging       |
| Rate Limiting    | Function-based  | ✅ 10/hour       |
| OWASP Coverage   | 8/10 Items      | ✅ Strong        |

---

**Last Updated**: 2024-02-09
**Status**: Production Ready
**Security Level**: HIGH
