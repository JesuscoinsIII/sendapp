import debug from 'debug'
import { expect } from '@playwright/test'
import { test as ethereumTest } from 'app/tests/fixtures/ethereum'
import { test as webauthnTest } from 'app/tests/fixtures/webauthn'
import { test as snapletTest } from 'app/tests/fixtures/snaplet'
import { mergeTests } from '@playwright/test'
import { AccountRecoveryPage } from 'app/tests/fixtures/auth/account-recovery/page'
import { isChallengeExpired } from 'app/utils/account-recovery'
import { clearCookies } from 'app/tests/fixtures/auth/account-recovery'
import { supabaseAdmin } from 'app/utils/supabase/admin'

const test = mergeTests(snapletTest, ethereumTest, webauthnTest)

test.beforeEach(async ({ page }) => {
  await clearCookies(page)
})

test('EOA: unauthorized - unrecognized EOA', async ({
  page,
  injectWeb3Provider,
  authenticator,
  seed,
}) => {
  const wallet = await injectWeb3Provider()
  const accountRecoveryPage = new AccountRecoveryPage(page, wallet, authenticator)
  await accountRecoveryPage.goto()
  await accountRecoveryPage.recoverWithEOA()

  await expect(await page.getByTestId('account-recovery-heading-error')).toBeVisible()

  // TODO: failing to sign challenge
  await page.screenshot({ path: 'screenshots/screenshot.png' })
  await expect(await page.getByTestId('account-recovery-description-error')).toHaveText(
    'Unrecognized chain address. Please try again.'
  )
})

/** 
test('EOA: unauthorized - expired challenge', async ({
  page,
  supabase,
  injectWeb3Provider,
  authenticator,
}) => {
  const wallet = await injectWeb3Provider()
  const accountRecoveryPage = new AccountRecoveryPage(page, wallet, authenticator)
  await accountRecoveryPage.goto()

  // challenge should be created
  const { data: challenge, error: getChallengeError } = await supabase
    .from('challenges')
    .select('*')
    .single()
  if (getChallengeError) {
    throw getChallengeError
  }

  // modify the challenge such that its expiry time is its creation time
  await supabase
    .from('challenges')
    .update({ expires_at: challenge.created_at })
    .eq('id', challenge.id)

  expect(await isChallengeExpired(challenge.id), 'challenge not expired')

  await accountRecoveryPage.recoverWithEOA()
  await expect(await page.getByText('Unable to recover account')).toBeVisible()
  await expect(await page.getByText('Challenge expired. Please try again.')).toBeVisible()

  // cleanup created challenge
  await supabase.from('challenges').delete().eq('id', challenge.id)
})
*/

test('EOA: authorized', async ({ page, injectWeb3Provider, authenticator }) => {
  // TODO: work on this
  // const plan = await seed.users([userOnboarded])

  // Get onboarded user's chain address
  // const user = plan.users[0]
  // const chainAddress = plan.chainAddresses[0]

  // TODO: private keys must be passed here?
  const wallet = await injectWeb3Provider()
  const accountRecoveryPage = new AccountRecoveryPage(page, wallet, authenticator)
  await accountRecoveryPage.goto()
  await accountRecoveryPage.recoverWithEOA()
  await expect(await page.getByTestId('token-balance-card')).toBeVisible()
})

test('Passkey: unauthorized - unrecognized passkey', async ({
  page,
  injectWeb3Provider,
  authenticator,
}) => {
  const wallet = await injectWeb3Provider()
  const accountRecoveryPage = new AccountRecoveryPage(page, wallet, authenticator)
  await accountRecoveryPage.goto()
  // TODO: get challenge
  const { data: challengeData, error: challengeError } = await supabaseAdmin
    .from('challenges')
    .select()
    .single()
  if (challengeError) {
    throw challengeError
  }

  // TODO: create passkey
  await accountRecoveryPage.createPasskey('test-user-id-TODO-remove', challengeData.challenge)

  await accountRecoveryPage.recoverWithPasskey()
  await page.screenshot({ path: 'screenshots/passkey-screenshot.png' })
  await expect(await page.getByTestId('account-recovery-heading-error')).toBeVisible()
  await expect(await page.getByTestId('account-recovery-description-error')).toHaveText(
    'Unrecognized passkey. Please try again.'
  )
})

test('Passkey: unauthorized - expired challenge', async ({
  page,
  injectWeb3Provider,
  authenticator,
}) => {
  const wallet = await injectWeb3Provider()
  const accountRecoveryPage = new AccountRecoveryPage(page, wallet, authenticator)
  await accountRecoveryPage.goto()
  await accountRecoveryPage.recoverWithPasskey()
})

test('Passkey: authorized', async ({ page, injectWeb3Provider, authenticator }) => {
  const wallet = await injectWeb3Provider()
  const accountRecoveryPage = new AccountRecoveryPage(page, wallet, authenticator)
  await accountRecoveryPage.goto()
  await accountRecoveryPage.recoverWithPasskey()
})
