const FormContainer = styled.div`
  & > *:not(:last-child) {
    margin-bottom: 1rem;
  }
`;

const {
  title,
  setTitle,
  subtitle,
  setSubtitle,
  options,
  category,
  setCategory,
  description,
  setDescription,
  debouncedUpdateState,
  author,
  setAuthor,
  date,
  setDate,
  content,
  setContent,
  addonParameters,
} = props;

const InputContainer = ({ heading, description, children }) => {
  return (
    <div className="d-flex flex-column gap-1 gap-sm-2 w-100">
      <b className="h6 mb-0">{heading}</b>
      {description && (
        <div className="text-muted w-100 text-sm">{description}</div>
      )}
      {children}
    </div>
  );
};

const TitleComponent = useMemo(() => {
  return (
    <Widget
      src="${REPL_DEVHUB}/widget/devhub.components.molecule.Input"
      props={{
        className: "flex-grow-1",
        value: title,
        placeholder: "Title",
        onChange: (e) => setTitle(e.target.value),
        skipPaddingGap: true,
        inputProps: {
          max: 80,
          required: true,
          name: "title",
          className:
            "block w-full rounded-md border-0 px-1 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
        },
      }}
    />
  );
}, []);

const SubtitleComponent = useMemo(() => {
  return (
    <Widget
      src="${REPL_DEVHUB}/widget/devhub.components.molecule.Input"
      props={{
        className: "flex-grow-1",
        value: subtitle,
        placeholder: "Subtitle",
        onChange: (e) => setSubtitle(e.target.value),
        skipPaddingGap: true,
        inputProps: {
          required: true,
          max: 80,
          name: "subtitle",
          className:
            "block w-full rounded-md border-0 px-1 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
        },
      }}
    />
  );
}, []);

const CategorySelect = useMemo(() => {
  return (
    <Widget
      src={
        "${REPL_DEVHUB}/widget/devhub.entity.addon.blogv2.editor.CategoryDropdown"
      }
      props={{
        options,
        selectedValue: category,
        onChange: setCategory,
      }}
    />
  );
}, []);

const DescriptionInput = useMemo(() => {
  return (
    <Widget
      src="${REPL_DEVHUB}/widget/devhub.components.molecule.Input"
      props={{
        className: "flex-grow-1",
        onChange: (e) => setDescription(e.target.value),
        value: description,
        multiline: true,
        placeholder: "Description",
        inputProps: {
          max: 500,
          name: "description",
          className:
            "block w-full rounded-md border-0 px-1 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
        },
        skipPaddingGap: true,
        key: "description-input-field",
      }}
    />
  );
}, []);

const AuthorInput = useMemo(() => {
  return (
    <Widget
      src="${REPL_DEVHUB}/widget/devhub.components.molecule.Input"
      props={{
        className: "flex-grow-1",
        onChange: (e) => setAuthor(e.target.value),
        value: author,
        placeholder: "Author",
        inputProps: {
          name: "author",
          className:
            "block w-full rounded-md border-0 px-1 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
        },
        skipPaddingGap: true,
        key: "author-input-field",
      }}
    />
  );
}, []);

const DateInput = () => {
  return (
    <input
      name="date"
      type="date"
      value={date}
      className="block w-full rounded-md border-0 px-1 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      onChange={(e) => setDate(e.target.value)}
    />
  );
};

const ContentEditor = useMemo(() => {
  return (
    <Widget
      src="${REPL_DEVHUB}/widget/devhub.components.molecule.SimpleMDE"
      props={{ data: { content }, onChange: setContent, autoFocus: false }}
    />
  );
}, []);

return (
  <FormContainer id="blog-editor-form">
    <InputContainer
      heading="Title"
      description="Highlight the essence of your blog in a few words. This will appear on your blog card and on the top of your blog."
    >
      {TitleComponent}
    </InputContainer>
    <InputContainer
      heading="Subtitle"
      description="Provide a brief subtitle for the blog"
    >
      {SubtitleComponent}
    </InputContainer>
    {addonParameters.categoriesEnabled === "enabled" ? (
      <InputContainer
        heading="Category"
        description={
          <>
            Choose the category that fits your blog best. Set up your categories
            in the blog settings.
          </>
        }
      >
        {CategorySelect}
      </InputContainer>
    ) : (
      <></>
    )}

    <InputContainer
      heading="Description"
      description="Provide a brief description for the blog. This will appear on the blog card."
    >
      {DescriptionInput}
    </InputContainer>
    {addonParameters.authorEnabled === "disabled" ? (
      <></>
    ) : (
      <InputContainer heading="Author" description="Who wrote this blog?">
        {AuthorInput}
      </InputContainer>
    )}
    <InputContainer
      heading="Visible Publish Date"
      description="What date do you want to have the blog published under?"
    >
      <DateInput />
    </InputContainer>

    <InputContainer
      heading="Content"
      description="Write your blog here. Use Markdown to format your content."
    >
      {ContentEditor}
    </InputContainer>
  </FormContainer>
);
