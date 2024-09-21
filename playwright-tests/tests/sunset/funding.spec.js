import { expect, test } from "@playwright/test";
import {
  pauseIfVideoRecording,
  selectAndAssert,
  setInputAndAssert,
} from "../../testUtils";

test.describe("Wallet is connected", () => {
  // sign in to wallet
  test.use({
    storageState: "playwright-tests/storage-states/wallet-connected.json",
  });

  test("should be able to submit a solution (funding request)", async ({
    //
    page,
  }) => {
    test.setTimeout(120000);
    await page.goto("/devhub.near/widget/app?page=create");

    await page.click('button:has-text("Solution")');
    await pauseIfVideoRecording(page);

    const titlefield = await page.getByTestId("name-editor");
    expect(titlefield).toBeVisible();
    await titlefield.scrollIntoViewIfNeeded();
    await titlefield.fill("The test title");
    await pauseIfVideoRecording(page);

    const descriptionInput = page
      .frameLocator("iframe")
      .locator(".CodeMirror textarea");
    await descriptionInput.focus();
    await descriptionInput.scrollIntoViewIfNeeded();
    await descriptionInput.fill("Developer contributor report by somebody");
    await descriptionInput.blur();
    await pauseIfVideoRecording(page);

    const tagsInput = page.locator(".rbt-input-multi");
    await tagsInput.scrollIntoViewIfNeeded();
    await tagsInput.focus();
    while (
      (await page.getByLabel("menu-options").innerText()) ===
      "No matches found."
    ) {
      await tagsInput.blur();
      await page.waitForTimeout(500);
      await tagsInput.focus();
    }
    await tagsInput.pressSequentially("paid-cont", { delay: 100 });
    await tagsInput.press("Tab");
    await tagsInput.pressSequentially("developer-da", { delay: 100 });
    await tagsInput.press("Tab");
    await pauseIfVideoRecording(page);

    await page.click('label:has-text("Yes") button');
    await selectAndAssert(page, 'div:has-text("Currency") select', "USDT");
    await setInputAndAssert(
      page,
      'input[data-testid="requested-amount-editor"]',
      "300"
    );
    await pauseIfVideoRecording(page);
    await page.getByTestId("requested-amount-editor").fill("300");
    await pauseIfVideoRecording(page);

    const submitbutton = await page.locator('button:has-text("Submit")');
    await submitbutton.scrollIntoViewIfNeeded();

    await pauseIfVideoRecording(page);

    await page.waitForTimeout(1000);
    await submitbutton.click();
    const transactionText = JSON.stringify(
      JSON.parse(await page.locator("div.modal-body code").innerText()),
      null,
      1
    );
    await expect(transactionText).toEqual(
      JSON.stringify(
        {
          parent_id: null,
          labels: ["paid-contributor", "developer-dao"],
          body: {
            name: "The test title",
            description:
              "###### Requested amount: 300 USDT\n###### Requested sponsor: @neardevdao.near\nDeveloper contributor report by somebody",
            solution_version: "V1",
            post_type: "Solution",
          },
        },
        null,
        1
      )
    );

    await pauseIfVideoRecording(page);
  });
});

test.describe("Wallet is connected by moderator", () => {
  test.use({
    storageState:
      "playwright-tests/storage-states/wallet-connected-moderator.json",
  });

  test("should be able to approve a funding request", async ({ page }) => {
    test.setTimeout(120000);
    await page.goto("/devhub.near/widget/app?page=post&id=2586");
    await page.click('button:has-text("Reply")');
    await page.click('li:has-text("Sponsorship")');
    await page
      .getByTestId("name-editor")
      .fill("Sponsorship: DevHub Platform Development Work");

    await page
      .getByText("Amount:", { exact: true })
      .getByRole("textbox")
      .fill("7050");

    await page.getByLabel("Select currency").selectOption("USDC");

    const descriptionInput = page
      .frameLocator("iframe")
      .last()
      .locator(".CodeMirror textarea");
    await descriptionInput.focus();
    await descriptionInput.fill(
      "Congrats on getting your funding request approved"
    );

    const tagsInput = await page.locator(".rbt-input-multi");
    await tagsInput.focus();
    while (
      (await page.getByLabel("menu-options").innerText()) ===
      "No matches found."
    ) {
      await tagsInput.blur();
      await page.waitForTimeout(500);
      await tagsInput.focus();
    }
    await tagsInput.pressSequentially("funding", { delay: 100 });
    await tagsInput.press("Tab");
    await tagsInput.pressSequentially("funding-information-coll", {
      delay: 100,
    });
    await tagsInput.press("Tab");

    await page.click('button:has-text("Submit")');

    const transactionText = JSON.stringify(
      JSON.parse(await page.locator("div.modal-body code").innerText()),
      null,
      1
    );
    await expect(transactionText).toEqual(
      JSON.stringify(
        {
          parent_id: 2586,
          labels: ["funding", "funding-information-collection"],
          body: {
            name: "Sponsorship: DevHub Platform Development Work",
            description: "Congrats on getting your funding request approved",
            amount: "7050",
            sponsorship_token: {
              NEP141: {
                address:
                  "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
              },
            },
            supervisor: "neardevdao.near",
            sponsorship_version: "V1",
            post_type: "Sponsorship",
          },
        },
        null,
        1
      )
    );
  });
});
