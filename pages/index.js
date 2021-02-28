import { useState } from "react"; // State management
import { data } from "containers"; // Global state
import Bottle from "components/Bottle"; // Bottle component
import Layout from "components/Layout"; // Layout wrapper
import Loader from "react-loader-spinner"; // Loading Spinner
import styles from "styles/Home.module.scss"; // Component styles

export default function Home() {
  const {
    mint,
    address,
    unlock,
    loading,
    bottles,
    mintCost,
  } = data.useContainer(); // Global state
  const [localLoading, setLocalLoading] = useState(false); // Local loading state

  /**
   * Mint new NFT with loading
   */
  async function mintWithLoading() {
    setLocalLoading(true); // Toggle loading

    try {
      // Mint
      await mint();
    } catch (error) {
      console.error(error);
    }

    setLocalLoading(false); // Toggle loading
  }

  /**
   * Unlock wallet with loading
   */
  async function unlockWithLoading() {
    setLocalLoading(true); // Toggle loading

    try {
      // Unlock
      await unlock();
    } catch (error) {
      console.error(error);
    }

    setLocalLoading(false); // Toggle loading
  }

  return (
    <Layout>
      <div className={styles.home}>
        {/* Home: description */}
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

        {/* Home: Mint */}
        <div className={styles.home__mint}>
          <h3>Mint a WineFT</h3>
          <div>
            {!loading ? (
              // If not loading, display mint
              <>
                <p>
                  Spend <span>{mintCost} ether</span> to mint a WineFT?
                </p>
                {!address ? (
                  // If not authenticated, display unlock button
                  <button onClick={unlockWithLoading} disabled={localLoading}>
                    {localLoading ? "Connecting..." : "Connect Wallet"}
                  </button>
                ) : (
                  // Else, display mint button
                  <button onClick={mintWithLoading} disabled={localLoading}>
                    {localLoading ? "Minting..." : "Let's sip!"}
                  </button>
                )}
              </>
            ) : (
              // Else, if loading, display loader
              <div className={styles.home__loading}>
                <Loader type="Circles" color="#700940" height={50} width={50} />
              </div>
            )}
          </div>
        </div>

        {/* Home: Existing minted NFTs */}
        <div className={styles.home__existing}>
          <h3>Ageing bottles</h3>

          {!loading ? (
            // If not loading
            <div className={styles.home__existing_bottles}>
              {bottles.map((bottle, i) => {
                // Loop over each bottle in bottles and render
                return <Bottle key={i} bottle={bottle} />;
              })}
            </div>
          ) : (
            // Else, if loading, display loader
            <div className={styles.home__loading}>
              <Loader type="Circles" color="#700940" height={50} width={50} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
