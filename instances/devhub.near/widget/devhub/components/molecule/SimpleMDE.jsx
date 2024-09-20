/**
 * iframe embedding a SimpleMDE component
 * https://github.com/sparksuite/simplemde-markdown-editor
 */
const { getLinkUsingCurrentGateway } = VM.require(
  "${REPL_DEVHUB}/widget/core.lib.url"
) || { getLinkUsingCurrentGateway: () => {} };
const data = props.data;
const onChange = props.onChange ?? (() => {});
const onChangeKeyup = props.onChangeKeyup ?? (() => {}); // in case where we want immediate action
const height = props.height ?? "390";
const className = props.className ?? "w-100";
const embeddCSS = props.embeddCSS;
const sortedRelevantUsers = props.sortedRelevantUsers || [];

State.init({
  iframeHeight: height,
  message: props.data,
});

const profilesData = Social.get("*/profile/name", "final") ?? {};
const followingData =
  Social.get(`${context.accountId}/graph/follow/**`, "final") ?? {};

// SIMPLEMDE CONFIG //
const fontFamily = props.fontFamily ?? "sans-serif";
const alignToolItems = props.alignToolItems ?? "right";
const placeholder = props.placeholder ?? "";
const showAccountAutoComplete = props.showAutoComplete ?? false;
const showProposalIdAutoComplete = props.showProposalIdAutoComplete ?? false;
const autoFocus = props.autoFocus ?? false;

const queryName = "${REPL_PROPOSAL_FEED_INDEXER_QUERY_NAME}";
const query = `query GetLatestSnapshot($offset: Int = 0, $limit: Int = 10, $where: ${queryName}_bool_exp = {}) {
${queryName}(
  offset: $offset
  limit: $limit
  order_by: {proposal_id: desc}
  where: $where
) {
  name
  proposal_id
}
}`;

const proposalLink = getLinkUsingCurrentGateway(
  `${REPL_DEVHUB}/widget/app?page=proposal&id=`
);

