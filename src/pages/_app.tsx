import type { AppProps } from "next/app";
import { SWRConfig } from "swr";
import { Chakra } from "@/chakra";
import { SpeechCommandProvider } from "@/contexts/SpeechCommandContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <SWRConfig
        value={{
          refreshInterval: 3000,
        }}
      >
        <Chakra cookies={pageProps.cookies}>
          <SpeechCommandProvider>
            <Component {...pageProps} />
          </SpeechCommandProvider>
        </Chakra>
      </SWRConfig>
    </>
  )
}