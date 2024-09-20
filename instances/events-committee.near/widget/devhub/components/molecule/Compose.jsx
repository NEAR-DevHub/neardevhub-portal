const EmbeddCSS = `
  .CodeMirror {
   margin-inline:10px;
   border-radius:5px;
  }

  .editor-toolbar {
    border: none !important;
  }
`;

const Wrapper = styled.div`
  .nav-link {
    color: inherit !important;
  }

  .card-header {
    padding-bottom: 0px !important;
  }
`;

const Compose = ({
  data,
  onChange,
  autocompleteEnabled,
  placeholder,
  height,
  embeddCSS,
  showProposalIdAutoComplete,
  onChangeKeyup,
  handler,
  sortedRelevantUsers,
}) => {
  State.init({
    data: data,
    selectedTab: "editor",
    autoFocus: false,
  });

  useEffect(() => {
    if (typeof onChange === "function") {
      onChange(state.data);
    }
  }, [state.data]);

  useEffect(() => {
    // for clearing editor after txn approval/ showing draft state
    if (data !== state.data || handler !== state.handler) {
      State.update({ data: data, handler: handler });
    }
  }, [data, handler]);

  return (
    <Wrapper>
      <div className="card">
        <div className="card-header" style={{ position: "relative" }}>
          <div>
            <ul class="nav nav-tabs">
              <li class="nav-item">
                <button
                  class={`nav-link ${
                    state.selectedTab === "editor" ? "active" : ""
                  }`}
                  onClick={() =>
                    State.update({ selectedTab: "editor", autoFocus: true })
                  }
                >
                  Write
                </button>
              </li>
              <li class="nav-item">
                <button
                  class={`nav-link ${
                    state.selectedTab === "preview" ? "active" : ""
                  }`}
                  onClick={() => State.update({ selectedTab: "preview" })}
                >
                  Preview
                </button>
              </li>
            </ul>
          </div>
        </div>

        {state.selectedTab === "editor" ? (
          <>
            <Widget
              src={"${REPL_EVENTS}/widget/devhub.components.molecule.SimpleMDE"}
              props={{
                data: { handler: state.handler, content: state.data },
                onChange: (content) => {
                  State.update({ data: content, handler: "update" });
                },
                placeholder: placeholder,
                height,
                embeddCSS: embeddCSS || EmbeddCSS,
                showAutoComplete: autocompleteEnabled,
                showProposalIdAutoComplete: showProposalIdAutoComplete,
                autoFocus: state.autoFocus,
                onChangeKeyup: onChangeKeyup,
                sortedRelevantUsers,
              }}
            />
          </>
        ) : (
          <div className="card-body">
            <Widget
              src={
                "${REPL_DEVHUB}/widget/devhub.components.molecule.MarkdownViewer"
              }
              props={{
                text: state.data,
              }}
            />
          </div>
        )}
      </div>
    </Wrapper>
  );
};

return Compose(props);
