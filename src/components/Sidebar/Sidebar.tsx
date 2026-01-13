import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { NodesPalette } from './NodesPalette';
import { ToolsPalette } from './ToolsPalette';
import { useUIStore } from '@/store/uiStore';

export function Sidebar() {
  const { sidebarTab, setSidebarTab } = useUIStore();

  return (
    <div className="w-80 border-r bg-background flex flex-col h-full">
      <Tabs value={sidebarTab} onValueChange={(value) => setSidebarTab(value as any)} className="flex flex-col h-full">
        <div className="p-4 border-b">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={sidebarTab === 'nodes' ? 'Search nodes' : 'Search tools'}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value="nodes" className="flex-1 overflow-y-auto m-0">
          <NodesPalette />
        </TabsContent>

        <TabsContent value="tools" className="flex-1 overflow-y-auto m-0">
          <ToolsPalette />
        </TabsContent>
      </Tabs>
    </div>
  );
}
