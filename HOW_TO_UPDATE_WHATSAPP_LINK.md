# How to Update Social Links

## Location
All social media links are stored in: `lib/constants.ts`

## Steps to Update

1. Open the file: `lib/constants.ts`

2. Find the links you want to update

## WhatsApp Group Link

**Find this line:**
```typescript
whatsapp: "https://chat.whatsapp.com/YOUR_GROUP_INVITE_LINK",
```

**Replace with your actual link:**
```typescript
whatsapp: "https://chat.whatsapp.com/AbCdEfGhIjKlMnOpQrSt",
```

### Getting Your WhatsApp Group Invite Link
1. Open your WhatsApp group
2. Tap on the group name at the top
3. Scroll down and tap "Invite via link"
4. Tap "Copy link"
5. Paste it in the constants file

## Telegram Group Link

**Find this line:**
```typescript
telegram: "https://t.me/YOUR_TELEGRAM_GROUP",
```

**Replace with your actual link:**
```typescript
telegram: "https://t.me/foss_cev",
```
or for private groups:
```typescript
telegram: "https://t.me/+AbCdEfGhIjKlMn",
```

### Getting Your Telegram Group Invite Link
1. Open your Telegram group
2. Tap on the group name at the top
3. Tap "Invite Links" or "Invite via Link"
4. Copy the link
5. Paste it in the constants file

## Where These Links Are Used

The social links are automatically used in:
- ✅ Navbar "Join Community" button (WhatsApp)
- ✅ Team page "Join_WhatsApp_Group" button (WhatsApp)
- ✅ Footer social links section (WhatsApp & Telegram)

## Other Social Links

You can also update:
- `github`: Your GitHub organization/profile
- `linkedin`: Your LinkedIn company page
- `instagram`: Your Instagram profile
- `email`: Contact email address

That's it! The links will automatically update everywhere in your website. 🎯
