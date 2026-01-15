import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  useDataModelManager,
  DataModelManager,
  subscribeToDataModel,
} from '@/services/dataModelManager.service';
import type { IStorePatch } from '@/types/dataModel.types';

/**
 * Example component demonstrating Data Model Manager usage
 */
export function DataModelExample() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [history, setHistory] = useState<IStorePatch[]>([]);

  // Method 1: Using the hook
  const dataModelManager = useDataModelManager();

  // Method 2: Using the static class (for non-React contexts)
  // DataModelManager.registerDataModel('user', { name: '', email: '' });

  useEffect(() => {
    // Register a data model
    dataModelManager.registerDataModel('user', {
      name: 'John Doe',
      email: 'john@example.com',
      profile: {
        age: 30,
        address: {
          city: 'New York',
          country: 'USA',
        },
      },
    });

    // Subscribe to changes for this specific model
    const unsubscribe = subscribeToDataModel(
      'user',
      (dataModel, patch) => {
        console.log('User data model changed:', dataModel, patch);
        setHistory(dataModelManager.getStoreChanges());
      }
    );

    return () => {
      unsubscribe();
      dataModelManager.deregisterDataModel('user');
    };
  }, []);

  // Get current values
  const currentName = dataModelManager.getIn('user', 'name');
  const currentEmail = dataModelManager.getIn('user', 'email');
  const currentCity = dataModelManager.getIn('user', ['profile', 'address', 'city']);

  const handleUpdateName = () => {
    dataModelManager.setIn('user', 'name', userName);
    setUserName('');
  };

  const handleUpdateEmail = () => {
    dataModelManager.setIn('user', 'email', userEmail);
    setUserEmail('');
  };

  const handleUpdateCity = () => {
    dataModelManager.setIn('user', ['profile', 'address', 'city'], 'Los Angeles');
  };

  const handleUndo = () => {
    const changes = dataModelManager.getStoreChanges();
    if (changes.length > 0) {
      const lastPatch = changes[changes.length - 1];
      dataModelManager.applyPatch(lastPatch.patchId);
    }
  };

  const handleClearHistory = () => {
    dataModelManager.clearHistory();
    setHistory([]);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Data Model Manager Example</h1>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Current Data</h2>
        <div className="space-y-2">
          <p>
            <strong>Name:</strong> {currentName}
          </p>
          <p>
            <strong>Email:</strong> {currentEmail}
          </p>
          <p>
            <strong>City:</strong> {currentCity}
          </p>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Update Data</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="New name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <Button onClick={handleUpdateName}>Update Name</Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="New email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
            <Button onClick={handleUpdateEmail}>Update Email</Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUpdateCity}>Change City to LA</Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">History & Controls</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleUndo} disabled={history.length === 0}>
              Undo Last Change
            </Button>
            <Button
              onClick={handleClearHistory}
              variant="destructive"
              disabled={history.length === 0}
            >
              Clear History
            </Button>
          </div>

          <div>
            <h3 className="font-medium mb-2">Change History ({history.length})</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {history.map((patch) => (
                <div
                  key={patch.patchId}
                  className="p-2 bg-muted rounded text-sm"
                >
                  <div>
                    <strong>Operation:</strong> {patch.operation}
                  </div>
                  <div>
                    <strong>Path:</strong> {patch.patchedPath || 'N/A'}
                  </div>
                  <div>
                    <strong>New Value:</strong>{' '}
                    {JSON.stringify(patch.patchedValue)}
                  </div>
                  <div>
                    <strong>Previous Value:</strong>{' '}
                    {JSON.stringify(patch.previousValue)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(patch.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
