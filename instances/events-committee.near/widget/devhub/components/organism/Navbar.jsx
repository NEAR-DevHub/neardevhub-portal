const page = props.page;

const [showMenu, setShowMenu] = useState(false);

const { href: linkHref } = VM.require("${REPL_DEVHUB}/widget/core.lib.url");

const { hasModerator } = VM.require(
  "${REPL_EVENTS}/widget/core.adapter.devhub-contract"
);

linkHref || (linkHref = () => {});

const Logo = () => {
  const Wrapper = styled.div`
    @media screen and (max-width: 768px) {
      svg {
        width: 90px;
        height: 12px;
        transform: scale(1.5);
        margin-left: 1rem;
      }
    }
  `;

  return (
    <Wrapper>
      <Link
        to={linkHref({
          widgetSrc: "${REPL_EVENTS}/widget/app",
          params: { page: "home" },
        })}
      >
        <svg
          width="166"
          height="38"
          viewBox="0 0 166 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M43.0742 10.4333C43.0742 5.60676 45.9278 3.20004 50.2146 3.20004C54.4485 3.20004 56.9968 5.67287 56.9968 9.93077V11.5044H46.8038C46.8569 13.3821 48.0779 14.8102 50.1881 14.8102C52.2719 14.8102 53.1213 13.7656 53.3336 12.9193H56.7313V13.316C56.2933 15.2202 54.5679 17.6797 50.2545 17.6797C45.941 17.6797 43.0742 15.2599 43.0742 10.4333ZM46.8436 8.85968H53.3469C53.3204 7.29938 52.2984 6.02986 50.1616 6.02986C48.0912 6.02986 47.0028 7.33905 46.8436 8.85968ZM57.2541 3.51747H61.3287L64.6069 13.2234H64.8193L68.0975 3.51747H72.0659V3.91413L66.8765 17.3624H62.4569L57.2541 3.91413V3.51747ZM72.3157 10.4333C72.3157 5.60676 75.1692 3.20004 79.4562 3.20004C83.69 3.20004 86.2382 5.67287 86.2382 9.93077V11.5044H76.0452C76.0983 13.3821 77.3193 14.8102 79.4296 14.8102C81.5133 14.8102 82.3628 13.7656 82.5751 12.9193H85.9728V13.316C85.5349 15.2202 83.8094 17.6797 79.496 17.6797C75.1825 17.6797 72.3157 15.2599 72.3157 10.4333ZM76.085 8.85968H82.5883C82.5618 7.29938 81.5399 6.02986 79.403 6.02986C77.3326 6.02986 76.2442 7.33905 76.085 8.85968ZM88.1452 3.51747H91.9145V4.82655H92.1272C93.0559 3.72902 94.4757 3.25303 96.2682 3.25303C99.5859 3.25303 101.603 4.972 101.603 8.39691V17.3624H97.7012V8.72746C97.7012 7.11417 96.8252 6.30762 95.2059 6.30762C93.4539 6.30762 92.0472 7.24649 92.0472 9.61344V17.3624H88.1452V3.51747ZM102.559 3.51747H105.479V0H109.381V3.51747H113.111V6.45307H109.381V14.0036L109.594 14.2151H113.005V17.3624H109.54C107.031 17.3624 105.479 16.04 105.479 13.5805V6.45307H102.559V3.51747ZM114.288 7.40516C114.288 4.89266 116.464 3.22648 120.433 3.22648C124.427 3.22648 126.657 4.89266 126.896 7.4316V7.82826H123.353C123.259 6.43985 122.092 5.97697 120.459 5.97697C118.827 5.97697 117.977 6.46629 117.977 7.3126C117.977 8.17203 118.655 8.4498 119.623 8.60846L122.383 9.05801C125.198 9.52089 127.082 10.6713 127.082 13.1969C127.082 15.7226 125.078 17.6665 120.818 17.6665C116.57 17.6665 114.261 15.7359 114.075 13.3425V12.9457H117.685C117.792 14.321 119.132 14.8895 120.818 14.8895C122.516 14.8895 123.379 14.2945 123.379 13.4086C123.379 12.549 122.702 12.1919 121.507 11.9936L118.747 11.5441C116.079 11.1209 114.288 9.90433 114.288 7.40516ZM43.4194 30.5328C43.4194 26.0765 45.9676 23.5509 49.9094 23.5509C53.8247 23.5509 55.4307 26.0104 55.6165 27.9146V28.3113H54.0105C53.8779 26.817 52.7762 25.0319 49.9227 25.0319C47.0161 25.0319 45.1447 26.9493 45.1447 30.5328C45.1447 34.1163 46.9895 36.0337 49.9227 36.0337C52.8028 36.0337 53.838 34.3148 54.0371 32.6882H55.6563V33.0849C55.4307 35.0552 53.8512 37.5148 49.9094 37.5148C45.941 37.5148 43.4194 34.9891 43.4194 30.5328ZM57.1655 30.5328C57.1655 26.0765 59.7934 23.5509 63.7883 23.5509C67.7965 23.5509 70.4244 26.0765 70.4244 30.5328C70.4244 34.9891 67.7965 37.5148 63.7883 37.5148C59.7934 37.5148 57.1655 34.9891 57.1655 30.5328ZM58.8909 30.5328C58.8909 34.1031 60.8817 36.0337 63.7883 36.0337C66.7082 36.0337 68.6857 34.1031 68.6857 30.5328C68.6857 26.9625 66.7082 25.0319 63.7883 25.0319C60.8817 25.0319 58.8909 26.9625 58.8909 30.5328ZM72.928 23.8682H74.5606V25.4286H74.7729C75.3569 24.5823 76.3921 23.5641 78.9271 23.5641C81.2762 23.5641 82.431 24.5294 82.922 25.8385H83.1344C83.7581 24.6484 85.0456 23.5641 87.6336 23.5641C90.3013 23.5641 92.1059 24.9129 92.1059 27.8485V37.1975H90.4207V27.9939C90.4207 26.0368 89.3594 25.0451 87.3151 25.0451C84.9792 25.0451 83.36 26.4204 83.36 29.2766V37.1975H81.6744V27.9939C81.6744 26.0368 80.6658 25.0451 78.5687 25.0451C76.2329 25.0451 74.6136 26.4204 74.6136 29.2766V37.1975H72.928V23.8682ZM95.3325 23.8682H96.965V25.4286H97.1766C97.761 24.5823 98.796 23.5641 101.331 23.5641C103.68 23.5641 104.835 24.5294 105.326 25.8385H105.539C106.163 24.6484 107.45 23.5641 110.037 23.5641C112.706 23.5641 114.51 24.9129 114.51 27.8485V37.1975H112.825V27.9939C112.825 26.0368 111.763 25.0451 109.719 25.0451C107.383 25.0451 105.765 26.4204 105.765 29.2766V37.1975H104.078V27.9939C104.078 26.0368 103.07 25.0451 100.972 25.0451C98.637 25.0451 97.0176 26.4204 97.0176 29.2766V37.1975H95.3325V23.8682ZM117.736 23.8682H119.435V37.1975H117.736V23.8682ZM117.497 21.3691V19.0549H119.661V21.3691H117.497ZM121.179 23.8682H124.471V20.0863H126.17V23.8682H132.659V20.0863H134.359V23.8682H138.539V25.3493H134.359V35.4387L134.571 35.6503H138.526V37.1975H135.898C133.801 37.1975 132.659 36.1793 132.659 34.1031V25.3493H126.17V35.4387L126.382 35.6503H130.177V37.1975H127.709C125.612 37.1975 124.471 36.1793 124.471 34.1031V25.3493H121.179V23.8682ZM139.634 30.5328C139.634 26.0501 142.077 23.5509 145.979 23.5509C149.907 23.5509 151.991 26.0633 151.991 29.9245V30.8898H141.307C141.36 34.1163 143.138 36.0469 145.966 36.0469C148.646 36.0469 149.92 34.4866 150.133 33.0585H151.699V33.4552C151.433 35.0155 149.947 37.5148 145.979 37.5148C142.103 37.5148 139.634 35.0155 139.634 30.5328ZM141.347 29.4485H150.332C150.305 26.7906 148.805 25.0186 145.966 25.0186C143.179 25.0186 141.532 26.8038 141.347 29.4485ZM153.614 30.5328C153.614 26.0501 156.055 23.5509 159.958 23.5509C163.887 23.5509 165.97 26.0633 165.97 29.9245V30.8898H155.286C155.339 34.1163 157.118 36.0469 159.944 36.0469C162.626 36.0469 163.9 34.4866 164.112 33.0585H165.678V33.4552C165.413 35.0155 163.926 37.5148 159.958 37.5148C156.083 37.5148 153.614 35.0155 153.614 30.5328ZM155.326 29.4485H164.311C164.285 26.7906 162.785 25.0186 159.944 25.0186C157.157 25.0186 155.512 26.8038 155.326 29.4485Z"
            fill="#F4F4F4"
          />
          <path
            d="M30.4685 3.4043C29.2057 3.4043 28.0329 4.05319 27.3713 5.11993L20.2431 15.6073C20.0109 15.9529 20.1052 16.4189 20.4539 16.6491C20.7368 16.8359 21.1108 16.8127 21.3681 16.5932L28.3847 10.5625C28.5013 10.4584 28.6811 10.469 28.7859 10.5846C28.8335 10.6376 28.8587 10.7059 28.8587 10.7761V29.658C28.8587 29.814 28.7315 29.939 28.5741 29.939C28.4895 29.939 28.4099 29.9025 28.3564 29.838L7.1467 4.67896C6.45592 3.87121 5.44158 3.40521 4.37386 3.4043H3.63265C1.62633 3.4043 0 5.01597 0 7.00403V33.5977C0 35.5858 1.62633 37.1973 3.63265 37.1973C4.89561 37.1973 6.06825 36.5485 6.72986 35.4816L13.8581 24.9944C14.0904 24.6487 13.9961 24.1826 13.6473 23.9527C13.3645 23.7659 12.9905 23.7889 12.7331 24.0085L5.71653 30.0393C5.59997 30.1432 5.42031 30.1326 5.31529 30.017C5.26769 29.9642 5.24247 29.8956 5.24338 29.8255V10.9388C5.24338 10.7829 5.37068 10.6578 5.52806 10.6578C5.61161 10.6578 5.69233 10.6944 5.7457 10.7589L26.9526 35.9226C27.6435 36.7305 28.6577 37.1964 29.7253 37.1973H30.4667C32.4728 37.1982 34.1002 35.5876 34.1022 33.5995V7.00403C34.1022 5.01597 32.4758 3.4043 30.4697 3.4043H30.4685Z"
            fill="#F4F4F4"
          />
        </svg>
      </Link>
    </Wrapper>
  );
};

