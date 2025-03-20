import sgMail from "@sendgrid/mail";
import {
  SENDGRID_API_KEY,
  SENDGRID_TEMPLATE_ID,
  SENDGRID_TEMPLATE_ID_RESET,
  FROM_EMAIL,
} from "../config/env";

interface EmailData {
  name: string;
  email: string;
  type: "verify" | "reset_password";
  link: string;
}
interface MailContent {
  type: string;
  value: string;
}

export const sendVerificationEmail = async (data: EmailData) => {
  sgMail.setApiKey(SENDGRID_API_KEY);
  try {
    const msg = {
      from: FROM_EMAIL,

      template_id:
        data.type === "verify"
          ? SENDGRID_TEMPLATE_ID
          : SENDGRID_TEMPLATE_ID_RESET,
      personalizations: [
        {
          to: [
            {
              email: data.email,
            },
          ],
          dynamic_template_data: {
            ...data,
            date: new Date().toLocaleDateString("nl-BE"),
          },
        },
      ],
      content: [
        {
          type: "text/html",
          value: "<p>This is a placeholder content.</p>",
        },
      ] as [MailContent],
    };
    JSON.stringify(msg.personalizations); // json in html
    await sgMail.send(msg); //volledige message
  } catch (error) {
    console.error(error);
  }
};
