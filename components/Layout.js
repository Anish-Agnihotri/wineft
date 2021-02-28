import Head from "next/head"; // Meta
import { data } from "containers"; // Global state
import styles from "styles/Layout.module.scss"; // Component styles

export default function Layout({ children }) {
  return (
    <div className={styles.layout}>
      {/* Metadata */}
      <Meta />

      {/* Header */}
      <Header />

      {/* Content container encompassing children */}
      <div className={styles.layout__content}>{children}</div>
    </div>
  );
}

// Meta content
function Meta() {
  return (
    <Head>
      <title>WineFT</title>
      <meta name="title" content="WineFT" />
      <meta
        name="description"
        content="It's like Wine, but as a fungible token, and it ages. NFTs with progressively increasing timelocks, per transfer."
      />

      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://wineft.bar/" />
      <meta property="og:title" content="WineFT" />
      <meta
        property="og:description"
        content="It's like Wine, but as a fungible token, and it ages. NFTs with progressively increasing timelocks, per transfer."
      />
      <meta property="og:image" content="https://wineft.bar/meta.png" />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://wineft.bar/" />
      <meta property="twitter:title" content="WineFT" />
      <meta
        property="twitter:description"
        content="It's like Wine, but as a fungible token, and it ages. NFTs with progressively increasing timelocks, per transfer."
      />
      <meta property="twitter:image" content="https://wineft.bar/meta.png" />

      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}

// Header
function Header() {
  const { lock, unlock, address } = data.useContainer(); // Global state

  return (
    <div className={styles.layout__header}>
      {/* Logo */}
      <div>
        <img src="/logo.png" alt="WineFT logo" />
      </div>

      {/* Authenticate */}
      <div>
        {address ? (
          // If authenticated, display disconnect button
          <button onClick={lock}>
            <span>
              {address.substr(0, 5) + "..." + address.slice(address.length - 5)}
            </span>
            <img src="/logout.svg" alt="Logout" />
          </button>
        ) : (
          // Else display connect button
          <button onClick={unlock}>Connect Wallet</button>
        )}
      </div>
    </div>
  );
}
