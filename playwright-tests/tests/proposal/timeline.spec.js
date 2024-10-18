import { test as base, expect } from "@playwright/test";
import { pauseIfVideoRecording } from "../../testUtils.js";
import {
  setCommitWritePermissionDontAskAgainCacheValues,
  setDontAskAgainCacheValues,
} from "../../util/cache.js";
import {
  mockTransactionSubmitRPCResponses,
  decodeResultJSON,
  encodeResultJSON,
} from "../../util/transaction.js";
import { MOCK_RPC_URL, mockRpcRequest } from "../../util/rpcmock.js";

const test = base.extend({
  // Define an option and provide a default value.
  // We can later override it in the config.
  account: ["devhub.near", { option: true }],
  proposalAuthorAccountId: ["megha19.near", { option: true }],
});

test.afterEach(
  async ({ page }) => await page.unrouteAll({ behavior: "ignoreErrors" })
);

test.describe("Wallet is connected", () => {
  test.use({
    storageState: "playwright-tests/storage-states/wallet-connected.json",
  });

  // Test 1
  // When an admin resets a proposal from a later stage (e.g. Funded or Payment Processing)
  // back to Draft, the "Sponsor verifies KYC/KYB" checkbox should be cleared.
  // Test 2
  // When an admin resets a proposal from Draft -> rejected or cancelled,
  // the "Sponsor verifies KYC/KYB" checkbox should be cleared.

  test("Changing timeline status from Funded or Payment Processing to Draft, all checkboxes should be cleared.", async ({
    page,
    account,
  }) => {
    // Find a proposal that is in Funded or Payment Processing stage
    await page.goto(`/${account}/widget/app?page=proposal&id=112`);

    await page.waitForSelector(`iframe`, {
      state: "visible",
    });

    await pauseIfVideoRecording(page);

    // TODO implement
  });

  test("Changing timeline status from Rejected or Cancelled to Draft, all checkboxes should be cleared.", async ({
    page,
    account,
  }) => {
    // Find a proposal that is in Rejected or Cancelled stage
    await page.goto(`/${account}/widget/app?page=proposal&id=112`);

    await page.waitForSelector(`iframe`, {
      state: "visible",
    });

    await pauseIfVideoRecording(page);

    // TODO implement
  });
});
