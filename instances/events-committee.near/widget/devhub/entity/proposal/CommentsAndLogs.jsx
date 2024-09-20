const { getLinkUsingCurrentGateway } = VM.require(
  "${REPL_DEVHUB}/widget/core.lib.url"
) || { getLinkUsingCurrentGateway: () => {} };
const snapshotHistory = props.snapshotHistory;
const proposalId = props.id;

const Wrapper = styled.div`
  position: relative;
  .log-line {
    position: absolute;
    left: 7%;
    top: -30px;
    bottom: 0;
    z-index: 1;
    width: 1px;
    background-color: var(--bs-border-color);
    z-index: 1;
  }

  .text-wrap {
    overflow: hidden;
    white-space: normal;
  }

  .fw-bold {
    font-weight: 600 !important;
  }

  .inline-flex {
    display: -webkit-inline-box !important;
    align-items: center !important;
    gap: 0.25rem !important;
    margin-right: 2px;
    flex-wrap: wrap;
  }
`;

const CommentContainer = styled.div`
  border: 1px solid lightgrey;
  overflow: auto;
`;

const Header = styled.div`
  position: relative;
  background-color: #f4f4f4;
  height: 50px;

  .menu {
    position: absolute;
    right: 10px;
    top: 4px;
    font-size: 30px;
  }
`;

// check snapshot history all keys and values for differences
function getDifferentKeysWithValues(obj1, obj2) {
  return Object.keys(obj1)
    .filter((key) => {
      if (key !== "editor_id" && obj2.hasOwnProperty(key)) {
        const value1 = obj1[key];
        const value2 = obj2[key];

        if (typeof value1 === "object" && typeof value2 === "object") {
          return JSON.stringify(value1) !== JSON.stringify(value2);
        } else if (Array.isArray(value1) && Array.isArray(value2)) {
          return JSON.stringify(value1) !== JSON.stringify(value2);
        } else {
          return value1 !== value2;
        }
      }
      return false;
    })
    .map((key) => ({
      key,
      originalValue: obj1[key],
      modifiedValue: obj2[key],
    }));
}

State.init({
  data: null,
  socialComments: null,
  changedKeysListWithValues: null,
  snapshotHistoryLength: 0,
});

function sortTimelineAndComments() {
  const comments = Social.index("comment", props.item, { subscribe: true });

  if (snapshotHistory.length > state.snapshotHistoryLength) {
    const changedKeysListWithValues = snapshotHistory
      .slice(1)
      .map((item, index) => {
        const startingPoint = snapshotHistory[index]; // Set comparison to the previous item
        // we don't show timeline_version in logs
        delete startingPoint.timeline.timeline_version;
        delete item.timeline.timeline_version;
        if (
          startingPoint.timeline.kyc_verified === undefined &&
          item.timeline.kyc_verified === false
        ) {
          startingPoint.timeline.kyc_verified = false;
        }

        return {
          editorId: item.editor_id,
          ...getDifferentKeysWithValues(startingPoint, item),
        };
      });

    // add log for accepting terms and condition
    changedKeysListWithValues.unshift({
      0: {
        key: "timestamp",
        originalValue: "0",
        modifiedValue: snapshotHistory[0].timestamp,
      },
      1: {
        key: "terms_and_condition",
        originalValue: "",
        modifiedValue: "accepted",
      },
      editorId: snapshotHistory[0].editor_id,
    });

    State.update({
      changedKeysListWithValues,
      snapshotHistoryLength: snapshotHistory.length,
    });
  }

  // sort comments and timeline logs by time
  const snapShotTimeStamp = Array.isArray(snapshotHistory)
    ? snapshotHistory.map((i) => {
        return { blockHeight: null, timestamp: parseFloat(i.timestamp / 1e6) };
      })
    : [];

  const commentsTimeStampPromise = Array.isArray(comments)
    ? Promise.all(
        comments.map((item) => {
          return asyncFetch(
            `https://api.near.social/time?blockHeight=${item.blockHeight}`
          ).then((res) => {
            const timeMs = parseFloat(res.body);
            return {
              blockHeight: item.blockHeight,
              timestamp: timeMs,
            };
          });
        })
      ).then((res) => res)
    : Promise.resolve([]);

  commentsTimeStampPromise.then((commentsTimeStamp) => {
    const combinedArray = [...snapShotTimeStamp, ...commentsTimeStamp];
    combinedArray.sort((a, b) => a.timestamp - b.timestamp);
    State.update({ data: combinedArray, socialComments: comments });
  });
}

