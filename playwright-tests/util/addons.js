import { decodeResultJSON, encodeResultJSON } from "./transaction.js";

// function atob(string) {
//   return Buffer.from(string, "base64").toString("utf-8");
// }

export async function mockDefaultTabs(route) {
  const request = await route.request();
  const requestPostData = request.postDataJSON();

  const devComponents = (
    await fetch("http://localhost:3030").then((r) => r.json())
  ).components;

  /**
  1. Peter don't ask me again
  2. 599
  */
  const communityAccount = "webassemblymusic.community.devhub.near";

  // TODO Temporary
  if (
    requestPostData.params &&
    requestPostData.params.account_id === "social.near" &&
    requestPostData.params.method_name === "get"
  ) {
    if (requestPostData.params.args_base64) {
      console.log(atob(requestPostData.params.args_base64));
      const response = await route.fetch();
      const json = await response.json();
      let resultObj = decodeResultJSON(json.result.result);
      if (
        JSON.parse(atob(requestPostData.params.args_base64)).keys[0] ===
        `${communityAccount}/blog/**`
      ) {
        console.log("Transaction completed resultObj2", resultObj);
      } else {
        console.log("Transaction completed resultObj2 without blog key");
      }
    } else {
      console.log("No args_base64");
    }
  }

  if (
    requestPostData.params &&
    requestPostData.params.account_id === "devhub.near" &&
    requestPostData.params.method_name === "get_community" &&
    atob(requestPostData.params.args_base64).includes("handle")
  ) {
    // Add default tabs to community
    const response = await route.fetch();
    const json = await response.json();

    let resultObj = decodeResultJSON(json.result.result);

    resultObj.addons = [
      ...resultObj.addons,
      {
        id: "9yhcct",
        addon_id: "announcements",
        display_name: "Announcements",
        enabled: true,
        parameters: "{}",
      },
      {
        addon_id: "discussions",
        display_name: "Discussions",
        enabled: true,
        id: "gqyrw7",
        parameters: "{}",
      },
      {
        addon_id: "activity",
        display_name: "Activity",
        enabled: true,
        id: "bqyrw6",
        parameters: "{}",
      },
      {
        addon_id: "teams",
        display_name: "Teams",
        enabled: true,
        id: "cqyrw8",
        parameters: "{}",
      },
      {
        addon_id: "blogv2",
        display_name: "First Blog",
        enabled: true,
        id: "blogv2",
        parameters: "{}",
      },
      {
        addon_id: "blogv2",
        display_name: "Second Blog",
        enabled: true,
        id: "blogv2instance2",
        parameters: "{}",
      },
    ];

    json.result.result = encodeResultJSON(resultObj);

    await route.fulfill({ response, json });
    return;
  } else if (
    requestPostData.params &&
    requestPostData.params.account_id === "social.near" &&
    requestPostData.params.method_name === "get" &&
    requestPostData.params?.args_base64 &&
    // FIXME:
    JSON.parse(atob(requestPostData.params.args_base64)).keys[0] ===
      `${communityAccount}/blog/**`
  ) {
    console.log("Intercept blogs");
    console.log("-------------------------------------");
    console.log(atob(requestPostData.params.args_base64));
    console.log("-------------------------------------");

    // Intercept and adjust response to show the blogs we want
    const response = await route.fetch({
      url: "https://rpc.mainnet.near.org/",
    });
    const json = await response.json();
    let resultObj = decodeResultJSON(json.result.result);

    // Mock blog responses
    resultObj[communityAccount]["blog"] = {
      "hello-world-0r4rmr": {
        "": "# Content\n\n## subcontent\n\n### h3",
        metadata: {
          title: "Hello World",
          createdAt: "2024-04-28",
          updatedAt: "2024-04-28",
          publishedAt: "1998-05-03",
          status: "DRAFT",
          subtitle: "Subtitle",
          description: "Description",
          author: "Author",
          communityAddonId: "blogv2",
          category: "guide",
        },
      },
      "published-w5cj1y": {
        "": "# Content\n\n",
        metadata: {
          title: "PublishedBlog",
          createdAt: "2024-04-29",
          updatedAt: "2024-04-29",
          publishedAt: "2024-04-30",
          status: "PUBLISH",
          subtitle: "subtitle",
          description: "Description",
          author: "author",
          communityAddonId: "blogv2",
          category: "news",
        },
      },
      "first-blog-of-instance-2-nhasab": {
        "": "# First ever blog seperate from instance 1",
        metadata: {
          title: "First blog of instance",
          createdAt: "2024-04-30",
          updatedAt: "2024-05-13",
          publishedAt: "2024-04-30",
          status: "PUBLISH",
          subtitle: "Subtitle",
          description: "Description",
          author: "thomasguntenaar.near",
          communityAddonId: "blogv2instance2",
          category: "reference",
        },
      },
      "new-blog-post-cgomff": {
        "": "# Content",
        metadata: {
          title: "New Blog Post",
          createdAt: "2024-05-01",
          updatedAt: "2024-05-13",
          publishedAt: "1998-05-03",
          status: "PUBLISH",
          subtitle: "Subtitle",
          description: "Description",
          author: "Author",
          communityAddonId: "blogv2instance2",
          category: "news",
        },
      },
      "test-subscribe-mujrt8": {
        "": "# Content",
        metadata: {
          title: "Test Subscribe",
          publishedAt: "2023-04-03",
          status: "PUBLISH",
          subtitle: "subtitle",
          description: "description",
          author: "author",
          createdAt: "2024-05-01",
          communityAddonId: "blogv2",
          category: "guide",
          updatedAt: "2024-05-13",
        },
      },
    };

    json.result.result = encodeResultJSON(resultObj);

    await route.fulfill({ response, json });
  } else if (requestPostData.method === "tx") {
    await route.continue({ url: "https://archival-rpc.mainnet.near.org/" });
  } else if (
    requestPostData.params &&
    requestPostData.params.account_id === "social.near" &&
    requestPostData.params.method_name === "get"
    // This get is supposed to be under the other more specific
  ) {
    // console.log(JSON.parse(atob(requestPostData.params.args_base64)));
    const social_get_key = JSON.parse(atob(requestPostData.params.args_base64))
      .keys[0];

    const response = await route.fetch({
      url: "https://rpc.mainnet.near.org/",
    });
    const json = await response.json();

    // Replace component with local component
    if (devComponents[social_get_key]) {
      const social_get_key_parts = social_get_key.split("/");
      const devWidget = {};
      devWidget[social_get_key_parts[0]] = { widget: {} };
      devWidget[social_get_key_parts[0]].widget[social_get_key_parts[2]] =
        devComponents[social_get_key].code;
      json.result.result = Array.from(
        new TextEncoder().encode(JSON.stringify(devWidget))
      );
    }

    await route.fulfill({ response, json });
  } else {
    await route.continue();
  }
}
