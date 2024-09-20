const { data, onSubmit } = props;

const initialData = data;
const [content, setContent] = useState(data.content || "");
const [title, setTitle] = useState(data.title || "");
const [subtitle, setSubtitle] = useState(data.subtitle || "");

const [textAlign, setTextAlign] = useState(data.textAlign || "left");

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  text-align: left;
`;

const FormContainer = styled.div`
  padding-top: 1rem;

  & > *:not(:last-child) {
    margin-bottom: 1rem;
  }
`;

const hasDataChanged = () => {
  return (
    content !== initialData.content ||
    title !== initialData.title ||
    subtitle !== initialData.subtitle ||
    textAlign !== initialData.textAlign
  );
};

const handleSubmit = () => {
  if (title) onSubmit({ title, subtitle, content, textAlign });
};

return (
  <Container>
    <ul className="nav nav-tabs" id="editPreviewTabs" role="tablist">
      <li className="nav-item" role="presentation">
        <button
          className="nav-link active"
          id="edit-tab"
          data-bs-toggle="tab"
          data-bs-target="#edit"
          type="button"
          role="tab"
          aria-controls="edit"
          aria-selected="true"
        >
          Edit
        </button>
      </li>
      <li className="nav-item" role="presentation">
        <button
          className="nav-link"
          id="preview-tab"
          data-bs-toggle="tab"
          data-bs-target="#preview"
          type="button"
          role="tab"
          aria-controls="preview"
          aria-selected="false"
        >
          Preview
        </button>
      </li>
    </ul>
    <div className="tab-content" id="editPreviewTabsContent">
      <div
        className="tab-pane show active p-4"
        id="edit"
        role="tabpanel"
        aria-labelledby="edit-tab"
        style={{ position: "relative" }}
      >
        <div style={{ position: "absolute", top: 10, right: 0 }}>
          <Widget
            src="${REPL_DEVHUB}/widget/devhub.components.molecule.Switch"
            props={{
              currentValue: textAlign,
              key: "textAlign",
              onChange: (e) => setTextAlign(e.target.value),
              options: [
                { label: "Left", value: "left" },
                { label: "Center", value: "center" },
                { label: "Right", value: "right" },
              ],
            }}
          />
        </div>
        <FormContainer>
          <div className="flex-grow-1">
            <Widget
              src="${REPL_DEVHUB}/widget/devhub.components.molecule.Input"
              props={{
                label: "Title",
                className: "flex-grow-1",
                onChange: (e) => setTitle(e.target.value),
                value: title,
                inputProps: {
                  min: 2,
                  max: 60,
                  required: true,
                },
              }}
            />
          </div>
          <div className="flex-grow-1">
            <Widget
              src="${REPL_DEVHUB}/widget/devhub.components.molecule.Input"
              props={{
                label: "Subtitle",
                className: "flex-grow-1",
                onChange: (e) => setSubtitle(e.target.value),
                value: subtitle,
                inputProps: {
                  min: 2,
                  max: 250,
                },
              }}
            />
          </div>
          <Widget
            src="${REPL_DEVHUB}/widget/devhub.components.molecule.SimpleMDE"
            props={{ data: { content }, onChange: setContent }}
          />
        </FormContainer>
        <div
          className={"d-flex align-items-center justify-content-end gap-3 mt-4"}
        >
          <Widget
            src={"${REPL_DEVHUB}/widget/devhub.components.molecule.Button"}
            props={{
              classNames: { root: "btn-success" },
              disabled: !hasDataChanged() || !title || !content,
              icon: {
                type: "bootstrap_icon",
                variant: "bi-check-circle-fill",
              },
              label: "Publish",
              onClick: handleSubmit,
            }}
          />
        </div>
      </div>
      <div
        className="tab-pane"
        id="preview"
        role="tabpanel"
        aria-labelledby="preview-tab"
      >
        <div className="w-100 h-100 p-4">
          <Widget
            src="${REPL_DEVHUB}/widget/devhub.entity.addon.wiki.Viewer"
            props={{ title, subtitle, content, textAlign }}
          />
        </div>
      </div>
    </div>
  </Container>
);