sortTimelineAndComments();
const Comment = ({ commentItem }) => {
  const { accountId, blockHeight } = commentItem;
  const item = {
    type: "social",
    path: `${accountId}/post/comment`,
    blockHeight,
  };
  const content = JSON.parse(Social.get(item.path, blockHeight) ?? "null");
  const link = `https://${REPL_EVENTS}.page/proposal/${proposalId}?accountId=${accountId}&blockHeight=${blockHeight}`;
  const hightlightComment =
    parseInt(props.blockHeight ?? "") === blockHeight &&
    props.accountId === accountId;

  return (
    <div style={{ zIndex: 99, background: "white" }}>
      <div className="d-flex gap-2 flex-1">
        <div className="d-none d-sm-flex">
          <Widget
            src={"${REPL_EVENTS}/widget/devhub.entity.proposal.Profile"}
            props={{
              accountId: accountId,
            }}
          />
        </div>
        <CommentContainer
          id={`${accountId.replace(/[^a-z0-9]/g, "")}${blockHeight}`}
          style={{ border: hightlightComment ? "2px solid black" : "" }}
          className="rounded-2 flex-1"
        >
          <Header className="d-flex gap-3 align-items-center p-2 px-3">
            <div className="text-muted">
              <Link href={`/near/widget/ProfilePage?accountId=${accountId}`}>
                <span className="fw-bold text-black">{accountId}</span>
              </Link>
              commented ･{" "}
              <Widget
                src="${REPL_NEAR}/widget/TimeAgo"
                props={{
                  blockHeight: blockHeight,
                }}
              />
            </div>
            {context.accountId && (
              <div className="menu">
                <Widget
                  src="${REPL_NEAR}/widget/Posts.Menu"
                  props={{
                    accountId: accountId,
                    blockHeight: blockHeight,
                    contentPath: `/post/comment`,
                    contentType: "comment",
                  }}
                />
              </div>
            )}
          </Header>
          <div className="p-2 px-3">
            <Widget
              src={
                "${REPL_DEVHUB}/widget/devhub.components.molecule.MarkdownViewer"
              }
              props={{
                text: content.text,
              }}
            />

            <div className="d-flex gap-2 align-items-center mt-4">
              <Widget
                src="${REPL_EVENTS}/widget/devhub.entity.proposal.LikeButton"
                props={{
                  item: item,
                  notifyAccountId: accountId,
                }}
              />
              <Widget
                src="${REPL_NEAR}/widget/CopyUrlButton"
                props={{
                  url: link,
                }}
              />
            </div>
          </div>
        </CommentContainer>
      </div>
    </div>
  );
};

function capitalizeFirstLetter(string) {
  const updated = string.replace("_", " ");
  return updated.charAt(0).toUpperCase() + updated.slice(1).toLowerCase();
}

function parseTimelineKeyAndValue(timeline, originalValue, modifiedValue) {
  const oldValue = originalValue[timeline];
  const newValue = modifiedValue[timeline];
  switch (timeline) {
    case "status":
      return (
        oldValue !== newValue && (
          <span className="inline-flex">
            moved proposal from{" "}
            <Widget
              src={"${REPL_DEVHUB}/widget/devhub.entity.proposal.StatusTag"}
              props={{
                timelineStatus: oldValue,
              }}
            />
            to{" "}
            <Widget
              src={"${REPL_DEVHUB}/widget/devhub.entity.proposal.StatusTag"}
              props={{
                timelineStatus: newValue,
              }}
            />
            stage
          </span>
        )
      );
    case "sponsor_requested_review": {
      if (!oldValue && newValue) {
        return <span>completed review</span>;
      } else if (oldValue && !newValue) return <span>unmarked review</span>;
      return null;
    }
    case "reviewer_completed_attestation":
      return !oldValue && newValue && <span>completed attestation</span>;
    case "kyc_verified":
      return !oldValue && newValue && <span>verified KYC/KYB</span>;
    case "test_transaction_sent":
      return (
        !oldValue &&
        newValue && (
          <span>
            confirmed sponsorship and shared funding steps with recipient
          </span>
        )
      );
    case "payouts":
      return <span>updated the funding payment links.</span>;
    // we don't have this step for now
    // case "request_for_trustees_created":
    //   return !oldValue && newValue && <span>successfully created request for trustees</span>;
    default:
      return null;
  }
}

const AccountProfile = ({ accountId }) => {
  return (
    <span className="inline-flex fw-bold text-black">
      <Widget
        src={"${REPL_EVENTS}/widget/devhub.entity.proposal.Profile"}
        props={{
          accountId: accountId,
          size: "sm",
          showAccountId: true,
        }}
      />
    </span>
  );
};

