const forge = require("node-forge");

function generateRSAKeys() {
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });

  return {
    publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
    privateKey: forge.pki.privateKeyToPem(keypair.privateKey)
  };
}

function encryptMessage(message, publicKeyPem) {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

  const encrypted = publicKey.encrypt(message, "RSA-OAEP", {
    md: forge.md.sha256.create()
  });

  return forge.util.encode64(encrypted);
}

function decryptMessage(ciphertext, privateKeyPem) {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

  return privateKey.decrypt(
    forge.util.decode64(ciphertext),
    "RSA-OAEP",
    {
      md: forge.md.sha256.create()
    }
  );
}

module.exports = {
  generateRSAKeys,
  encryptMessage,
  decryptMessage
}