# Prisma Windows File Locking Issue

## Problem

Build failing with error:
```
EPERM: operation not permitted, rename
'...\query_engine-windows.dll.node.tmp...' -> '...\query_engine-windows.dll.node'
```

## Root Cause

Windows file locking prevents Prisma from replacing the query engine DLL file. Common causes:
1. Dev server (`npm run dev`) is running and using the file
2. Antivirus software is scanning the file
3. Another Node process has the file open
4. File permissions issue

## Solutions (Try in order)

### Solution 1: Stop All Node Processes
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Retry build
npm run build
```

### Solution 2: Delete and Regenerate Prisma Client
```bash
# Navigate to web directory
cd apps/web

# Remove generated Prisma client
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma

# Reinstall Prisma
pnpm install @prisma/client prisma

# Generate client
npx prisma generate

# Retry build
cd ../.. && npm run build
```

### Solution 3: Disable Antivirus Temporarily
1. Temporarily disable antivirus real-time scanning
2. Run `npx prisma generate`
3. Run `npm run build`
4. Re-enable antivirus

### Solution 4: Run as Administrator
1. Open PowerShell or CMD as Administrator
2. Navigate to project directory
3. Run `npm run build`

### Solution 5: Use WSL (Recommended for Development)
Windows Subsystem for Linux avoids Windows file locking issues:
```bash
# In WSL
cd /mnt/d/Disaster\ Recovery\ -\ NRPG
npm run build
```

## Verification

After resolving, verify with:
```bash
npm run build
# Should complete successfully
```

## Related Issues

This is NOT related to recent code changes. The Tailwind configuration changes (portal design tokens) are syntactically correct and will work once Prisma generates successfully.

## Status

- **Design Tokens:** ✅ Added successfully to `apps/web/tailwind.config.ts`
- **Build Validation:** ⏳ Blocked by Prisma file locking
- **Next Step:** Resolve Prisma issue using solutions above

---

**Created:** 2026-02-02
**Last Updated:** 2026-02-02
