import type { AppProps } from "next/app";
import { SWRConfig } from "swr";
import { Chakra } from "@/chakra";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <SWRConfig
        value={{
          refreshInterval: 3000,
        }}
      >
        <Chakra cookies={pageProps.cookies}>
          <Component {...pageProps} />
        </Chakra>
      </SWRConfig>
      <style jsx global>
        {`
          #__next {
            background: inherit;
          }
        `}
      </style>
    </>
  )
}