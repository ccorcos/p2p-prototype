// ============================================================================
// Crypto Abstractions
// ============================================================================

// Just generic types really.
export class SymmetricKey {}
export class PrivateKey {}
export class PublicKey {}

export class SymmetricEncryptedData {}

export declare function createSymmetricKey(): SymmetricKey
export declare function symmetricEncrypt(
	key: SymmetricKey,
	data: any
): SymmetricEncryptedData
export declare function symmetricDecrypt(
	key: SymmetricKey,
	encrypted: SymmetricEncryptedData
): any

export type PublicPrivateKeyPair = {
	public: PublicKey
	private: PrivateKey
}

export class PublicEncryptedData {}
export class PrivateSignedData {}

export declare function createPublicPrivateKeyPair(): PublicPrivateKeyPair
export declare function publicEncrypt(
	key: PublicKey,
	data: any
): PublicEncryptedData
export declare function privateDecrypt(
	key: PrivateKey,
	encrypted: PublicEncryptedData
): any
export declare function privateSign(
	key: PrivateKey,
	data: any
): PrivateSignedData
export declare function publicVerify(
	key: PublicKey,
	signature: PrivateSignedData
): any

export class Hash {}
export declare function computeHash(data: any): Hash

// ============================================================================
// Higher level message abstractions
// ============================================================================

export type MessagePayload = {
	encryptedSessionKey: PublicEncryptedData
	encryptedMessage: SymmetricEncryptedData
}

export type Message = {
	from: PublicKey
	data: any
	signedHash: PrivateSignedData
}

export function signMessage(
	me: PublicPrivateKeyPair,
	to: PublicKey,
	data: any
): Message {
	const hash = computeHash({ to, data })
	const signedHash = privateSign(me.private, hash)
	return { from: me.public, data, signedHash }
}

export function verifyMessage(me: PublicPrivateKeyPair, message: Message) {
	const expectedHash = computeHash({ to: me.public, data: message.data })
	const decrypedHash = publicVerify(message.from, message.signedHash) as Hash
	if (expectedHash !== decrypedHash) throw new Error("Invalid signature.")
}

export function encryptPublicMessage(
	me: PublicPrivateKeyPair,
	to: PublicKey,
	data: any,
	sessionKey: SymmetricKey
): MessagePayload {
	const encryptedSessionKey = publicEncrypt(to, sessionKey)
	const message = signMessage(me, to, data)
	const encryptedMessage = symmetricEncrypt(sessionKey, message)
	return { encryptedSessionKey, encryptedMessage }
}

export function decryptPublicMessage(
	me: PublicPrivateKeyPair,
	payload: MessagePayload
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

	// Verify signature.
	verifyMessage(me, message)

	return { sessionKey, message }
}
