import type { SeedClientOptions, usersInputs } from '@snaplet/seed'
import { pravatar, tagName } from './utils'
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'
import { copycat, type Input } from '@snaplet/copycat'

export const models: SeedClientOptions['models'] = {
  users: {
    data: {
      phone: (ctx) => {
        return copycat
          .phoneNumber(ctx.seed, {
            length: {
              min: 7,
              max: 14, // max 15 including prefix
            },
          })
          .replace('+', '')
      },
      emailChangeTokenNew: (ctx) => {
        return copycat.uuid(ctx.seed)
      },
      confirmationToken: (ctx) => {
        return copycat.uuid(ctx.seed)
      },
      recoveryToken: (ctx) => {
        return copycat.uuid(ctx.seed)
      },
      phoneChangeToken: (ctx) => {
        return copycat.uuid(ctx.seed)
      },
      reauthenticationToken: (ctx) => {
        return copycat.uuid(ctx.seed)
      },
      emailChangeTokenCurrent: (ctx) => {
        return copycat.uuid(ctx.seed)
      },
    },
  },
  profiles: {
    data: {
      avatarUrl: (ctx) => pravatar(copycat.fullName(ctx.seed)),
    },
  },
  tags: {
    data: {
      name: (ctx) => tagName(copycat.username(ctx.seed)),
    },
  },
  sendAccounts: {
    data: {
      address: () => privateKeyToAddress(generatePrivateKey()),
      chainId: 845337,
    },
  },
  chainAddresses: {
    data: {
      address: () => privateKeyToAddress(generatePrivateKey()),
    },
  },
}

export const userOnboarded: usersInputs = {
  phone: (ctx) => {
    const phone = copycat.phoneNumber(ctx.seed, {
      length: {
        min: 7,
        max: 15, // max 15 including prefix
      },
    })
    return phone.replace('+', '')
  },
  profiles: [{}],
  tags: [
    {
      status: 'confirmed',
    },
  ],
  sendAccounts: [
    {
      chainId: 845337,
    },
  ],
  chainAddresses: [{}],
}
