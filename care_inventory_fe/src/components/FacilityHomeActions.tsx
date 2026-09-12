import { BoxesIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

import Page from "./Page";

/** Implements the `FacilityHomeActions` extension point. */
export default function FacilityHomeActions({
  facility,
  className,
}: {
  facility: { id: string };
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <Page>
      <Button variant="primary" size="sm" className={className}>
        <BoxesIcon />
        {t("inventory__action_label")} ({facility.id.slice(0, 8)})
      </Button>
    </Page>
  );
}
