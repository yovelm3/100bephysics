// Reads the session / search params on every request.
export const instant = false;

import { Page } from "@/components/ui";
import { safeNext } from "@/lib/site";
import { DeviceCheck } from "./DeviceCheck";

export default async function DevicePage({ searchParams }: PageProps<"/device">) {
  const next = safeNext((await searchParams).next);
  return (
    <Page title="רגע אחד">
      <DeviceCheck next={next} />
    </Page>
  );
}
