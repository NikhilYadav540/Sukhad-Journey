"use client";

import GuestOverviewPage from "@/components/GuestOverviewPage";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <GuestOverviewPage
      onContinueAsGuest={() => {
        // Navigates straight to your 1,400-line tourist page in guest mode
        router.push("/tourist");
      }}
      onOpenAuth={() => {
        // Navigates to your tourist page and tells it to open registration
        router.push("/tourist?auth=true");
      }}
    />
  );
}