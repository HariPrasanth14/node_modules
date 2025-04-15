const crypto = require("crypto");

const SECRET_KEY = Buffer.from(
  process.env.SECRET_KEY_STRING.substring(0, 32),
  "utf8"
);

class OpenSSLCryptoService {
  constructor() {
    const secret = SECRET_KEY;
    if (!secret) {
      throw new Error("SECRET_KEY environment variable is not defined");
    }
    this.secretKey = Buffer.isBuffer(secret) ? secret : Buffer.from(secret);
  }

  encrypt(data) {
    try {
      const salt = crypto.randomBytes(8);
      const { key, iv } = this.#deriveKeyAndIv(salt);

      const plaintext = typeof data === "object" ? JSON.stringify(data) : String(data);

      const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
      const encrypted = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
      ]);

      const opensslBuffer = Buffer.concat([
        Buffer.from("Salted__"),
        salt,
        encrypted,
      ]);

      return opensslBuffer.toString("base64");
    } catch (error) {
      console.error("Encryption Error:", error.message);
      return null;
    }
  }

  decrypt(encryptedBase64) {
    this.#validateInput(encryptedBase64);
    const buffer = Uint8Array.from(Buffer.from(encryptedBase64, "base64"));

    const salt = buffer.slice(8, 16);
    const encryptedText = buffer.slice(16);

    const { key, iv } = this.#deriveKeyAndIv(salt);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    decipher.setAutoPadding(true);

    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  }

  #validateInput(encryptedBase64) {
    if (typeof encryptedBase64 !== "string" || !encryptedBase64.trim()) {
      console.log("Invalid input: must be a base64 string");
    }

    const buffer = Buffer.from(encryptedBase64, "base64");
    const header = buffer.slice(0, 8).toString("ascii");
    if (header !== "Salted__") {
      throw new Error("Invalid encrypted data: missing OpenSSL Salted__ header");
    }
  }

  #deriveKeyAndIv(salt) {
    let data = Buffer.concat([this.secretKey, salt]);
    let hash = crypto.createHash("md5").update(data).digest();
    let result = hash;
    let prev = hash;

    while (result.length < 48) {
      prev = crypto.createHash("md5").update(Buffer.concat([prev, data])).digest();
      result = Buffer.concat([result, prev]);
    }

    return {
      key: result.slice(0, 32),
      iv: result.slice(32, 48),
    };
  }
}

module.exports = new OpenSSLCryptoService();
