const { tab, accountType, ...passProps } = props;

const tabKeys = {
  TRUSTEES: "trustees",
  MODERATORS: "moderators",
};
const treasuryDaoID = "${REPL_TREASURY_CONTRACT}";
const councilInfo = Near.view(treasuryDaoID, "get_policy");
const [selectedTab, setSelectedTab] = useState(accountType ?? tabKeys.TRUSTEES);

if (councilInfo === null) {
  return <></>;
}

const checkIfAcIsTrustee = () => {
  const istrustee = false;
  if (!context.accountId) {
    return isTrustee;
  }
  councilInfo.roles.map((item) => {
    // trustees or moderators
    if (item.name === selectedTab) {
      istrustee = item.kind.Group.includes(context.accountId);
    }
  });
  return istrustee;
};

const [isTrustee, setIsTrustee] = useState(checkIfAcIsTrustee());
const Container = styled.div`
  width: 100%;
  padding-block: 1rem;
  padding-inline: 3rem;

  .bold {
    font-weight: 600;
  }
`;

const Tabs = styled.div`
  border-top: 0.5px solid #b3b3b3;
  .bg-grey {
    background-color: #ececec;
  }
  .cursor {
    cursor: pointer;
  }

  .flex-item {
    flex: 1;
    padding-block: 1rem;
    padding-inline: 0.5rem;
    font-weight: 600;
    font-size: 18;
  }
`;

return (
  <Container className="pl-5">
    <div className="h2 bold">DevDAO Dashboard</div>
    <div className="mt-3">
      {!isTrustee ? (
        <Widget
          src={"${REPL_DEVHUB}/widget/devhub.entity.trustee.login"}
          props={{ ...passProps, setIsTrustee }}
        />
      ) : (
        <div className="mt-2">
          <Tabs>
            <div className="d-flex w-100 cursor">
              <div
                className={
                  "flex-item " +
                  (selectedTab === tabKeys.TRUSTEES ? "" : "bg-grey")
                }
                onClick={() => setSelectedTab(tabKeys.TRUSTEES)}
              >
                Trustees
              </div>
              <div
                className={
                  "flex-item " +
                  (selectedTab === tabKeys.MODERATORS ? "" : "bg-grey")
                }
                onClick={() => setSelectedTab(tabKeys.MODERATORS)}
              >
                Moderators
              </div>
            </div>
            {selectedTab === tabKeys.TRUSTEES ? (
              <Widget
                src={"${REPL_DEVHUB}/widget/devhub.entity.trustee.dashboard"}
                props={{ ...passProps, setIsTrustee, tab }}
              />
            ) : (
              <div>Moderators Dashboard</div>
            )}
          </Tabs>
        </div>
      )}
    </div>
  </Container>
);
