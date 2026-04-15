const { SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = require("../config/aws/ses");
const { EMAIL_CONFIG } = require("../config/envConfig");
const {
    buildBookingNotificationTemplate,
} = require("../utils/templates/bookingNotification.template");
const {
    buildCustomerConfirmationTemplate,
} = require("../utils/templates/customerConfirmation.template");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseRetryCount(value, fallback = 3) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) return fallback;
    return parsed;
}

function getBookingRecipientList() {
    return EMAIL_CONFIG.BOOKING_NOTIFICATION_EMAILS;
}

async function sendEmailWithRetry({ toAddresses, subject, html, text, logger }) {
    const maxRetries = parseRetryCount(EMAIL_CONFIG.BOOKING_EMAIL_MAX_RETRIES, 3);

    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
        try {
            const command = new SendEmailCommand({
                Source: EMAIL_CONFIG.SES_FROM_EMAIL,
                Destination: {
                    ToAddresses: toAddresses,
                },
                Message: {
                    Subject: { Data: subject, Charset: "UTF-8" },
                    Body: {
                        Html: { Data: html, Charset: "UTF-8" },
                        Text: { Data: text, Charset: "UTF-8" },
                    },
                },
            });

            const response = await ses.send(command);

            logger?.info("Booking email sent successfully", {
                attempt,
                recipientsCount: toAddresses.length,
                messageId: response?.MessageId,
            });

            return { sent: true, attempt, messageId: response?.MessageId || null };
        } catch (error) {
            logger?.warn("Booking email send attempt failed", {
                attempt,
                maxRetries,
                error: error.message,
            });

            if (attempt === maxRetries) {
                return { sent: false, attempt, error: error.message };
            }

            await delay(attempt * 500);
        }
    }

    return { sent: false, attempt: maxRetries, error: "Unknown SES send failure" };
}

const sendBookingNotificationEmail = async (payload, logger) => {
    const recipients = getBookingRecipientList();

    if (!EMAIL_CONFIG.SES_FROM_EMAIL) {
        logger?.warn("Booking email skipped: SES_FROM_EMAIL is not configured");
        return { sent: false, skipped: true, reason: "missing_sender" };
    }

    if (!recipients.length) {
        logger?.warn(
            "Booking email skipped: BOOKING_NOTIFICATION_EMAILS is not configured",
        );
        return { sent: false, skipped: true, reason: "missing_recipients" };
    }

    const templatePayload = {
        ...payload,
        companyName: EMAIL_CONFIG.BOOKING_EMAIL_COMPANY_NAME,
        companyLogoUrl: EMAIL_CONFIG.BOOKING_EMAIL_COMPANY_LOGO_URL,
        companyWebsiteUrl: EMAIL_CONFIG.BOOKING_EMAIL_COMPANY_WEBSITE_URL,
    };

    const { subject, html, text } = buildBookingNotificationTemplate(templatePayload);

    return sendEmailWithRetry({
        toAddresses: recipients,
        subject,
        html,
        text,
        logger,
    });
};

const sendCustomerConfirmationEmail = async (payload, logger) => {
    const customerEmail = String(payload?.customerEmail || "").trim();

    if (!EMAIL_CONFIG.SES_FROM_EMAIL) {
        logger?.warn("Customer confirmation email skipped: SES_FROM_EMAIL is not configured");
        return { sent: false, skipped: true, reason: "missing_sender" };
    }

    if (!customerEmail) {
        logger?.warn("Customer confirmation email skipped: customer email is missing");
        return { sent: false, skipped: true, reason: "missing_customer_email" };
    }

    const templatePayload = {
        ...payload,
        companyName: EMAIL_CONFIG.BOOKING_EMAIL_COMPANY_NAME,
        companyLogoUrl: EMAIL_CONFIG.BOOKING_EMAIL_COMPANY_LOGO_URL,
        companyWebsiteUrl: EMAIL_CONFIG.BOOKING_EMAIL_COMPANY_WEBSITE_URL,
    };

    const { subject, html, text } = buildCustomerConfirmationTemplate(templatePayload);

    return sendEmailWithRetry({
        toAddresses: [customerEmail],
        subject,
        html,
        text,
        logger,
    });
};

module.exports = {
    sendBookingNotificationEmail,
    sendCustomerConfirmationEmail,
};
