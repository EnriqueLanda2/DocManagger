import CryptoJS from 'crypto-js';

const SECURE_KEY = CryptoJS.enc.Utf8.parse('docPlatformSecureKey2024!!!!!!!!');

export function encryptPayload(data) {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECURE_KEY, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    const combined = iv.concat(encrypted.ciphertext);
    return CryptoJS.enc.Base64.stringify(combined);
}

export function decryptPayload(data) {
    const combined = CryptoJS.enc.Base64.parse(data);
    const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4), 16);
    const ciphertext = CryptoJS.lib.WordArray.create(
        combined.words.slice(4),
        combined.sigBytes - 16
    );
    const decrypted = CryptoJS.AES.decrypt({ ciphertext }, SECURE_KEY, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
}
