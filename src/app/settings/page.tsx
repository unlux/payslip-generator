"use client";

import { PageHeader } from "@/components/layout/page-header";
import { TemplateManager } from "@/components/settings/template-manager";
import { VisibilitySettings } from "@/components/settings/visibility-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Settings"
        description="Manage company templates and field visibility defaults"
      />
      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="visibility">Field Visibility</TabsTrigger>
        </TabsList>
        <TabsContent value="templates" className="mt-6">
          <TemplateManager />
        </TabsContent>
        <TabsContent value="visibility" className="mt-6">
          <VisibilitySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
