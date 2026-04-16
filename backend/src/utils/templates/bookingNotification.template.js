function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeDisplayValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function formatPrice(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return normalizeDisplayValue(value);
  return `$${numeric.toFixed(2)}`;
}

function formatBookingDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return normalizeDisplayValue(value);
  }
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function row(label, value) {
  return `
    <tr>
      <td style="padding:11px 14px;border:1px solid #2b3343;background:#161d2a;font-weight:600;color:#f2f4f8;">${escapeHtml(label)}</td>
      <td style="padding:11px 14px;border:1px solid #2b3343;color:#cfd5df;background:#0e1523;">${escapeHtml(
        normalizeDisplayValue(value),
      )}</td>
    </tr>
  `;
}

function rowHtml(label, htmlValue) {
  return `
    <tr>
      <td style="padding:11px 14px;border:1px solid #2b3343;background:#161d2a;font-weight:600;color:#f2f4f8;">${escapeHtml(label)}</td>
      <td style="padding:11px 14px;border:1px solid #2b3343;color:#cfd5df;background:#0e1523;">${htmlValue}</td>
    </tr>
  `;
}

function buildBookingNotificationTemplate(payload) {
  const companyName =
    normalizeDisplayValue(payload.companyName) === "-"
      ? "Somerville Mobile"
      : payload.companyName;
  const logoUrl = payload.companyLogoUrl || "";
  const brandUrl = payload.companyWebsiteUrl || "";
  const heading = `New Booking for ${companyName}`;
  const subject = `${companyName} - New booking ${normalizeDisplayValue(payload.bookingId)}`;
  const logoSection = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(companyName)} logo" width="148" style="display:block;border:0;outline:none;text-decoration:none;max-width:148px;height:auto;" />`
    : `<div style="display:inline-block;padding:8px 12px;border:1px solid #303949;border-radius:10px;background:#121927;color:#ffffff;font-weight:700;letter-spacing:0.2px;">${escapeHtml(companyName)}</div>`;

  const companyNameCell = brandUrl
    ? `<a href="${escapeHtml(brandUrl)}" style="color:#ffffff;text-decoration:none;font-weight:700;">${escapeHtml(companyName)}</a>`
    : `<span style="color:#ffffff;font-weight:700;">${escapeHtml(companyName)}</span>`;
  const normalizedCustomerPhone = normalizeDisplayValue(payload.customerPhone);
  const customerPhoneForTel = String(payload.customerPhone || "").replace(
    /[^+\d]/g,
    "",
  );
  const customerPhoneCell = customerPhoneForTel
    ? `<a href="tel:${escapeHtml(customerPhoneForTel)}" style="color:#60a5fa;text-decoration:underline;">${escapeHtml(normalizedCustomerPhone)}</a>`
    : escapeHtml(normalizedCustomerPhone);

  const customerEmailCell = payload.customerEmail && payload.customerEmail !== "-"
    ? `<a href="mailto:${escapeHtml(payload.customerEmail)}" style="color:#60a5fa;text-decoration:underline;">${escapeHtml(normalizeDisplayValue(payload.customerEmail))}</a>`
    : escapeHtml(normalizeDisplayValue(payload.customerEmail));

  const html = `
  <div style="margin:0;padding:26px;background:#080d17;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#d6dbe5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:780px;margin:0 auto;background:#0f1725;border-radius:16px;overflow:hidden;border:1px solid #273042;box-shadow:0 20px 45px rgba(0,0,0,0.35);">
      <tr>
        <td style="padding:22px 16px 18px;background-color:#101a2b;background-image:linear-gradient(120deg,#0f1725 0%,#101a2b 52%,#d42929 100%);color:#ffffff;border-bottom:1px solid #293249;border-radius:15px 15px 0 0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="vertical-align:middle;">${logoSection}</td>
              <td style="text-align:right;vertical-align:middle;">
                <div style="font-size:12px;letter-spacing:0.8px;text-transform:uppercase;color:#ffffff;font-weight:700;mix-blend-mode:screen;">Booking Alert</div>
              </td>
            </tr>
          </table>
          <h1 style="margin:16px 0 0;font-size:24px;line-height:1.25;font-weight:800;color:#ffffff;mix-blend-mode:screen;">${escapeHtml(heading)}</h1>
          <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#ffffff;mix-blend-mode:screen;">A customer submitted a booking request from your storefront.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:22px 16px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #2b3343;border-radius:10px;overflow:hidden;">
            ${row("Booking ID", payload.bookingId)}
            ${row("Created At", formatBookingDate(payload.createdAt))}
            ${row("Scheduled Date & Time", formatBookingDate(payload.scheduleDateTime))}
            ${row("Customer Name", payload.customerName)}
            ${rowHtml("Customer Email", customerEmailCell)}
            ${rowHtml("Customer Phone", customerPhoneCell)}
            ${row("Brand", payload.brandName)}
            ${row("Category", payload.categoryName)}
            ${row("Series", payload.seriesName)}
            ${row("Product", payload.productName)}
            ${row("Service", payload.serviceName)}
            ${row("Estimated Time (mins)", payload.estimatedTime)}
            ${row("Price", formatPrice(payload.price))}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 16px 22px;">
          <div style="padding:14px 16px;background:#111a2b;border:1px solid #2b3343;border-radius:10px;color:#bfc7d4;font-size:12px;line-height:1.6;">
            This is an automated notification from ${companyNameCell}. Please follow your internal workflow to confirm this booking with the customer.
          </div>
        </td>
      </tr>
    </table>
  </div>`;

  const text = [
    heading,
    "",
    `Company: ${normalizeDisplayValue(companyName)}`,
    `Booking ID: ${normalizeDisplayValue(payload.bookingId)}`,
    `Created At: ${formatBookingDate(payload.createdAt)}`,
    `Scheduled Date & Time: ${formatBookingDate(payload.scheduleDateTime)}`,
    `Customer Name: ${normalizeDisplayValue(payload.customerName)}`,
    `Customer Email: ${normalizeDisplayValue(payload.customerEmail)}`,
    `Customer Phone: ${normalizeDisplayValue(payload.customerPhone)}`,
    `Brand: ${normalizeDisplayValue(payload.brandName)}`,
    `Category: ${normalizeDisplayValue(payload.categoryName)}`,
    `Series: ${normalizeDisplayValue(payload.seriesName)}`,
    `Product: ${normalizeDisplayValue(payload.productName)}`,
    `Service: ${normalizeDisplayValue(payload.serviceName)}`,
    `Estimated Time (mins): ${normalizeDisplayValue(payload.estimatedTime)}`,
    `Price: ${formatPrice(payload.price)}`,
  ].join("\n");

  return { subject, html, text };
}

module.exports = { buildBookingNotificationTemplate };