const code = `
<!doctype html>
<html>
  <head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <style>
  body {  
      margin: auto;
      font-family: ${fontFamily};
      overflow: visible;
      font-size:14px !important;
  }

  @media screen and (max-width: 768px) {
    body {
      font-size: 12px;
    }
  }
  
  .cursor-pointer {
    cursor: pointer;
  }

  .text-wrap {
    overflow: hidden;
    white-space: normal;
  }

  .dropdown-item:hover,
  .dropdown-item:focus {
    background-color:rgb(0, 236, 151) !important;
    color:white !important;
    outline: none !important;
  }

  .editor-toolbar {
      text-align: ${alignToolItems};
  }
  
  .CodeMirror {
    min-height:200px !important; // for autocomplete to be visble 
  }

  .CodeMirror-scroll {
    min-height:200px !important; // for autocomplete to be visble 
  }

  ${embeddCSS}

  </style>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/highlight.js/latest/styles/github.min.css">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
</head>
<body>
<div class="dropdown">
  <button style="display: none" type="button" data-bs-toggle="dropdown">
    Dropdown button
  </button>

  <ul class="dropdown-menu" id="mentiondropdown" style="position: absolute;">
</div>
<div class="dropdown">
  <button style="display: none" type="button" data-bs-toggle="dropdown">
    Dropdown button
  </button>
  <ul class="dropdown-menu" id="referencedropdown" style="position: absolute;">
</div>
</ul>

<textarea></textarea>

<script src="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js" integrity="sha384-oBqDVmMz9ATKxIep9tiCxS/Z9fNfEXiDAYTujMAeBAsjFuCZSmKbSSUnQlmh/jp3" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js" integrity="sha384-cuYeSxntonz0PPNlHhBs68uyIAVpIIOZZ5JqeqvYYIcEL727kskC66kF92t6Xl2V" crossorigin="anonymous"></script>
<script>
let codeMirrorInstance;
let isEditorInitialized = false;
let followingData = {};
let profilesData = {};
let proposalLink = '';
let query = '';
let showAccountAutoComplete = ${showAccountAutoComplete};
let showProposalIdAutoComplete = ${showProposalIdAutoComplete};

function getSuggestedAccounts(term) {
  let results = [];

  term = (term || "").replace(/\W/g, "").toLowerCase();
  let limit = 5;
  if (term.length < 2) {
   results = [${sortedRelevantUsers
     .map((u) => "{accountId:'" + u + "', score: 60}")
     .join(",")}];
    limit = ${5 + sortedRelevantUsers.length};
  }

  const profiles = Object.entries(profilesData);

  for (let i = 0; i < profiles.length; i++) {
    let score = 0;
    const accountId = profiles[i][0];
    const accountIdSearch = profiles[i][0].replace(/\W/g, "").toLowerCase();
    const nameSearch = (profiles[i][1]?.profile?.name || "")
      .replace(/\W/g, "")
      .toLowerCase();
    const accountIdSearchIndex = accountIdSearch.indexOf(term);
    const nameSearchIndex = nameSearch.indexOf(term);

    if (accountIdSearchIndex > -1 || nameSearchIndex > -1) {
      score += 10;

      if (accountIdSearchIndex === 0) {
        score += 10;
      }
      if (nameSearchIndex === 0) {
        score += 10;
      }
      if (followingData[accountId] === "") {
        score += 30;
      }

      results.push({
        accountId,
        score,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  results = results.slice(0, limit);

  return results;
}

async function asyncFetch(endpoint, { method, headers, body }) {
  try {
    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: body
    });

    if (!response.ok) {
      throw new Error("HTTP error!");
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

function extractNumbers(str) {
  let numbers = "";
  for (let i = 0; i < str.length; i++) {
    if (!isNaN(str[i])) {
      numbers += str[i];
    }
  }
  return numbers;
};

async function getSuggestedProposals(id) {
  let results = [];
  const variables = {
    limit: 5,
    offset: 0,
    where: {},
  };
  if (id) {
    const proposalId = extractNumbers(id);
    if (proposalId) {
      variables["where"] = { proposal_id: { _eq: id } };
    } else {
      variables["where"] = {
        _or: [
          { name: { _iregex: id } },
          { summary: { _iregex: id } },
          { description: { _iregex: id } },
        ],
      };
    }
  }
  await asyncFetch("https://near-queryapi.api.pagoda.co/v1/graphql", {
    method: "POST",
    headers: { "x-hasura-role": "${REPL_INDEXER_HASURA_ROLE}" },
    body: JSON.stringify({
      query: query,
      variables: variables,
      operationName: "GetLatestSnapshot",
    }),
  })
    .then((res) => {
      const proposals =
        res?.data?.[
          "${REPL_PROPOSAL_FEED_INDEXER_QUERY_NAME}"
        ];
      results = proposals;
    })
    .catch((error) => {
      console.error(error);
    });
  return results;
};

// Initializes SimpleMDE element and attaches to text-area
const simplemde = new SimpleMDE({
  forceSync: true,
  toolbar: [
    "heading",
    "bold",
    "italic",
    "|", // adding | creates a divider in the toolbar
    "quote",
    "code",
    "link",
  ],
  placeholder: \`${placeholder}\`,
  initialValue: "",
  insertTexts: {
    link: ["[", "]()"],
  },
  spellChecker: false,
  renderingConfig: {
		singleLineBreaks: false,
		codeSyntaxHighlighting: true,
	},
  autofocus:${autoFocus}
});

codeMirrorInstance = simplemde.codemirror;

/**
 * Sends message to Widget to update content
 */
const updateContent = () => {
  const content = simplemde.value();
  window.parent.postMessage({ handler: "update", content }, "*");
};

/**
 * Sends message to Widget to update iframe height
 */
const updateIframeHeight = () => {
  const iframeHeight = document.body.scrollHeight;
  window.parent.postMessage({ handler: "resize", height: iframeHeight }, "*");
};

// On Change
simplemde.codemirror.on('blur', () => {
  updateContent();
});

simplemde.codemirror.on('keyup', () => {
  updateIframeHeight();
  const content = simplemde.value();
  window.parent.postMessage({ handler: "updateOnKeyup", content }, "*");
});


if (showAccountAutoComplete) {
  let mentionToken;
  let mentionCursorStart;
  const dropdown = document.getElementById("mentiondropdown");

  simplemde.codemirror.on("keydown", () => {
    if (mentionToken && event.key === 'ArrowDown') {
      dropdown.querySelector('button').focus();
      event.preventDefault();
      return false;
    }
  });

  simplemde.codemirror.on("keyup", (cm, event) => {
    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor);

    const createMentionDropDownOptions = () => {
      const mentionInput = cm.getRange(mentionCursorStart, cursor);
      dropdown.innerHTML = getSuggestedAccounts(mentionInput)
      .map(
        (item) =>
          '<li><button class="dropdown-item cursor-pointer w-100 text-wrap">' + item?.accountId + '</button></li>'
      )
      .join("");

      dropdown.querySelectorAll("li").forEach((li) => {
        li.addEventListener("click", () => {
          const selectedText = li.textContent.trim();
          simplemde.codemirror.replaceRange(selectedText, mentionCursorStart, cursor);
          mentionToken = null;
          dropdown.classList.remove("show");
          cm.focus();
        });
      });
    }
    // show dropwdown only when @ is at first place or when there is a space before @
      if (!mentionToken && (token.string === "@" && cursor.ch === 1 || token.string === "@" && cm.getTokenAt({line:cursor.line, ch: cursor.ch - 1}).string == ' ')) {
        mentionToken = token;
        mentionCursorStart = cursor;
        // Calculate cursor position relative to the iframe's viewport
        const rect = cm.charCoords(cursor);
        const x = rect.left;
        const y = rect.bottom;

        // Create dropdown with options
        dropdown.style.top = y + "px";
        dropdown.style.left = x + "px";

        createMentionDropDownOptions();

        dropdown.classList.add("show");

        // Close dropdown on outside click
        document.addEventListener("click", function(event) {
            if (!dropdown.contains(event.target)) {
                mentionToken = null;
                dropdown.classList.remove("show");
            }
        });
    } else if (mentionToken && token.string.match(/[^@a-z0-9.]/)) {
        mentionToken = null;
        dropdown.classList.remove("show");
    } else if (mentionToken) {
        createMentionDropDownOptions();
    }
});
}

if (showProposalIdAutoComplete) {
  let proposalId;
  let referenceCursorStart;
  const dropdown = document.getElementById("referencedropdown");
  const loader = document.createElement('div');
  loader.className = 'loader';
  loader.textContent = 'Loading...';

  simplemde.codemirror.on("keydown", () => {
    if (proposalId && event.key === 'ArrowDown') {
      dropdown.querySelector('button').focus();
      event.preventDefault();
      return false;
    }
  });

  simplemde.codemirror.on("keyup", (cm, event) => {
    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor);

    const createReferenceDropDownOptions = async () => {
      try {
        const proposalIdInput = cm.getRange(referenceCursorStart, cursor);
        dropdown.innerHTML = ''; // Clear previous content
        dropdown.appendChild(loader); // Show loader

        const suggestedProposals = await getSuggestedProposals(proposalIdInput);
        dropdown.innerHTML = suggestedProposals
        .map(
          (item) =>
            '<li><button class="dropdown-item cursor-pointer w-100 text-wrap">' + "#" + item?.proposal_id + " " + item.name + '</button></li>'
        )
        .join("");

        dropdown.querySelectorAll("li").forEach((li) => {
          li.addEventListener("click", () => {
            const selectedText = li.textContent.trim();
            const startIndex = selectedText.indexOf('#') + 1; 
            const endIndex = selectedText.indexOf(' ', startIndex);
            const id = endIndex !== -1 ? selectedText.substring(startIndex, endIndex) : selectedText.substring(startIndex);
            const link = proposalLink + id;
            const adjustedStart = {
              line: referenceCursorStart.line,
              ch: referenceCursorStart.ch - 1
            };
            simplemde.codemirror.replaceRange("[" + selectedText + "]" + "(" + link + ")", adjustedStart, cursor);
            proposalId = null;
            dropdown.classList.remove("show");
            cm.focus();
          });
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error: Remove loader
        dropdown.innerHTML = ''; // Clear previous content
      } finally {
        // Remove loader
        dropdown.removeChild(loader);
      }
    }

    // show dropwdown only when there is space before # or it's first char
      if (!proposalId && (token.string === "#" && cursor.ch === 1 || token.string === "#" && cm.getTokenAt({line:cursor.line, ch: cursor.ch - 1}).string == ' ')) {
        proposalId = token;
        referenceCursorStart = cursor;
        // Calculate cursor position relative to the iframe's viewport
        const rect = cm.charCoords(cursor);
        const x = rect.left;
        const y = rect.bottom;

        // Create dropdown with options
        dropdown.style.top = y + "px";
        dropdown.style.left = x + "px";

        createReferenceDropDownOptions();

        dropdown.classList.add("show");

        // Close dropdown on outside click
        document.addEventListener("click", function(event) {
            if (!dropdown.contains(event.target)) {
              proposalId = null;
                dropdown.classList.remove("show");
            }
        });
    } else if (proposalId && (token.string.match(/[^#a-z0-9.]/) || !token.string)) {
      proposalId = null;
      dropdown.classList.remove("show");
    } else if (proposalId) {
      createReferenceDropDownOptions();
  }
});

}

window.addEventListener("message", (event) => {
  if (!isEditorInitialized && event.data !== "") {
    simplemde.value(event.data.content);
    isEditorInitialized = true;
  } else {
    if (event.data.handler === 'refreshEditor' || event.data.handler === 'committed') {
      codeMirrorInstance.getDoc().setValue(event.data.content);
    }
  }
  if (event.data.followingData) {
    followingData = event.data.followingData;
  }
  if (event.data.profilesData) {
    profilesData = JSON.parse(event.data.profilesData);
  }
  if (event.data.query) {
    query = event.data.query;
  }
  if (event.data.proposalLink) {
    proposalLink = event.data.proposalLink;
  }
});
</script>
</body>
</html>
`;

return (
  <iframe
    className={className}
    style={{
      height: `${state.iframeHeight}px`,
      maxHeight: "410px",
      minHeight: "250px",
    }}
    srcDoc={code}
    message={{
      content: props.data?.content ?? "",
      followingData,
      profilesData: JSON.stringify(profilesData),
      query: query,
      handler: props.data.handler,
      proposalLink: proposalLink,
    }}
    onMessage={(e) => {
      switch (e.handler) {
        case "update":
          {
            onChange(e.content);
          }
          break;
        case "resize":
          {
            const offset = 10;
            State.update({ iframeHeight: e.height + offset });
          }
          break;
        case "updateOnKeyup":
          {
            onChangeKeyup(e.content);
          }
          break;
      }
    }}
  />
);
