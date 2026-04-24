const KEY_RAW = new TextEncoder().encode('docPlatformSecureKey2024!!!!!!!!');

async function getKey() {
    return crypto.subtle.importKey('raw', KEY_RAW, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encryptPayload(data) {
    const key = await getKey();
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, encoded);
    const combined = new Uint8Array(12 + ciphertext.byteLength);
    combined.set(nonce, 0);
    combined.set(new Uint8Array(ciphertext), 12);
    return btoa(String.fromCharCode(...combined));
}

export async function decryptPayload(data) {
    const key = await getKey();
    const combined = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    const nonce = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, key, ciphertext);
    return JSON.parse(new TextDecoder().decode(decrypted));
}