const parseProposalKeyAndValue = (key, modifiedValue, originalValue) => {
  switch (key) {
    case "terms_and_condition": {
      return (
        <span>
          accepted
          <Widget
            src={"${REPL_DEVHUB}/widget/devhub.entity.proposal.AcceptedTerms"}
            props={{ proposalId: proposalId }}
          />
        </span>
      );
    }
    case "name":
      return <span>changed title</span>;
    case "summary":
    case "description":
      return <span>changed {key}</span>;
    case "category":
      return (
        <span>
          changed category from {originalValue} to {modifiedValue}
        </span>
      );
    case "linked_proposals":
      return <span>updated linked proposals</span>;
    case "requested_sponsorship_usd_amount":
      return (
        <span>
          changed sponsorship amount from {originalValue} to {modifiedValue}
        </span>
      );
    case "requested_sponsorship_paid_in_currency":
      return (
        <span>
          changed sponsorship currency from {originalValue} to {modifiedValue}
        </span>
      );
    case "receiver_account":
      return (
        <span className="inline-flex">
          changed receiver account from{" "}
          <AccountProfile accountId={originalValue} />
          to <AccountProfile accountId={modifiedValue} />
        </span>
      );
    case "supervisor":
      return !originalValue && modifiedValue ? (
        <span className="inline-flex">
          added
          <AccountProfile accountId={modifiedValue} />
          as supervisor
        </span>
      ) : (
        <span className="inline-flex">
          changed receiver account from{" "}
          <AccountProfile accountId={originalValue} />
          to <AccountProfile accountId={modifiedValue} />
        </span>
      );
    case "requested_sponsor":
      return (
        <span className="inline-flex">
          changed sponsor from <AccountProfile accountId={originalValue} />
          to <AccountProfile accountId={modifiedValue} />
        </span>
      );
    case "timeline": {
      const modifiedKeys = Object.keys(modifiedValue);
      const originalKeys = Object.keys(originalValue);
      return modifiedKeys.map((i, index) => {
        const text = parseTimelineKeyAndValue(i, originalValue, modifiedValue);
        return (
          text && (
            <span key={index} className="inline-flex">
              {text}
              {text && "･"}
            </span>
          )
        );
      });
    }
    default:
      return null;
  }
};

const LogIconContainer = styled.div`
  margin-left: 50px;
  z-index: 99;

  @media screen and (max-width: 768px) {
    margin-left: 10px;
  }
`;

const Log = ({ timestamp }) => {
  const updatedData = useMemo(
    () =>
      state.changedKeysListWithValues.find((obj) =>
        Object.values(obj).some(
          (value) =>
            value && parseFloat(value.modifiedValue / 1e6) === timestamp
        )
      ),
    [state.changedKeysListWithValues, timestamp]
  );

  const editorId = updatedData.editorId;
  const valuesArray = Object.values(updatedData ?? {});
  // if valuesArray length is 2 that means it only has timestamp and editorId
  if (!updatedData || valuesArray.length === 2) {
    return <></>;
  }

  return valuesArray.map((i, index) => {
    if (i.key && i.key !== "timestamp" && i.key !== "proposal_body_version") {
      return (
        <LogIconContainer
          className="d-flex gap-3 align-items-center"
          key={index}
        >
          <img
            src="https://ipfs.near.social/ipfs/bafkreiffqrxdi4xqu7erf46gdlwuodt6dm6rji2jtixs3iionjvga6rhdi"
            height={30}
          />
          <div
            className={
              "flex-1 gap-1 w-100 text-wrap text-muted align-items-center " +
              (i.key === "timeline" &&
              Object.keys(i.originalValue ?? {}).length > 1
                ? ""
                : "inline-flex")
            }
          >
            <span
              className="inline-flex fw-bold text-black"
              style={{ marginRight: 0 }}
            >
              <AccountProfile accountId={editorId} showAccountId={true} />
            </span>
            {parseProposalKeyAndValue(i.key, i.modifiedValue, i.originalValue)}
            {i.key !== "timeline" && "･"}
            <Widget
              src="${REPL_NEAR}/widget/TimeAgo"
              props={{
                blockTimestamp: timestamp * 1000000,
              }}
            />
          </div>
        </LogIconContainer>
      );
    }
  });
};

if (Array.isArray(state.data)) {
  return (
    <Wrapper>
      <div
        className="log-line"
        style={{ height: state.data.length > 2 ? "110%" : "150%" }}
      ></div>
      <div className="d-flex flex-column gap-4">
        {state.data.map((i, index) => {
          if (i.blockHeight) {
            const item = state.socialComments.find(
              (t) => t.blockHeight === i.blockHeight
            );
            return <Comment commentItem={item} />;
          } else {
            return <Log timestamp={i.timestamp} key={index} />;
          }
        })}
      </div>
    </Wrapper>
  );
}
