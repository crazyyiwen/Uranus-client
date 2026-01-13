import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench } from 'lucide-react';

export function ToolsPalette() {
  const systemTools = [
    'GetDecisionPoints',
    'testMemory',
    'ContractRecommendation',
    'OrderPageHTML',
    'GetFileById',
  ];

  return (
    <div className="px-4">
      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
          <TabsTrigger value="mcps">MCPs</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-2 mt-4">
          {systemTools.map((tool) => (
            <div
              key={tool}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent hover:shadow-sm cursor-pointer transition-all"
            >
              <div className="p-2 rounded-md bg-blue-500/10 text-blue-500">
                <Wrench className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{tool}</div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="shared" className="mt-4">
          <div className="text-sm text-muted-foreground text-center py-8">
            No shared tools available
          </div>
        </TabsContent>

        <TabsContent value="mcps" className="mt-4">
          <div className="text-sm text-muted-foreground text-center py-8">
            No MCP tools available
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
