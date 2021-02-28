import data from "containers/data";

export default function GlobalProvider({ children }) {
  return <data.Provider>{children}</data.Provider>;
}

export { data };
