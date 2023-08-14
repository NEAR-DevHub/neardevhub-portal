/* INCLUDE: "common.jsx" */
const nearDevGovGigsContractAccountId =
  props.nearDevGovGigsContractAccountId ||
  (context.widgetSrc ?? "devgovgigs.near").split("/", 1)[0];

const nearDevGovGigsWidgetsAccountId =
  props.nearDevGovGigsWidgetsAccountId ||
  (context.widgetSrc ?? "devgovgigs.near").split("/", 1)[0];

function widget(widgetName, widgetProps, key) {
  widgetProps = {
    ...widgetProps,
    nearDevGovGigsContractAccountId: props.nearDevGovGigsContractAccountId,
    nearDevGovGigsWidgetsAccountId: props.nearDevGovGigsWidgetsAccountId,
    referral: props.referral,
  };

  return (
    <Widget
      src={`${nearDevGovGigsWidgetsAccountId}/widget/gigs-board.${widgetName}`}
      props={widgetProps}
      key={key}
    />
  );
}

function href(widgetName, linkProps) {
  linkProps = { ...linkProps };

  if (props.nearDevGovGigsContractAccountId) {
    linkProps.nearDevGovGigsContractAccountId =
      props.nearDevGovGigsContractAccountId;
  }

  if (props.nearDevGovGigsWidgetsAccountId) {
    linkProps.nearDevGovGigsWidgetsAccountId =
      props.nearDevGovGigsWidgetsAccountId;
  }

  if (props.referral) {
    linkProps.referral = props.referral;
  }

  const linkPropsQuery = Object.entries(linkProps)
    .filter(([_key, nullable]) => (nullable ?? null) !== null)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return `/#/${nearDevGovGigsWidgetsAccountId}/widget/gigs-board.pages.${widgetName}${
    linkPropsQuery ? "?" : ""
  }${linkPropsQuery}`;
}
/* END_INCLUDE: "common.jsx" */
/* INCLUDE: "core/adapter/dev-hub" */
const devHubAccountId =
  props.nearDevGovGigsContractAccountId ||
  (context.widgetSrc ?? "devgovgigs.near").split("/", 1)[0];

const DevHub = {
  get_root_members: () =>
    Near.view(devHubAccountId, "get_root_members") ?? null,

  has_moderator: ({ account_id }) =>
    Near.view(devHubAccountId, "has_moderator", { account_id }) ?? null,

  create_community: ({ inputs }) =>
    Near.call(devHubAccountId, "create_community", { inputs }),

  get_community: ({ handle }) =>
    Near.view(devHubAccountId, "get_community", { handle }) ?? null,

  update_community: ({ handle, community }) =>
    Near.call(devHubAccountId, "update_community", { handle, community }),

  delete_community: ({ handle }) =>
    Near.call(devHubAccountId, "delete_community", { handle }),

  update_community_github: ({ handle, github }) =>
    Near.call(devHubAccountId, "update_community_github", { handle, github }),

  update_community_board: ({ handle, board }) =>
    Near.call(devHubAccountId, "update_community_board", { handle, board }),

  get_access_control_info: () =>
    Near.view(devHubAccountId, "get_access_control_info") ?? null,

  get_all_authors: () => Near.view(devHubAccountId, "get_all_authors") ?? null,

  get_all_communities_metadata: () =>
    Near.view(devHubAccountId, "get_all_communities_metadata") ?? null,

  get_all_labels: () => Near.view(devHubAccountId, "get_all_labels") ?? null,

  get_post: ({ post_id }) =>
    Near.view(devHubAccountId, "get_post", { post_id }) ?? null,

  get_posts_by_author: ({ author }) =>
    Near.view(devHubAccountId, "get_posts_by_author", { author }) ?? null,

  get_posts_by_label: ({ label }) =>
    Near.view(nearDevGovGigsContractAccountId, "get_posts_by_label", {
      label,
    }) ?? null,

  useQuery: (name, params) => {
    const initialState = { data: null, error: null, isLoading: true };

    const cacheState = useCache(
      () =>
        Near.asyncView(devHubAccountId, ["get", name].join("_"), params ?? {})
          .then((response) => ({
            ...initialState,
            data: response ?? null,
            isLoading: false,
          }))
          .catch((error) => ({
            ...initialState,
            error: props?.error ?? error,
            isLoading: false,
          })),

      JSON.stringify({ name, params }),
      { subscribe: true }
    );

    return cacheState === null ? initialState : cacheState;
  },
};
/* END_INCLUDE: "core/adapter/dev-hub" */

const CommunitiesPage = () => {
  State.init({ isSpawnerHidden: true });

  const spawnerToggle = (forcedState) =>
    State.update((lastKnownState) => ({
      ...lastKnownState,
      isSpawnerHidden: !(forcedState ?? lastKnownState.isSpawnerHidden),
    }));

  const communitiesMetadata = DevHub.useQuery("all_communities_metadata");

  return widget("components.template.app-layout", {
    banner: (
      <div
        className="d-flex justify-content-between p-4"
        style={{ backgroundColor: "#181818" }}
      >
        <div className="d-flex flex-column gap-3">
          <h1 className="m-0 fs-4">
            <a className="text-white" href={href("communities")}>
              Communities
            </a>
          </h1>

          <p className="m-0 text-muted fs-6">
            Discover developer communities on BOS
          </p>
        </div>

        <div className="d-flex flex-column justify-content-center">
          {widget("components.molecule.button", {
            label: "Create community",
            onClick: spawnerToggle,
          })}
        </div>
      </div>
    ),

    children: (
      <div className="d-flex flex-wrap gap-4 p-4 w-100 h-100">
        {widget("components.atom.spinner", {
          isHidden: !communitiesMetadata.isLoading,
        })}

        {widget("entity.community.spawner", {
          isHidden: state.isSpawnerHidden,
          onCancel: () => spawnerToggle(false),
        })}

        {(communitiesMetadata.data ?? []).map((communityMetadata) =>
          widget(
            "entity.community.card",
            communityMetadata,
            communityMetadata.handle
          )
        )}
      </div>
    ),
  });
};

console.log("all good");

return CommunitiesPage(props);
