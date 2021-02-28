import "styles/globals.scss"; // Global styles
import GlobalProvider from "containers/index"; // Global state provider
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"; // React loader

function MyApp({ Component, pageProps }) {
  return (
    // Wrap application in global state provider
    <GlobalProvider>
      <Component {...pageProps} />;
    </GlobalProvider>
  );
}

export default MyApp;
