import data from "containers/data"; // Import data container

// Export global provider to encompass application
export default function GlobalProvider({ children }) {
  return <data.Provider>{children}</data.Provider>;
}

// Export data container
export { data };
