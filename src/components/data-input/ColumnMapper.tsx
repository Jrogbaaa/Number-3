import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const TEMPLATE_COLUMNS = [
  { key: 'name', required: true, aliases: ['full name', 'contact name', 'first name', 'last name'] },
  { key: 'email', required: true, aliases: ['email address', 'contact email', 'work email'] },
  { key: 'company', required: false, aliases: ['organization', 'business', 'company name'] },
  { key: 'title', required: false, aliases: ['position', 'job title', 'role'] },
  { key: 'source', required: false, aliases: ['lead source', 'origin', 'channel'] },
  { key: 'status', required: false, aliases: ['lead status', 'stage'] },
] as const;

export type TemplateColumn = typeof TEMPLATE_COLUMNS[number]['key'];

interface ColumnMapperProps {
  headers: string[];
  mapping: Record<string, string>;
  onUpdateMapping: (mapping: Record<string, string>) => void;
  onConfirm: () => void;
  sampleData?: Record<string, string>[];
}

export function ColumnMapper({ 
  headers, 
  mapping, 
  onUpdateMapping, 
  onConfirm,
  sampleData 
}: ColumnMapperProps) {
  const [autoMappingDone, setAutoMappingDone] = React.useState(false);

  // Automatically map columns based on similarity
  const autoMapColumns = React.useCallback(() => {
    const newMapping: Record<string, string> = {};
    
    TEMPLATE_COLUMNS.forEach(({ key, aliases }) => {
      // Try to find an exact match first
      let match = headers.find(h => 
        h.toLowerCase() === key.toLowerCase() ||
        aliases.some(a => h.toLowerCase() === a.toLowerCase())
      );
      
      // If no exact match, try fuzzy matching
      if (!match) {
        match = headers.find(h =>
          h.toLowerCase().includes(key.toLowerCase()) ||
          aliases.some(a => h.toLowerCase().includes(a.toLowerCase()))
        );
      }
      
      if (match) {
        newMapping[key] = match;
      }
    });
    
    onUpdateMapping(newMapping);
    setAutoMappingDone(true);
  }, [headers, onUpdateMapping]);

  // Auto-map on first render
  React.useEffect(() => {
    if (!autoMappingDone && headers.length > 0) {
      autoMapColumns();
    }
  }, [autoMappingDone, headers, autoMapColumns]);

  const isValidMapping = React.useMemo(() => {
    return TEMPLATE_COLUMNS
      .filter(col => col.required)
      .every(col => mapping[col.key]);
  }, [mapping]);

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Map Your Columns</h3>
        <p className="text-sm text-gray-500">
          Match your spreadsheet columns to our standard fields
        </p>
      </div>

      <div className="space-y-4">
        {TEMPLATE_COLUMNS.map(({ key, required, aliases }) => (
          <div key={key} className="flex items-center gap-4">
            <div className="w-1/3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{key}</span>
                {required && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Also matches: {aliases.join(', ')}
              </div>
            </div>
            <Select
              value={mapping[key] || ''}
              onValueChange={(value) => {
                onUpdateMapping({ ...mapping, [key]: value });
              }}
            >
              <SelectTrigger className="w-2/3">
                <SelectValue placeholder="Select a column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {sampleData && sampleData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Preview</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {Object.keys(mapping).map(key => (
                    <th key={key} className="p-2 text-left">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleData.slice(0, 3).map((row, i) => (
                  <tr key={i} className="border-b">
                    {Object.keys(mapping).map(key => (
                      <td key={key} className="p-2">
                        {row[mapping[key]] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button
          variant="secondary"
          onClick={autoMapColumns}
        >
          Auto-Map Columns
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!isValidMapping}
        >
          Confirm Mapping
        </Button>
      </div>
    </Card>
  );
} 