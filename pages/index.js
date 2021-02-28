import Bottle from "components/Bottle";
import Layout from "components/Layout";
import { data } from "containers";
import styles from "styles/Home.module.scss";
import { useState } from "react";
import Loader from "react-loader-spinner";

export default function Home() {
  const [localLoading, setLocalLoading] = useState(false);
  const {
    mint,
    address,
    unlock,
    loading,
    bottles,
    mintCost,
  } = data.useContainer();

  async function mintWithLoading() {
    setLocalLoading(true);
    try {
      await mint();
    } catch (error) {
      console.error(error);
    }
    setLocalLoading(false);
  }

  async function unlockWithLoading() {
    setLocalLoading(true);
    try {
      await unlock();
    } catch (error) {
      console.error(error);
    }
    setLocalLoading(false);
  }

  return (
    <Layout>
      <div className={styles.home}>
        <div className={styles.home__description}>
          <p>It's like Wine, but as a fungible token, and it ages.</p>
          <ul>
            <li>
              <p>
                Token minting cost increases exponentially, starting at{" "}
                <span>0.01 ether</span>.
              </p>
            </li>
            <li>
              <p>
                Tokens have a timelock to transfer, starting at{" "}
                <span>1 hour</span>. Each time you transfer, the new owner has a
                timelock of <span>numTransfers ** 2</span> hours (1, 4, 9, ...).
              </p>
            </li>
          </ul>
          <p>
            Deployed on Arbitrum;{" "}
            <a
              href="https://developer.offchainlabs.com/docs/public_testnet"
              target="_blank"
              rel="noopener noreferrer"
            >
              add their RPC
            </a>{" "}
            to play with the DApp.{" "}
            <a
              href="https://github.com/anish-agnihotri/wineft"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Repo
            </a>
            .
          </p>
        </div>

        <div className={styles.home__mint}>
          <h3>Mint a WineFT</h3>
          <div>
            {!loading ? (
              <>
                <p>
                  Spend <span>{mintCost} ether</span> to mint a WineFT?
                </p>
                {!address ? (
                  <button onClick={unlockWithLoading}>
                    {localLoading ? "Connecting..." : "Connect Wallet"}
                  </button>
                ) : (
                  <button onClick={mintWithLoading}>
                    {localLoading ? "Minting..." : "Let's sip!"}
                  </button>
                )}
              </>
            ) : (
              <div className={styles.home__loading}>
                <Loader type="Circles" color="#700940" height={50} width={50} />
              </div>
            )}
          </div>
        </div>

        <div className={styles.home__existing}>
          <h3>Ageing bottles</h3>

          {!loading ? (
            <div className={styles.home__existing_bottles}>
              {bottles.map((bottle, i) => {
                return <Bottle key={i} bottle={bottle} />;
              })}
            </div>
          ) : (
            <div className={styles.home__loading}>
              <Loader type="Circles" color="#700940" height={50} width={50} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