const ProfileIcon = () => {
  const Wrapper = styled.svg`
    padding: 0.25rem;
    @media screen and (max-width: 768px) {
      display: none;
    }
  `;
  return (
    <Link
      to={linkHref({
        widgetSrc: "${REPL_EVENTS}/widget/app",
        params: { page: "profile", accountId: context.accountId },
      })}
    >
      <Widget
        src="${REPL_DEVHUB}/widget/devhub.components.molecule.ProfileCard"
        props={{ iconOnly: true, accountId: context.accountId || null }}
      />
    </Link>
  );
};

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    style={{ height: 20, width: 20 }}
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M2 12.2986H14V13.3732H2V12.2986ZM2 9.07471H14V10.1493H2V9.07471ZM2 5.85083H14V6.92546H2V5.85083ZM2 2.62695H14V3.70158H2V2.62695Z"
      fill="#818181"
    />
  </svg>
);

const Navbar = styled.div`
  padding: 1.5rem 0rem;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  background: rgb(27, 27, 24);

  @media screen and (max-width: 768px) {
    padding: 1.875rem 1.375rem;
  }
`;

const LinksContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.5rem;

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const MobileMenu = styled.button`
  all: unset;
  display: none;

  @media screen and (max-width: 768px) {
    display: block;
  }
`;

