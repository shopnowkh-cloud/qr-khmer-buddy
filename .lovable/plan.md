## Change

In `src/routes/api/public/telegram/webhook.ts`, update `BTN.qr` from `"📱 QR Code"` to `"បង្កើត QR"`.

The 🔗 custom emoji icon (`icon_custom_emoji_id`) on the button stays as-is.

## Notes

- Comparisons like `text === BTN.qr` use the constant, so no other code changes are needed.
- No changes to other buttons, keyboards, or flows.