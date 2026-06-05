// SendGrid email helper for the BFF worker
// Uses SendGrid v3 Mail Send API with dynamic templates

const SENDGRID_API = "https://api.sendgrid.com/v3/mail/send";

export interface ContactFormData {
  source?: string;
  company: string;
  name: string;
  email: string;
  model: string;
  message: string;
}

const MODEL_LABELS: Record<string, string> = {
  // Distribution / business page
  bulk: "Bulk Orders",
  distribution: "Distribution Partner",
  haas: "Hardware-as-a-Service",
  // Providers page
  nutrition: "Nutritionist / Dietitian",
  therapy: "Therapist / Counsellor",
  physio: "Physiotherapist / Rehab",
  fitness: "Fitness / Personal Training",
  wellness: "Wellness Studio / Spa",
  // Insurance page
  "health-plan": "Health Plan / Payer",
  employer: "Employer Benefits",
  tpa: "TPA / Benefits Administrator",
  other: "Other / Not sure",
};

interface SendGridTemplatePayload {
  to: string;
  from: { email: string; name: string };
  templateId: string;
  dynamicData: Record<string, string>;
}

async function sendTemplate(apiKey: string, payload: SendGridTemplatePayload): Promise<void> {
  const res = await fetch(SENDGRID_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: payload.to }],
        dynamic_template_data: payload.dynamicData,
      }],
      from: payload.from,
      template_id: payload.templateId,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SendGrid ${res.status}: ${text}`);
  }
}

/** Send internal notification to the sales team */
export async function sendSalesNotification(
  apiKey: string,
  salesEmail: string,
  templateId: string,
  data: ContactFormData
): Promise<void> {
  await sendTemplate(apiKey, {
    to: salesEmail,
    from: { email: "noreply@seemyhealth.ai", name: "SeeMyHealth" },
    templateId,
    dynamicData: {
      source: data.source || "Website",
      company: data.company,
      name: data.name,
      email: data.email,
      model: MODEL_LABELS[data.model] || data.model,
      message: data.message || "",
      timestamp: new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Nairobi",
      }),
    },
  });
}

/** Send acknowledgment email to the customer */
export async function sendCustomerAcknowledgment(
  apiKey: string,
  templateId: string,
  data: ContactFormData
): Promise<void> {
  await sendTemplate(apiKey, {
    to: data.email,
    from: { email: "noreply@seemyhealth.ai", name: "SeeMyHealth" },
    templateId,
    dynamicData: {
      first_name: data.name.split(" ")[0],
      company: data.company,
      model: MODEL_LABELS[data.model] || data.model,
      message: data.message || "",
    },
  });
}