let links = [
  {
    title: "Proposals",
    href: "proposals",
    links: [],
  },
  {
    title: "About",
    href: "about",
    links: [],
  },
];

if (hasModerator) {
  const isDevHubModerator = hasModerator({
    account_id: context.accountId,
  });

  if (isDevHubModerator) {
    links = [
      {
        title: "Admin",
        href: "admin",
        links: [],
      },
      ...links,
    ];
  }
}

const MobileNav = styled.div`
  display: none;

  @media screen and (max-width: 768px) {
    display: flex;
  }

  position: absolute;
  top: 0;
  right: 0;

  width: 207px;

  padding: 24px 36px 36px 16px;
  flex-direction: column;
  align-items: flex-end;
  gap: 2.5rem;
  flex-shrink: 0;

  border-radius: 0px 0px 0px 16px;
  background: rgba(41, 41, 41, 0.6);
  backdrop-filter: blur(5px);

  z-index: 50;
`;

const MobileLink = styled.a`
  color: #fff !important;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 100% */
  margin-bottom: 1rem;

  &.active {
    color: #03ba16 !important;
  }

  &:hover {
    text-decoration: none;
    color: #03ba16 !important;
  }
`;

return (
  <Navbar className="position-relative">
    <div className="d-flex justify-content-between container-xl">
      <Logo />
      <div className="d-flex gap-3 align-items-center">
        <LinksContainer>
          {links.map((link) => (
            <Widget
              src="${REPL_EVENTS}/widget/devhub.components.molecule.NavbarDropdown"
              props={{
                title: link.title,
                href: link.href,
                links: link.links,
                page: page,
              }}
            />
          ))}
        </LinksContainer>
        {context.accountId && <ProfileIcon />}
        <MobileMenu onClick={() => setShowMenu(!showMenu)}>
          <MenuIcon />
        </MobileMenu>
      </div>
      {showMenu && (
        <MobileNav>
          <div
            onClick={() => setShowMenu(!showMenu)}
            style={{ cursor: "pointer" }}
          >
            <i
              className="bi bi-x"
              style={{ fontSize: 20, color: "#F4F4F4" }}
            ></i>
          </div>
          <div className="d-flex flex-column gap-2">
            {links.map((link, idx) =>
              link.href ? (
                <MobileLink
                  key={`mobile-link-${idx}`}
                  className={link.href === props.page && "active"}
                  href={`/${REPL_EVENTS}/widget/app?page=${link.href}`}
                >
                  {link.title}
                </MobileLink>
              ) : (
                link.links.map((it, idx) =>
                  it.href.startsWith("http://") ||
                  it.href.startsWith("https://") ? (
                    <MobileLink
                      key={`nested-link-${idx}`}
                      className={link.href === props.page && "active"}
                      href={it.href}
                      target="no_blank"
                    >
                      /{it.title}
                    </MobileLink>
                  ) : (
                    <MobileLink
                      key={`nested-link-${idx}`}
                      className={link.href === props.page && "active"}
                      href={`/${REPL_EVENTS}/widget/app?page=${it.href}`}
                    >
                      /{it.title}
                    </MobileLink>
                  )
                )
              )
            )}
          </div>
        </MobileNav>
      )}
    </div>
  </Navbar>
);
