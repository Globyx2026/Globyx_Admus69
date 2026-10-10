import { site } from './site';

/**
 * Sample API calls shown on the home page and in the developer docs.
 * BACKEND: these describe the planned public API. Keep them in step with the
 * real endpoints once the API exists.
 */

export interface CodeSample {
  /** Tab label. */
  label: string;
  code: string;
}

const API = site.apiBase;

export const buyNumberSamples: CodeSample[] = [
  {
    label: 'cURL',
    code: `# Rent a UK mobile number with SMS and voice
curl -X POST ${API}/numbers \\
  -H "Authorization: Bearer $GLOBYX_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "country": "GB",
    "type": "mobile",
    "capabilities": ["sms", "voice"]
  }'`,
  },
  {
    label: 'Python',
    code: `import os
import requests

# Rent a UK mobile number with SMS and voice
response = requests.post(
    "${API}/numbers",
    headers={"Authorization": f"Bearer {os.environ['GLOBYX_API_KEY']}"},
    json={
        "country": "GB",
        "type": "mobile",
        "capabilities": ["sms", "voice"],
    },
)

number = response.json()
print(number["phone_number"])`,
  },
  {
    label: 'Node.js',
    code: `// Rent a UK mobile number with SMS and voice
const response = await fetch("${API}/numbers", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.GLOBYX_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    country: "GB",
    type: "mobile",
    capabilities: ["sms", "voice"],
  }),
});

const number = await response.json();
console.log(number.phone_number);`,
  },
];

export const proxyCredentialSamples: CodeSample[] = [
  {
    label: 'cURL',
    code: `# Get residential credentials for Kenya, sticky for 10 minutes
curl -G ${API}/proxies/credentials \\
  -H "Authorization: Bearer $GLOBYX_API_KEY" \\
  -d plan=residential \\
  -d country=KE \\
  -d session=sticky_10m`,
  },
  {
    label: 'Python',
    code: `import os
import requests

# Get residential credentials for Kenya, sticky for 10 minutes
response = requests.get(
    "${API}/proxies/credentials",
    headers={"Authorization": f"Bearer {os.environ['GLOBYX_API_KEY']}"},
    params={"plan": "residential", "country": "KE", "session": "sticky_10m"},
)

proxy = response.json()
print(proxy["host"], proxy["port"])`,
  },
  {
    label: 'Node.js',
    code: `// Get residential credentials for Kenya, sticky for 10 minutes
const query = new URLSearchParams({
  plan: "residential",
  country: "KE",
  session: "sticky_10m",
});

const response = await fetch(\`${API}/proxies/credentials?\${query}\`, {
  headers: { Authorization: \`Bearer \${process.env.GLOBYX_API_KEY}\` },
});

const proxy = await response.json();
console.log(proxy.host, proxy.port);`,
  },
];

export const sendMessageSamples: CodeSample[] = [
  {
    label: 'cURL',
    code: `# Reply to a customer from one of your numbers
curl -X POST ${API}/messages \\
  -H "Authorization: Bearer $GLOBYX_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "+447700900218",
    "to": "+447700900431",
    "text": "Your order is out for delivery."
  }'`,
  },
  {
    label: 'Python',
    code: `import os
import requests

# Reply to a customer from one of your numbers
requests.post(
    "${API}/messages",
    headers={"Authorization": f"Bearer {os.environ['GLOBYX_API_KEY']}"},
    json={
        "from": "+447700900218",
        "to": "+447700900431",
        "text": "Your order is out for delivery.",
    },
)`,
  },
  {
    label: 'Node.js',
    code: `// Reply to a customer from one of your numbers
await fetch("${API}/messages", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.GLOBYX_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "+447700900218",
    to: "+447700900431",
    text: "Your order is out for delivery.",
  }),
});`,
  },
];

export const webhookSample: CodeSample[] = [
  {
    label: 'Payload',
    code: `{
  "event": "message.received",
  "id": "evt_8f2c1a",
  "created_at": "2026-02-18T09:41:07Z",
  "data": {
    "to": "+447700900218",
    "from": "+447700900431",
    "text": "Hi, is my order arriving today?"
  }
}`,
  },
];

export const errorSample: CodeSample[] = [
  {
    label: 'Response',
    code: `{
  "error": {
    "code": "insufficient_balance",
    "message": "Wallet balance is too low for this purchase.",
    "status": 402
  }
}`,
  },
];
