const { normalize } = VM.require("${REPL_DEVHUB}/widget/core.lib.stringUtils");
const { getDepositAmountForWriteAccess } = VM.require(
  "${REPL_DEVHUB}/widget/core.lib.common"
);

getDepositAmountForWriteAccess || (getDepositAmountForWriteAccess = () => {});
normalize || (normalize = () => {});

const CenteredMessage = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 384px;
`;

const LoadingButtonSpinner = (
  <span
    class="submit-post-loading-indicator spinner-border spinner-border-sm"
    role="status"
    aria-hidden="true"
  ></span>
);

function initLabels() {
  const labels = [];
  if (typeof props.labels === "string") {
    labels.push(...props.labels.split(","));
  }
  if (Array.isArray(props.labels)) {
    labels.push(...props.labels);
  }
  if (props.referral) {
    labels.push(`referral:${props.referral}`);
  }
  return labels;
}

if (!context.accountId) {
  return (
    <CenteredMessage height={"384px"}>
      <h2>Please sign in to create a post.</h2>
    </CenteredMessage>
  );
}

const userStorageDeposit = Near.view(
  "${REPL_SOCIAL_CONTRACT}",
  "storage_balance_of",
  {
    account_id: context.accountId,
  }
);

const cleanDescription = (description) => {
  return description
    ? description.replace(
        /###### Requested amount: .+?\n###### Requested sponsor: @[^\s]+\n/g,
        ""
      )
    : description;
};

const postTypeOptions = {
  Idea: {
    name: "Idea",
    icon: "bi-lightbulb",
    description:
      "Get feedback from the community about a problem, opportunity, or need.",
  },

  Solution: {
    name: "Solution",
    icon: "bi-rocket",
    description:
      "Provide a specific proposal or implementation to an idea, optionally requesting funding. If your solution relates to an existing idea, please reply to the original post with a solution.",
  },
};

let fields = {
  Comment: ["description"],
  Idea: ["name", "description"],
  Solution: ["name", "description", "fund_raising"],
  Attestation: ["name", "description"],
  Sponsorship: [
    "name",
    "description",
    "amount",
    "sponsorship_token",
    "supervisor",
  ],
  Github: ["githubLink", "name", "description"],
};

const isCreatePostPage = props.isCreatePostPage ?? false;
const postType = props.postType ?? "Idea";
const parentId = props.parentId ?? null;
const mode = props.mode ?? "Create";
const labelStrings = initLabels();
const [postIdList, setPostIdList] = useState(null); // to show updated post after approve txn
const [showPostPage, setShowPostPage] = useState(false); // show newly created post
const [postId, setPostId] = useState(props.postId ?? null);
const [postData, setPostData] = useState(null); // for capturing edit post change
const [isTxnCreated, setCreateTxn] = useState(false);
const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);

useEffect(() => {
  if (mode == "Edit") {
    const data = Near.view("${REPL_DEVHUB_LEGACY}", "get_post", {
      post_id: postId,
    });
    if (!postData) {
      setPostData(data);
    }
    if (postData && data && JSON.stringify(postData) !== JSON.stringify(data)) {
      props.setEditorState(false);
      props.setExpandReplies(true);
      setPostData(data);
    }
  } else {
    const postIds = Near.view("${REPL_DEVHUB_LEGACY}", "get_all_post_ids");
    if (!postIdList) {
      setPostIdList(postIds);
    }
    if (
      isTxnCreated &&
      postIdList?.length > 0 &&
      postIds.length > 0 &&
      postIdList.length !== postIds.length
    ) {
      props.onDraftStateChange(null);
      if (isCreatePostPage) {
        setShowPostPage(true);
        setPostId(postIds[postIds?.length - 1]);
      } else {
        // close editor and expand replies
        props.setEditorState(false);
        props.setExpandReplies(true);
      }
      setPostIdList(postIds);
    }
  }
});

const labels = labelStrings.map((s) => {
  return { name: s };
});

initState({
  seekingFunding: props.seekingFunding ?? false,
  author_id: context.accountId,
  // Should be a list of objects with field "name".
  labels,
  // Should be a list of labels as strings.
  // Both of the label structures should be modified together.
  labelStrings: [],
  postType,
  name: props.name ?? "",
  description:
    (props.postType === "Solution"
      ? cleanDescription(props.description)
      : props.description) ?? "",
  amount: props.amount ?? "0",
  token: props.token ?? "USDT",
  supervisor: props.supervisor ?? "neardevdao.near",
  githubLink: props.githubLink ?? "",
  warning: "",
  draftStateApplied: false,
  mentionInput: "", // text next to @ tag
  mentionsArray: [], // all the mentions in the description
  displayFields: fields[postType],
});

/* INCLUDE: "core/lib/autocomplete" */
const autocompleteEnabled = true;

const AutoComplete = styled.div`
  z-index: 5;

  > div > div {
    padding: calc(var(--padding) / 2);
  }
