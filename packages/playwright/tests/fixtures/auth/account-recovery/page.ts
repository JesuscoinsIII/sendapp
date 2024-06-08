import { expect, type Page } from '@playwright/test'
import type {
  Authenticator,
  PublicKeyCredentialAttestationSerialized,
} from '@0xsend/webauthn-authenticator'
import type { Web3ProviderBackend } from 'headless-web3-provider'
import debug from 'debug'
import type { CredentialCreationOptionsSerialized } from '@0xsend/webauthn-authenticator'

const logger = debug('AccountRecoveryPage')

export class AccountRecoveryPage {
  constructor(
    public readonly page: Page,
    public readonly wallet: Web3ProviderBackend,
    public readonly authenticator: Authenticator
  ) {}

  /**
   * Navigates to the account recovery screen
   *
   * @memberof AccountRecoveryPage
   */
  async goto() {
    logger('going to /auth/sign-in')

    await this.page.goto('/auth/sign-in')
    await this.page.getByText('Forgot your phone number?').click()
  }

  /**
   * Recover with EOA (`this.page` must be directed at the account recovery screen)
   * @see AccountRecoveryPage.goto()
   * @memberof AccountRecoveryPage
   */
  async recoverWithEOA() {
    logger('recovering with EOA...')
    await this.page.getByTestId('account-recovery-eoa-btn').click()
  }

  /**
   * Recover with passkey (`this.page` must be directed at the account recovery screen)
   * @see AccountRecoveryPage.goto()
   * @memberof AccountRecoveryPage
   */
  async recoverWithPasskey() {
    logger('recovering with Passkey...')
    await this.page.getByTestId('account-recovery-passkey-btn').click()
  }

  /**
   * Create passkey using webauthn mock and return the public key attestation object
   *
   * @param {string} userId -
   * @param null attestationChallenge
   * @memberof AccountRecoveryPage
   */
  async createPasskey(
    userId: string,
    attestationChallenge: `0x${string}`
  ): Promise<PublicKeyCredentialAttestationSerialized> {
    const credentialOptions = {
      publicKey: {
        rp: {
          id: 'https://send.app',
          name: 'Send',
        },
        user: {
          id: Buffer.from(userId).toString('base64url'),
          name: 'sendusername',
          displayName: 'Send User',
        },
        challenge: attestationChallenge,
        pubKeyCredParams: [
          {
            type: 'public-key',
            alg: -7,
          },
        ],
        timeout: 60000,
      },
    } as CredentialCreationOptionsSerialized

    return await this.authenticator.createPublicKeyCredential(credentialOptions)
  }

  async getChallenge(supabase) {}
}
