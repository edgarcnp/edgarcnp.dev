/**
 * Post-quantum digital signing utilities.
 *
 * @remarks
 * Provides key generation, signing, and verification using NIST post-quantum
 * signature schemes. The primary algorithm is ML-DSA-65 (FIPS 204, formerly Dilithium),
 * with SLH-DSA (FIPS 205, formerly SPHINCS+) as an alternative.
 *
 * These are scaffolding interfaces — the actual implementation depends on
 * a post-quantum crypto library (e.g. `@noble/post-quantum`). Swap the
 * internal implementation when a suitable library is available for the
 * target runtime (Cloudflare Workers, Node.js, browser).
 *
 * @warning
 * The chosen library **must** claim side-channel resistance for ML-DSA
 * specifically — not just "implements FIPS 204." Lattice-based signing
 * involves polynomial sampling and rejection sampling that can leak secret
 * key material through timing or power analysis in naive implementations.
 *
 * @example
 * ```ts
 * const keys = await generateKeyPair();
 * const sig = await sign(new TextEncoder().encode("hello"), keys.privateKey);
 * const valid = await verify(new TextEncoder().encode("hello"), sig, keys.publicKey);
 * ```
 */

/** Supported post-quantum signature algorithms. */
export type PqAlgorithm = "ml-dsa-87";

/** A raw public key for a post-quantum signature scheme. */
export type PublicKey = Uint8Array;

/** A raw private (secret) key for a post-quantum signature scheme. */
export type PrivateKey = Uint8Array;

/** A digital signature produced by a post-quantum scheme. */
export type Signature = Uint8Array;

/** A generated key pair for signing and verification. */
export interface KeyPair {
    publicKey: PublicKey;
    privateKey: PrivateKey;
}

/**
 * Generate a new post-quantum key pair.
 *
 * @param algorithm - Signature scheme to use (default: `"ml-dsa-87"`).
 * @returns A `KeyPair` containing the public and private keys.
 *
 * @remarks
 * ML-DSA-87 (FIPS 204): ~2.5 KB public key, ~4.8 KB private key, ~4.6 KB signature.
 * Lattice-based (M-LWE). 256-bit post-quantum security level.
 * Narrower side-channel surface than hash-based schemes — polynomial
 * arithmetic is easier to make constant-time than repeated hash invocations.
 */
export async function generateKeyPair(
    algorithm: PqAlgorithm = "ml-dsa-87",
): Promise<KeyPair> {
    void algorithm;
    throw new Error(
        "Post-quantum signing not yet implemented. " +
        "Install a PQ crypto library (e.g. @noble/post-quantum) and replace this stub.",
    );
}

/**
 * Sign a message with a post-quantum private key.
 *
 * @param message   - Raw bytes of the message to sign.
 * @param privateKey - The signer's private key.
 * @param algorithm - Signature scheme (default: `"ml-dsa-87"`).
 * @returns The signature as raw bytes.
 */
export async function sign(
    message: Uint8Array,
    privateKey: PrivateKey,
    algorithm: PqAlgorithm = "ml-dsa-87",
): Promise<Signature> {
    void message;
    void privateKey;
    void algorithm;
    throw new Error(
        "Post-quantum signing not yet implemented. " +
        "Install a PQ crypto library (e.g. @noble/post-quantum) and replace this stub.",
    );
}

/**
 * Verify a post-quantum signature against a message and public key.
 *
 * @param message   - Raw bytes of the original message.
 * @param signature - The signature to verify.
 * @param publicKey - The signer's public key.
 * @param algorithm - Signature scheme (default: `"ml-dsa-87"`).
 * @returns `true` if the signature is valid, `false` otherwise.
 */
export async function verify(
    message: Uint8Array,
    signature: Signature,
    publicKey: PublicKey,
    algorithm: PqAlgorithm = "ml-dsa-87",
): Promise<boolean> {
    void message;
    void signature;
    void publicKey;
    void algorithm;
    throw new Error(
        "Post-quantum signing not yet implemented. " +
        "Install a PQ crypto library (e.g. @noble/post-quantum) and replace this stub.",
    );
}
