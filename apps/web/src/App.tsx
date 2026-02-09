import { initializeDuckDb } from "@sdk-repo/sdk/duck-db";
import "@sdk-repo/sdk/styles.css";
import { useEffect } from "react";
import { Button } from "./components/button";

function App() {
  useEffect(() => {
    const config = {
      query: {
        /**
         * By default, int values returned by DuckDb are Int32Array(2).
         * This setting tells DuckDB to cast ints to double instead,
         * so they become JS numbers.
         */
        castBigIntToDouble: true,
      },
    };
    initializeDuckDb({ config, debug: true });
  }, []);

  return (
    <>
      <Button />
    </>
  );
}

export default App;