`;

if (props.transactionHashes) {
  const transaction = useCache(
    () =>
      asyncFetch("${REPL_RPC_URL}", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "dontcare",
          method: "tx",
          params: [props.transactionHashes, context.accountId],
        }),
      }).then((res) => res),
    props.transactionHashes + context.accountId,
    { subscribe: false }
  );

  if (transaction !== null) {
    const transaction_method_name =
      transaction?.body?.result?.transaction?.actions[0].FunctionCall
        .method_name;

    const is_edit_or_add_post_transaction =
      transaction_method_name == "add_post" ||
      transaction_method_name == "edit_post";

    if (is_edit_or_add_post_transaction) {
      props.onDraftStateChange(null);
    }

    // show the latest created post to user
    if (transaction_method_name == "add_post" && isCreatePostPage) {
      setShowPostPage(true);
      setPostId(postIdList?.[postIdList?.length - 1]);
    }
  }
}

function textareaInputHandler(value) {
  const words = value.split(/\s+/);
  const allMentiones = words
    .filter((word) => word.startsWith("@"))
    .map((mention) => mention.slice(1));
  const newMentiones = allMentiones.filter(
    (item) => !state.mentionsArray.includes(item)
  );

  State.update((lastKnownState) => ({
    ...lastKnownState,
    text: value,
    showAccountAutocomplete: newMentiones?.length > 0,
    mentionsArray: allMentiones,
    mentionInput: newMentiones?.[0] ?? "",
  }));
}

function autoCompleteAccountId(id) {
  // to make sure we update the @ at correct index
  let currentIndex = 0;
  const updatedDescription = state.description.replace(
    /(?:^|\s)(@[^\s]*)/g,
    (match) => {
      if (currentIndex === state.mentionsArray.indexOf(state.mentionInput)) {
        currentIndex++;
        return ` @${id}`;
      } else {
        currentIndex++;
        return match;
      }
    }
  );
  State.update((lastKnownState) => ({
    ...lastKnownState,
    handler: "autocompleteSelected",
    description: updatedDescription,
    showAccountAutocomplete: false,
  }));
}

/* END_INCLUDE: "core/lib/autocomplete" */

if (!state.draftStateApplied && props.draftState) {
  State.update({ ...props.draftState, draftStateApplied: true });
}

const typeSwitch = (optionName) => {
  State.update({
    postType: optionName,
    displayFields: fields[optionName],
  });
};

// This must be outside onClick, because Near.view returns null at first, and when the view call finished, it returns true/false.
// If checking this inside onClick, it will give `null` and we cannot tell the result is true or false.
let grantNotify = Near.view(
  "${REPL_SOCIAL_CONTRACT}",
  "is_write_permission_granted",
  {
    predecessor_id: "${REPL_DEVHUB_LEGACY}",
    key: context.accountId + "/index/notify",
  }
);
if (grantNotify === null || userStorageDeposit === null) {
  return;
}

const tokenMapping = {
  NEAR: "NEAR",
  USDT: {
    NEP141: {
      address: "usdt.tether-token.near",
    },
  },
  USDC: {
    NEP141: {
      address:
        "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
    },
  },
};

const onSubmit = () => {
  setIsSubmittingTransaction(true);
  let labels = state.labelStrings;
  var body = {
    Comment: { description: state.description, comment_version: "V2" },
    Idea: {
      name: state.name,
      description: state.description,
      idea_version: "V1",
    },
    Solution: {
      name: state.name,
      description: generateDescription(
        state.description,
        state.amount,
        state.token,
        state.supervisor,
        state.seekingFunding
      ),
      solution_version: "V1",
    },
    Attestation: {
      name: state.name,
      description: state.description,
      attestation_version: "V1",
    },
    Sponsorship: {
      name: state.name,
      description: state.description,
      amount: state.amount,
      sponsorship_token: tokenMapping[state.token],
      supervisor: state.supervisor,
      sponsorship_version: "V1",
    },
    Github: {
      name: state.name,
      description: state.description,
      github_version: "V0",
      github_link: state.githubLink,
    },
  }[state.postType];
  body["post_type"] = state.postType;
  if (!context.accountId) {
    return;
  }
  let txn = [];
  if (mode == "Create") {
    props.onDraftStateChange(
      Object.assign({}, state, { parent_post_id: parentId })
    );
    txn.push({
      contractName: "${REPL_DEVHUB_LEGACY}",
      methodName: "add_post",
      args: {
        parent_id: parentId,
        labels,
        body,
      },
      gas: Big(10).pow(14),
    });
  } else if (mode == "Edit") {
    props.onDraftStateChange(
      Object.assign({}, state, { edit_post_id: postId })
    );
    txn.push({
      contractName: "${REPL_DEVHUB_LEGACY}",
      methodName: "edit_post",
      args: {
        id: postId,
        labels,
        body,
      },
      gas: Big(10).pow(14),
    });
  }
  if (mode == "Create" || mode == "Edit") {
    if (grantNotify === false) {
      txn.unshift({
        contractName: "${REPL_SOCIAL_CONTRACT}",
        methodName: "grant_write_permission",
        args: {
          predecessor_id: "${REPL_DEVHUB_LEGACY}",
          keys: [context.accountId + "/index/notify"],
        },
        gas: Big(10).pow(14),
        deposit: getDepositAmountForWriteAccess(userStorageDeposit),
      });
    }
    setCreateTxn(true);
    Near.call(txn);
  }
};

const checkLabel = (label) => {
  Near.asyncView("${REPL_DEVHUB_LEGACY}", "is_allowed_to_use_labels", {
    editor: context.accountId,
    labels: [label],
  }).then((allowed) => {
    if (allowed) {
      State.update({ warning: "" });
    } else {
      State.update({
        warning:
          'The label "' +
          label +
          '" is protected and can only be added by moderators',
      });
      return;
    }
  });
};

const setLabels = (labels) => {
  labels = labels.map((o) => {
    o.name = normalize(o.name);
    return o;
  });
  if (labels.length < state.labels.length) {
    let oldLabels = new Set(state.labels.map((label) => label.name));
    for (let label of labels) {
      oldLabels.delete(label.name);
    }
    let removed = oldLabels.values().next().value;
    Near.asyncView("${REPL_DEVHUB_LEGACY}", "is_allowed_to_use_labels", {
      editor: context.accountId,
      labels: [removed],
    }).then((allowed) => {
      if (allowed) {
        let labelStrings = labels.map(({ name }) => name);
        State.update({ labels, labelStrings });
      } else {
        State.update({
          warning:
            'The label "' +
            removed +
            '" is protected and can only be updated by moderators',
        });
        return;
      }
    });
  } else {
    let labelStrings = labels.map((o) => {
      return o.name;
    });
    State.update({ labels, labelStrings });
  }
};
const existingLabelStrings =
  Near.view("${REPL_DEVHUB_LEGACY}", "get_all_allowed_labels", {
    editor: context.accountId,
  }) ?? [];
const existingLabelSet = new Set(existingLabelStrings);
const existingLabels = existingLabelStrings
  .filter((it) => it !== "blog") // remove blog label so users cannot publish blogs from feed
  .map((s) => {
    return { name: s };
  });

const labelEditor = (
  <div className="col-lg-12  mb-2">
    <label htmlFor="labels" className="fs-6 fw-bold mb-1">
      Labels
    </label>
    <Typeahead
      multiple
      labelKey="name"
      onInputChange={checkLabel}
      onChange={setLabels}
      options={existingLabels}
      placeholder="near.social, widget, NEP, standard, protocol, tool"
      selected={state.labels}
      positionFixed
      allowNew={(results, props) => {
        return (
          !existingLabelSet.has(props.text) &&
          props.text.toLowerCase() !== "blog" && // dont allow adding "Blog"
          props.selected.filter((selected) => selected.name === props.text)
            .length == 0 &&
          Near.view("${REPL_DEVHUB_LEGACY}", "is_allowed_to_use_labels", {
            editor: context.accountId,
            labels: [props.text],
          })
        );
      }}
    />
  </div>
);

const githubLinkDiv = (
  <div className="col-lg-12  mb-2">
    Github Issue URL:
    <input
      type="text"
      value={state.githubLink}
      onChange={(event) => State.update({ githubLink: event.target.value })}
    />
  </div>
);

const nameDiv = (
  <div className="col-lg-12  mb-2">
    <label htmlFor="title" className="fs-6 fw-bold mb-1">
      Title
    </label>
    <input
      name="title"
      id="title"
      data-testid="name-editor"
      type="text"
      value={state.name}
      onChange={(event) => State.update({ name: event.target.value })}
    />
  </div>
);

const amountDiv = (
  <div className="col-lg-6  mb-2">
    Amount:
    <input
      type="text"
      value={state.amount}
      onChange={(event) => State.update({ amount: event.target.value })}
    />
  </div>
);

const tokenDiv = (
  <div className="col-lg-6 mb-2">
    Currency
    <select
      onChange={(event) => State.update({ token: event.target.value })}
      class="form-select"
      aria-label="Select currency"
      value={state.token}
    >
      <option value="USDT">USDT</option>
      <option value="NEAR">NEAR</option>
      <option value="USDC">USDC</option>
    </select>
  </div>
);

const supervisorDiv = (
  <div className="col-lg-6 mb-2">
    Supervisor:
    <input
      type="text"
      value={state.supervisor}
      onChange={(event) => State.update({ supervisor: event.target.value })}
    />
  </div>
);

const callDescriptionDiv = () => {
  return (
    <div className="col-lg-12  mb-2">
      <label htmlFor="description" className="fs-6 fw-bold mb-1">
        Description
      </label>
      <Widget
        src={"${REPL_DEVHUB}/widget/devhub.components.molecule.SimpleMDE"}
        props={{
          data: { handler: state.handler, content: state.description },
          onChange: (content) => {
            State.update({ description: content, handler: "update" });
            textareaInputHandler(content);
          },
        }}
      />
      {autocompleteEnabled && state.showAccountAutocomplete && (
        <AutoComplete>
          <Widget
            src="${REPL_DEVHUB}/widget/devhub.components.molecule.AccountAutocomplete"
            props={{
              term: state.mentionInput,
              onSelect: autoCompleteAccountId,
              onClose: () => State.update({ showAccountAutocomplete: false }),
            }}
          />
        </AutoComplete>
      )}
    </div>
  );
};

const disclaimer = (
  <p>
    <i>
      * Note, all projects that were granted sponsorships are required to pass
      KYC to receive the funding.
    </i>
  </p>
);

const isFundraisingDiv = (
  // This is jank with just btns and not radios. But the radios were glitchy af
  <>
    <div class="mb-2">
      <p class="fs-6 fw-bold mb-1">
        Are you seeking funding for your solution?
        <span class="text-muted fw-normal">(Optional)</span>
      </p>
      <div class="form-check form-check-inline">
        <label class="form-check-label">
          <button
            className="btn btn-light p-0"
            style={{
              backgroundColor: state.seekingFunding ? "#0C7283" : "inherit",
              color: "#f3f3f3",
              border: "solid #D9D9D9",
              borderRadius: "100%",
              height: "20px",
              width: "20px",
            }}
            onClick={() => State.update({ seekingFunding: true })}
          />
          Yes
        </label>
      </div>
      <div class="form-check form-check-inline">
        <label class="form-check-label">
          <button
            className="btn btn-light p-0"
            style={{
              backgroundColor: !state.seekingFunding ? "#0C7283" : "inherit",
              color: "#f3f3f3",
              border: "solid #D9D9D9",
              borderRadius: "100%",
              height: "20px",
              width: "20px",
            }}
            onClick={() => State.update({ seekingFunding: false })}
          />
          No
        </label>
      </div>
    </div>
  </>
);

const fundraisingDiv = (
  <div class="d-flex flex-column mb-2">
    <div className="col-lg-6 mb-2">
      Currency
      <select
        onChange={(event) => State.update({ token: event.target.value })}
        class="form-select"
        aria-label="Default select example"
        value={state.token}
      >
        <option value="USDT">USDT</option>
        <option value="NEAR">NEAR</option>
        <option value="USDC">USDC</option>
      </select>
    </div>
    <div className="col-lg-6 mb-2">
      Requested amount
      <span class="text-muted fw-normal">(Numbers Only)</span>
      <input
        data-testid="requested-amount-editor"
        type="number"
        value={parseInt(state.amount) > 0 ? state.amount : ""}
        min={0}
        onChange={(event) => {
          State.update({
            amount: Number(
              event.target.value.toString().replace(/e/g, "")
            ).toString(),
          });
        }}
      />
    </div>
    <div className="col-lg-6 mb-2">
      <p class="mb-1">
        Requested sponsor
        <span class="text-muted fw-normal">(Optional)</span>
      </p>
      <p style={{ fontSize: "13px" }} class="m-0 text-muted fw-light">
        If you are requesting funding from a specific sponsor, please enter
        their username.
      </p>
      <div class="input-group flex-nowrap">
        <span class="input-group-text" id="addon-wrapping">
          @
        </span>
        <input
          type="text"
          class="form-control"
          placeholder="Enter username"
          value={state.supervisor}
          onChange={(event) => State.update({ supervisor: event.target.value })}
        />
      </div>
    </div>
  </div>
);

function generateDescription(text, amount, token, supervisor, seekingFunding) {
  const fundingText =
    amount > 0 && token ? `###### Requested amount: ${amount} ${token}\n` : "";
  const supervisorText = supervisor
    ? `###### Requested sponsor: @${supervisor}\n`
    : "";
  return seekingFunding ? `${fundingText}${supervisorText}${text}` : text;
}

