const forge = require('node-forge');
const bcrypt = require('bcrypt');

function generateRSAKeys() {
    // توليد المفاتيح
    const keys = forge.pki.rsa.generateKeyPair(2048);
    return keys; // هنرجع الكائن نفسه مش النص
}

function encryptMessage(message, publicKey) {
    // التشفير باستخدام المفتاح مباشرة
    const encrypted = publicKey.encrypt(message, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
            md: forge.md.sha256.create()
        }
    });
    return forge.util.encode64(encrypted);
}

function decryptMessage(ciphertext, privateKey) {
    // فك التشفير
    const decoded = forge.util.decode64(ciphertext);
    const decrypted = privateKey.decrypt(decoded, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
            md: forge.md.sha256.create()
        }
    });
    return decrypted;
}

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

module.exports = { generateRSAKeys, encryptMessage, decryptMessage, hashPassword };