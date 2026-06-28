import { notFound } from "next/navigation";
import { APP_MODULES } from "@/lib/constants";
import ScriptWriterPage from "@/app/dashboard/script-writer/page";
import ContentIdeasPage from "@/app/dashboard/content-ideas/page";
import CompetitorIntelPage from "@/app/dashboard/competitor-intel/page";
import VideoBriefPage from "@/app/dashboard/video-brief/page";
import PageSetupPage from "@/app/dashboard/page-setup/page";
import GrowthStrategyPage from "@/app/dashboard/growth-strategy/page";

const modulePages: Record<string, React.FC<{ appId: string }>> = {
  "script-writer": ScriptWriterPage,
  "content-ideas": ContentIdeasPage,
  "competitor-intel": CompetitorIntelPage,
  "video-brief": VideoBriefPage,
  "page-setup": PageSetupPage,
  "growth-strategy": GrowthStrategyPage,
};

export default async function AppModulePage({
  params,
}: {
  params: Promise<{ appId: string; moduleId: string }>;
}) {
  const { appId, moduleId } = await params;

  const appModules = APP_MODULES[appId];
  if (!appModules) notFound();

  const mod = appModules.find((m) => m.id === moduleId);
  if (!mod) notFound();

  const Page = modulePages[moduleId];
  if (!Page) notFound();

  return <Page appId={appId} />;
}
