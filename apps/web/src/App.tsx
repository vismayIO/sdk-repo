import { Suspense } from "react";
import { Button } from "./components/button";
import "@sdk-repo/sdk/styles.css";

function App() {
  return (
    <>
      <Suspense fallback="Loading...">
        <Button />
      </Suspense>
    </>
  );
}

export default App;