const [tab, setTab] = useState("editor");

const renamedPostType =
  state.postType == "Submission" ? "Solution" : state.postType;
// Below there is a weird code with fields.includes("githubLink") ternary operator.
// This is to hack around rendering bug of near.social.

return (
  <div className="d-flex flex-column flex-grow-1 w-100">
    <div className="mx-2 mx-md-5 mb-5">
      {showPostPage ? (
        <Widget
          src={"${REPL_DEVHUB}/widget/devhub.entity.post.Post"}
          props={{
            id: postId,
            expandable: true,
            defaultExpanded: false,
            isInList: true,
            isPreview: false,
            onDraftStateChange: props.onDraftStateChange,
            referral: postId,
            transactionHashes: props.transactionHashes,
          }}
        />
      ) : (
        <div className="card">
          <div className="card-header">
            <div>
              <ul class="nav nav-tabs">
                <li class="nav-item">
                  <button
                    class={`nav-link ${tab === "editor" ? "active" : ""}`}
                    onClick={() => setTab("editor")}
                  >
                    Editor
                  </button>
                </li>
                <li class="nav-item">
                  <button
                    class={`nav-link ${tab === "preview" ? "active" : ""}`}
                    onClick={() => setTab("preview")}
                  >
                    Preview
                  </button>
                </li>
              </ul>
            </div>
            {!isCreatePostPage && tab === "editor" && (
              <div className="my-3">
                {mode} {renamedPostType}
              </div>
            )}
            {tab === "preview" && <div className="my-3">Post Preview</div>}
          </div>
          <div class="card-body">
            {tab === "editor" && (
              <>
                {state.warning && (
                  <div
                    class="alert alert-warning alert-dismissible fade show"
                    role="alert"
                  >
                    {state.warning}
                    <button
                      type="button"
                      class="btn-close"
                      data-bs-dismiss="alert"
                      aria-label="Close"
                      onClick={() => State.update({ warning: "" })}
                    ></button>
                  </div>
                )}
                {isCreatePostPage && (
                  <div>
                    <p class="card-title fw-bold fs-6">
                      What do you want to create?
                    </p>
                    <div class="d-flex flex-row gap-2">
                      {Object.values(postTypeOptions).map((option) => (
                        <button
                          className={`btn btn-${
                            state.postType === option.name
                              ? "primary"
                              : "outline-secondary"
                          }`}
                          data-testid={`btn-${option.name.toLowerCase()}`}
                          key={option.name}
                          onClick={() => typeSwitch(option.name)}
                          style={
                            state.postType === option.name
                              ? {
                                  backgroundColor: "#0C7283",
                                  color: "#f3f3f3",
                                }
                              : null
                          }
                          type="button"
                        >
                          <i className={`bi ${option.icon}`} />
                          <span>{option.name}</span>
                        </button>
                      ))}
                    </div>
                    <p class="text-muted w-75 my-1">
                      {postTypeOptions[state.postType].description}
                    </p>
                  </div>
                )}
                {/* This statement around the githubLinkDiv creates a weird render bug
      where the title renders extra on state change. */}
                {state.displayFields.includes("githubLink") ? (
                  <div className="row">
                    {state.displayFields.includes("githubLink") &&
                      githubLinkDiv}
                    {labelEditor}
                    {state.displayFields.includes("name") && nameDiv}
                    {state.displayFields.includes("description") &&
                      callDescriptionDiv()}
                  </div>
                ) : (
                  <div className="row">
                    {labelEditor}
                    {state.displayFields.includes("name") && nameDiv}
                    {state.displayFields.includes("amount") && amountDiv}
                    {state.displayFields.includes("sponsorship_token") &&
                      tokenDiv}
                    {state.displayFields.includes("supervisor") &&
                      supervisorDiv}
                    {state.displayFields.includes("description") &&
                      callDescriptionDiv()}
                    {state.displayFields.includes("fund_raising") &&
                      isFundraisingDiv}
                    {state.seekingFunding &&
                      state.displayFields.includes("fund_raising") &&
                      fundraisingDiv}
                  </div>
                )}

                {disclaimer}
              </>
            )}
            {tab === "preview" && (
              <div className="mb-2">
                <Widget
                  src="${REPL_DEVHUB}/widget/devhub.entity.post.Post"
                  props={{
                    isPreview: true,
                    id: 0, // irrelevant
                    post: {
                      author_id: state.author_id,
                      likes: [],
                      snapshot: {
                        editor_id: state.editor_id,
                        labels: state.labelStrings,
                        post_type: postType,
                        name: state.name,
                        description:
                          state.postType == "Solution"
                            ? generateDescription(
                                state.description,
                                state.amount,
                                state.token,
                                state.supervisor,
                                state.seekingFunding
                              )
                            : state.description,
                        amount: state.amount,
                        sponsorship_token: state.token,
                        supervisor: state.supervisor,
                        github_link: state.githubLink,
                      },
                    },
                  }}
                />
              </div>
            )}

            <>
              <button
                data-testid="submit-create-post"
                style={{
                  width: "7rem",
                  backgroundColor: "#0C7283",
                  color: "#f3f3f3",
                }}
                disabled={
                  (state.seekingFunding &&
                    (!state.amount || state.amount < 1)) ||
                  (isCreatePostPage &&
                    (state.name === "" || state.description === ""))
                }
                className="btn btn-light mb-2 p-3"
                onClick={onSubmit}
                disabled={isSubmittingTransaction}
              >
                {isSubmittingTransaction ? LoadingButtonSpinner : <></>}
                Submit
              </button>
              {!isCreatePostPage && (
                <button
                  style={{
                    width: "7rem",
                    backgroundColor: "#fff",
                    color: "#000",
                  }}
                  className="btn btn-light mb-2 p-3"
                  onClick={() => props.setEditorState(false)}
                >
                  Cancel
                </button>
              )}
            </>
          </div>
        </div>
      )}
    </div>
  </div>
);
