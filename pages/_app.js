import "styles/globals.scss";
import GlobalProvider from "containers/index";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

function MyApp({ Component, pageProps }) {
  return (
    <GlobalProvider>
      <Component {...pageProps} />;
    </GlobalProvider>
  );
}

export default MyApp;
