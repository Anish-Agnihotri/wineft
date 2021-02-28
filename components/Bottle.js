import dayjs from "dayjs"; // Day parsing
import { useState } from "react"; // State management
import { data } from "containers"; // Data retrieval
import styles from "styles/Bottle.module.scss"; // Component styles
import relativeTime from "dayjs/plugin/relativeTime"; // Relative time extension for dayjs

// Extend dayjs
dayjs.extend(relativeTime);

export default function Bottle({
  // Collect bottle parameters
  bottle: { id, owner, appearance, nextTransfer, numTransfers },
}) {
  const [to, setTo] = useState(""); // To address
  const [loading, setLoading] = useState(false); // Local loading state
  const { address, transfer } = data.useContainer(); // Collect data from global state

  /**
   * Transfer with loading
   */
  async function transferWithLoading() {
    setLoading(true); // Toggle loading

    try {
      // Transfer tokenId to to address
      await transfer(to, id);
    } catch (error) {
      console.error(error);
    }

    setLoading(false); // Toggle loading
  }

  return (
    <div className={styles.bottle}>
      {/* Bottle image */}
      <img
        src={`https://avatars.dicebear.com/api/jdenticon/${appearance}.svg?b=%237b0041&w=80&h=80`}
        alt="Bottle"
      />

      {/* Bottle owner */}
      <h3>
        Bottle by{" "}
        <a
          href={`https://explorer.arbitrum.io/#/address/${owner}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {owner.substr(0, 5) + "..." + owner.slice(owner.length - 5)}
        </a>
      </h3>

      {/* Bottle transfer statistics */}
      <p>Transferred {numTransfers} time(s).</p>
      <p>
        Transfer available {dayjs(parseInt(nextTransfer) * 1000).fromNow()}.
      </p>

      {address && address == owner ? (
        // If bottle owner, display transfer fields
        <>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x00000"
          />
          <button onClick={transferWithLoading} disabled={loading}>
            {loading
              ? "Transferring..."
              : to !== ""
              ? `Transfer to ${
                  to.substr(0, 5) + "..." + to.slice(to.length - 5)
                }`
              : "Fill to address"}
          </button>
        </>
      ) : null}
    </div>
  );
}
