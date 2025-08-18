import { decode, verify } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

let cachedKeys: CryptoKey[] | null = null;

export async function verifyJwt(token: string): Promise<Record<string, unknown>> {
  if (!cachedKeys) {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/certs");
    const { keys } = await res.json();

    cachedKeys = await Promise.all(
      // deno-lint-ignore no-explicit-any
      keys.map((jwk: any) => crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, true, ["verify"]))
    );
  }

  for (const key of cachedKeys) {
    try {
      await verify(token, key); // 検証成功なら例外無し
      const decoded = decode(token);
      const payload = Array.isArray(decoded) ? decoded[1] : decoded;
      return payload as Record<string, unknown>;
    } catch (_) {
      // 次の鍵で検証
    }
  }

  throw new Error("JWT verification failed");
}
