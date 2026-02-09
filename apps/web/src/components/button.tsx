import { useDuckDbQuery } from "@sdk-repo/sdk/duck-db";
import { Button as SdkButton } from "@sdk-repo/sdk/components";

export const Button = () => {
  console.log("Initializing DuckDB...");

  const { result, loading } = useDuckDbQuery("SELECT 42 as answer");
  if (!loading) {
    const test = result?.toArray();
    console.log("DuckDB query result:", test?.toString());
    const ans = JSON.parse(JSON.stringify({}));
    console.log("Test query result:", ans);
  }

  return <SdkButton variant="outline">Click Me</SdkButton>;
};
