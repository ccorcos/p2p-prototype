/*

TODO:
- mock out all the crypto abstractions.
- write crypto tests.
- public channel abstraction.
- address abstration.
- transport abstraction.
- state machine for clients.


*/

// ============================================================================
// Crypto Abstractions
// ============================================================================

// Just generic types really.
class SymmetricKey {}
class PrivateKey {}
class PublicKey {}

class SymmetricEncryptedData {}

declare function createSymmetricKey(): SymmetricKey
declare function symmetricEncrypt(
	key: SymmetricKey,
	data: any
): SymmetricEncryptedData
declare function symmetricDecrypt(
	key: SymmetricKey,
	encrypted: SymmetricEncryptedData
): any

class PublicPrivateKeyPair {
	public: PublicKey
	private: PrivateKey
}

class PublicEncryptedData {}
class PrivateSignedData {}

declare function createPublicPrivateKeyPair(): PublicPrivateKeyPair
declare function publicEncrypt(key: PublicKey, data: any): PublicEncryptedData
declare function privateDecrypt(
	key: PrivateKey,
	encrypted: PublicEncryptedData
): any
declare function privateSign(key: PrivateKey, data: any): PrivateSignedData
declare function publicVerify(key: PublicKey, signature: PrivateSignedData): any

class Hash {}
declare function computeHash(data: any): Hash

// ============================================================================
// Higher level message abstractions
// ============================================================================

type MessagePayload = {
	encryptedSessionKey: PublicEncryptedData
	encryptedMessage: SymmetricEncryptedData
}

type Message = {
	from: PublicKey
	data: any
	hash: Hash
	signedHash: PrivateSignedData
}

function encryptPublicMessage(
	from: PublicPrivateKeyPair,
	to: PublicKey,
	data: any
): MessagePayload {
	const sessionKey = createSymmetricKey()
	const encryptedSessionKey = publicEncrypt(to, sessionKey)

	const hash = computeHash(data)

	const signedHash = privateSign(from.private, hash)

	const message: Message = {
		from: from.public,
		data,
		hash,
		signedHash,
	}

	const encryptedMessage = symmetricEncrypt(sessionKey, message)

	return { encryptedSessionKey, encryptedMessage }
}

function decryptPublicMessage(
	me: PublicPrivateKeyPair,
	from: PublicKey,
	payload: MessagePayload,
	contacts: Set<PublicKey>
) {
	// Decrypt.
	const sessionKey = privateDecrypt(
		me.private,
		payload.encryptedSessionKey
	) as SymmetricKey

	const message = symmetricDecrypt(
		sessionKey,
		payload.encryptedMessage
	) as Message

	// Verify known contact.
	if (!contacts.has(message.from)) throw new Error("Unknown sender.")

	// Verify signature.
	if (message.hash !== computeHash(message.hash))
		throw new Error("Invalid hash.")

	const decrypedHash = publicVerify(from, message.signedHash) as Hash

	if (message.hash !== decrypedHash) throw new Error("Invalid signature.")

	return message.data
}
