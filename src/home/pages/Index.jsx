const AppContainer = styled.div`
  width: 100%;
`;

const App = () => {
  return (
    <AppContainer>
      <Widget src="devhub.testnet/widget/home.components.Navbar" />
      <Widget src="devhub.testnet/widget/home.components.Hero" />
      <Widget src="devhub.testnet/widget/home.components.Explore" />
      <Widget src="devhub.testnet/widget/home.components.Connect" />
    </AppContainer>
  );
};

return <App />;
