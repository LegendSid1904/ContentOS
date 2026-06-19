const CANVA_API = "https://api.canva.com/rest/v1";
const CANVA_AUTH = "https://www.canva.com/api/oauth";
const BRAND_TEMPLATE_ID = process.env.CANVA_BRAND_TEMPLATE_ID;

interface CanvaToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/api/canva/callback`;
}

export function getAuthUrl(state: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.CANVA_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
    state,
    scope: "designs:create designs:read exports:create assets:read",
  });
  return `${CANVA_AUTH}/authorize?${params}`;
}

export async function exchangeCode(code: string): Promise<CanvaToken> {
  const res = await fetch(`${CANVA_API}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      client_id: process.env.CANVA_CLIENT_ID,
      client_secret: process.env.CANVA_CLIENT_SECRET,
      redirect_uri: getRedirectUri(),
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export async function refreshToken(refresh: string): Promise<CanvaToken> {
  const res = await fetch(`${CANVA_API}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refresh,
      client_id: process.env.CANVA_CLIENT_ID,
      client_secret: process.env.CANVA_CLIENT_SECRET,
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

async function getValidToken(userId: string): Promise<string> {
  const { db } = await import("@/lib/drizzle");
  const { profiles } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");

  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .then((r) => r[0]);

  const defaults = profile?.contentDefaults as Record<string, unknown> | null;
  if (!defaults?.canvaToken) {
    throw new Error("Canva not connected");
  }

  const stored = defaults.canvaToken as { refreshToken: string; accessToken: string; expiresAt: number };

  if (Date.now() < stored.expiresAt - 60000) {
    return stored.accessToken;
  }

  const refreshed = await refreshToken(stored.refreshToken);
  const existingDefaults = (profile?.contentDefaults ?? {}) as Record<string, unknown>;
  await db
    .update(profiles)
    .set({
      contentDefaults: {
        ...existingDefaults,
        canvaToken: refreshed,
      },
    })
    .where(eq(profiles.userId, userId));

  return refreshed.accessToken;
}

export async function createCanvaDesign(
  userId: string,
  params: {
    title: string;
    designType: string;
    templateId?: string;
    brandTemplateId?: string;
    data: Record<string, string>;
  }
) {
  const accessToken = await getValidToken(userId);

  const resolvedTemplate = params.brandTemplateId || BRAND_TEMPLATE_ID;

  const body: Record<string, unknown> = {
    title: params.title,
    design_type: params.designType,
  };

  if (resolvedTemplate) {
    body.brand_template_id = resolvedTemplate;
  }

  const res = await fetch(`${CANVA_API}/designs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Design creation failed: ${res.status} — ${err}`);
  }

  const design = await res.json();

  if (resolvedTemplate && Object.keys(params.data).length > 0) {
    await fillAutotemplate(accessToken, design.id, resolvedTemplate, params.data);
  }

  const shareRes = await fetch(`${CANVA_API}/designs/${design.id}/share`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role: "view",
    }),
  });

  let shareLink = "";
  if (shareRes.ok) {
    const shareData = await shareRes.json();
    shareLink = shareData.link ?? "";
  }

  return {
    designId: design.id,
    editUrl: design.urls?.edit_url ?? `https://canva.com/design/${design.id}/edit`,
    shareLink,
  };
}

export async function fillAutotemplate(
  accessToken: string,
  designId: string,
  templateId: string,
  data: Record<string, string>
) {
  const res = await fetch(`${CANVA_API}/designs/${designId}/autotemplates`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template_id: templateId,
      data,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Autotemplate failed: ${res.status} — ${err}`);
  }

  return res.json();
}

export async function exportDesign(
  userId: string,
  designId: string,
  format: "png" | "pdf" | "jpg" = "png"
) {
  const accessToken = await getValidToken(userId);

  const res = await fetch(`${CANVA_API}/exports`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      design_id: designId,
      format,
    }),
  });

  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  return res.json();
}

export async function getDesignUrl(userId: string, designId: string) {
  const accessToken = await getValidToken(userId);

  const res = await fetch(`${CANVA_API}/designs/${designId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Failed to get design: ${res.status}`);

  const data = await res.json();
  return {
    editUrl: data.urls?.edit_url ?? "",
    viewUrl: data.urls?.view_url ?? "",
  };
}
