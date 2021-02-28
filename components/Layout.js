import { data } from "containers";
import Head from "next/head";
import styles from "styles/Layout.module.scss";

export default function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <Meta />

      <Header />

      <div className={styles.layout__content}>{children}</div>
    </div>
  );
}

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

function Header() {
  const { lock, unlock, address } = data.useContainer();

  return (
    <div className={styles.layout__header}>
      <div>
        <img src="/logo.png" alt="WineFT logo" />
      </div>
      <div>
        {address ? (
          <button onClick={lock}>
            <span>
              {address.substr(0, 5) + "..." + address.slice(address.length - 5)}
            </span>
            <img src="/logout.svg" alt="Logout" />
          </button>
        ) : (
          <button onClick={unlock}>Connect Wallet</button>
        )}
      </div>
    </div>
  );
}
