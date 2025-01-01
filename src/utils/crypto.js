const CRYPTO_KEY = import.meta.env.VITE_SECRET_KEY;


const SALT = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]); // Fixed salt for consistent key derivation

class CryptoUtils {
    static async getKey() {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(CRYPTO_KEY),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: SALT,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    static async encrypt(data) {
        if (!data) return null;

        const key = await this.getKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoder = new TextEncoder();

        const encryptedContent = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoder.encode(JSON.stringify(data))
        );

        const result = {
            iv: Array.from(iv),
            content: Array.from(new Uint8Array(encryptedContent))
        };

        return JSON.stringify(result);
    }

    static async decrypt(encryptedStr) {
        if (!encryptedStr) return null;

        const encryptedData = JSON.parse(encryptedStr);
        const key = await this.getKey();
        const decoder = new TextDecoder();

        const decryptedContent = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
            key,
            new Uint8Array(encryptedData.content)
        );

        return JSON.parse(decoder.decode(decryptedContent));
    }
}

export const secureStorage = {
    async setItem(key, value) {
        if (!value) return;
        const encrypted = await CryptoUtils.encrypt(value);
        localStorage.setItem(key, encrypted);
    },

    async getItem(key) {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;
        return await CryptoUtils.decrypt(encrypted);
    },

    removeItem(key) {
        localStorage.removeItem(key);
    },

    clear() {
        localStorage.clear();
    }
};