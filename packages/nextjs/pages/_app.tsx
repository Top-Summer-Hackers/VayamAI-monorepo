import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";
import { useDarkMode } from "usehooks-ts";
import { WagmiConfig } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { Layout } from "~~/components/vayam-ai";
import { VayamAIContextProvider } from "~~/context/context";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { wagmiClient } from "~~/services/web3/wagmiClient";
import { appChains } from "~~/services/web3/wagmiConnectors";
import "~~/styles/globals.css";

const queryClient = new QueryClient();
const ScaffoldEthApp = ({ Component, pageProps, router }: AppProps) => {
  const price = useNativeCurrencyPrice();
  const setNativeCurrencyPrice = useGlobalState(state => state.setNativeCurrencyPrice);
  // This variable is required for initial client side rendering of correct theme for RainbowKit
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    if (price > 0) {
      setNativeCurrencyPrice(price);
    }
  }, [setNativeCurrencyPrice, price]);

  useEffect(() => {
    setIsDarkTheme(isDarkMode);
  }, [isDarkMode]);

  const isDebugPages = router.pathname === "/debug";

  return (
    <WagmiConfig client={wagmiClient}>
      <NextNProgress />
      <RainbowKitProvider
        chains={appChains.chains}
        avatar={BlockieAvatar}
        theme={isDarkTheme ? darkTheme() : lightTheme()}
      >
        <QueryClientProvider client={queryClient}>
          <div className="flex flex-col min-h-screen">
            {isDebugPages ? (
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="relative flex flex-col flex-1">
                  <Component {...pageProps} />
                </main>
                <Footer />
              </div>
            ) : (
              <VayamAIContextProvider>
                <div className="flex flex-col min-h-screen">
                  <Layout>
                    <main className={`relative flex flex-col flex-1 `}>
                      <Component {...pageProps} />
                    </main>
                  </Layout>
                </div>
              </VayamAIContextProvider>
            )}
          </div>
        </QueryClientProvider>

        <Toaster />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default ScaffoldEthApp;
